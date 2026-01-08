# Advanced Examples

Beyond the basics - advanced patterns and features for your Neo4j DataAPI GraphQL application.

## Table of Contents

1. [Pagination](#pagination)
2. [Infinite Scroll](#infinite-scroll)
3. [Optimistic Updates](#optimistic-updates)
4. [Batch Operations](#batch-operations)
5. [Advanced Search & Filtering](#advanced-search--filtering)
6. [Real-time Updates](#real-time-updates)
7. [Export Data](#export-data)
8. [Import Data](#import-data)

---

## Pagination

### Offset-based Pagination

```typescript
// queries
export const GET_MOVIES_PAGINATED = gql`
  query GetMoviesPaginated($limit: Int!, $offset: Int!) {
    movies(
      options: { 
        limit: $limit
        offset: $offset
        sort: [{ released: DESC }]
      }
    ) {
      title
      released
      tagline
    }
    moviesAggregate {
      count
    }
  }
`;

// Component
function PaginatedMovieList() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['movies', 'paginated', page],
    queryFn: () =>
      graphqlClient.request(GET_MOVIES_PAGINATED, {
        limit: pageSize,
        offset: page * pageSize
      })
  });

  const totalPages = Math.ceil((data?.moviesAggregate.count || 0) / pageSize);

  return (
    <div>
      <MovieList movies={data?.movies || []} />
      
      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        
        <span>Page {page + 1} of {totalPages}</span>
        
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Cursor-based Pagination

```typescript
// Better for real-time data
export const GET_MOVIES_CURSOR = gql`
  query GetMoviesCursor($limit: Int!, $after: String) {
    moviesConnection(
      first: $limit
      after: $after
    ) {
      edges {
        node {
          title
          released
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function CursorPaginatedMovies() {
  const [cursor, setCursor] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['movies', 'cursor', cursor],
    queryFn: () =>
      graphqlClient.request(GET_MOVIES_CURSOR, {
        limit: 20,
        after: cursor
      })
  });

  const movies = data?.moviesConnection.edges.map(edge => edge.node) || [];
  const hasNext = data?.moviesConnection.pageInfo.hasNextPage;
  const nextCursor = data?.moviesConnection.pageInfo.endCursor;

  return (
    <div>
      <MovieList movies={movies} />
      {hasNext && (
        <button onClick={() => setCursor(nextCursor)}>
          Load More
        </button>
      )}
    </div>
  );
}
```

---

## Infinite Scroll

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

function InfiniteMovieList() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['movies', 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      graphqlClient.request(GET_MOVIES_PAGINATED, {
        limit: 20,
        offset: pageParam
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.length * 20;
      const totalCount = lastPage.moviesAggregate.count;
      return loadedCount < totalCount ? loadedCount : undefined;
    }
  });

  // Fetch next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const movies = data?.pages.flatMap(page => page.movies) || [];

  return (
    <div>
      {movies.map(movie => (
        <MovieCard key={movie.title} movie={movie} />
      ))}
      
      {/* Sentinel element */}
      {hasNextPage && (
        <div ref={ref} style={{ height: '20px' }}>
          {isFetchingNextPage ? 'Loading more...' : ''}
        </div>
      )}
    </div>
  );
}
```

---

## Optimistic Updates

```typescript
function useOptimisticMovieUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MovieFormData) =>
      graphqlClient.request(UPDATE_MOVIE, data),
    
    onMutate: async (newMovie) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['movies'] });

      // Snapshot current value
      const previousMovies = queryClient.getQueryData(['movies']);

      // Optimistically update
      queryClient.setQueryData(['movies'], (old: any) => ({
        movies: old.movies.map((movie: Movie) =>
          movie.title === newMovie.title
            ? { ...movie, ...newMovie }
            : movie
        )
      }));

      return { previousMovies };
    },

    onError: (err, newMovie, context) => {
      // Rollback on error
      queryClient.setQueryData(['movies'], context?.previousMovies);
      
      // Show error toast
      toast.error('Failed to update movie');
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });
}

// Usage
function MovieForm({ movie }: { movie: Movie }) {
  const updateMovie = useOptimisticMovieUpdate();
  
  const handleSubmit = (data: MovieFormData) => {
    updateMovie.mutate(data, {
      onSuccess: () => {
        toast.success('Movie updated!');
      }
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Batch Operations

### Batch Create Movies

```typescript
export const CREATE_MOVIES_BATCH = gql`
  mutation CreateMoviesBatch($movies: [MovieCreateInput!]!) {
    createMovies(input: $movies) {
      movies {
        title
        released
      }
    }
  }
`;

function BatchMovieImport() {
  const [movies, setMovies] = useState<MovieFormData[]>([]);

  const batchCreate = useMutation({
    mutationFn: (movies: MovieFormData[]) =>
      graphqlClient.request(CREATE_MOVIES_BATCH, { movies }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success(`Created ${movies.length} movies!`);
    }
  });

  const handleCSVUpload = async (file: File) => {
    const text = await file.text();
    const rows = text.split('\n').slice(1); // Skip header
    
    const moviesData = rows.map(row => {
      const [title, released, tagline] = row.split(',');
      return {
        title,
        released: parseInt(released),
        tagline
      };
    });

    batchCreate.mutate(moviesData);
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleCSVUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
```

### Batch Delete

```typescript
export const DELETE_MOVIES_BATCH = gql`
  mutation DeleteMoviesBatch($titles: [String!]!) {
    deleteMovies(where: { title_IN: $titles }) {
      nodesDeleted
    }
  }
`;

function MovieListWithBatchDelete() {
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);

  const batchDelete = useMutation({
    mutationFn: (titles: string[]) =>
      graphqlClient.request(DELETE_MOVIES_BATCH, { titles }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success(`Deleted ${data.deleteMovies.nodesDeleted} movies`);
      setSelectedMovies([]);
    }
  });

  const handleBatchDelete = () => {
    if (window.confirm(`Delete ${selectedMovies.length} movies?`)) {
      batchDelete.mutate(selectedMovies);
    }
  };

  return (
    <div>
      <button 
        onClick={handleBatchDelete}
        disabled={selectedMovies.length === 0}
      >
        Delete Selected ({selectedMovies.length})
      </button>
      
      {movies.map(movie => (
        <div key={movie.title}>
          <input
            type="checkbox"
            checked={selectedMovies.includes(movie.title)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedMovies([...selectedMovies, movie.title]);
              } else {
                setSelectedMovies(selectedMovies.filter(t => t !== movie.title));
              }
            }}
          />
          {movie.title}
        </div>
      ))}
    </div>
  );
}
```

---

## Advanced Search & Filtering

### Multi-field Search with Filters

```typescript
export const ADVANCED_SEARCH = gql`
  query AdvancedSearch(
    $searchTerm: String
    $yearFrom: Int
    $yearTo: Int
    $hasActors: Boolean
  ) {
    movies(
      where: {
        AND: [
          {
            OR: [
              { title_CONTAINS: $searchTerm }
              { tagline_CONTAINS: $searchTerm }
              { actors_SOME: { name_CONTAINS: $searchTerm } }
            ]
          }
          { released_GTE: $yearFrom }
          { released_LTE: $yearTo }
          { actors: $hasActors ? { } : null }
        ]
      }
      options: { sort: [{ released: DESC }] }
    ) {
      title
      released
      tagline
      actors {
        name
      }
    }
  }
`;

interface SearchFilters {
  searchTerm?: string;
  yearFrom?: number;
  yearTo?: number;
  hasActors?: boolean;
  sortBy?: 'title' | 'released';
  sortOrder?: 'ASC' | 'DESC';
}

function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    yearFrom: 1990,
    yearTo: 2024
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search', 'advanced', filters],
    queryFn: () => graphqlClient.request(ADVANCED_SEARCH, filters),
    enabled: !!filters.searchTerm || filters.yearFrom !== undefined
  });

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.searchTerm || ''}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        />
        
        <input
          type="number"
          placeholder="Year from"
          value={filters.yearFrom || ''}
          onChange={(e) => setFilters({ 
            ...filters, 
            yearFrom: parseInt(e.target.value) 
          })}
        />
        
        <input
          type="number"
          placeholder="Year to"
          value={filters.yearTo || ''}
          onChange={(e) => setFilters({ 
            ...filters, 
            yearTo: parseInt(e.target.value) 
          })}
        />
        
        <label>
          <input
            type="checkbox"
            checked={filters.hasActors || false}
            onChange={(e) => setFilters({ 
              ...filters, 
              hasActors: e.target.checked 
            })}
          />
          Has actors
        </label>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <MovieList movies={data?.movies || []} />
      )}
    </div>
  );
}
```

### Faceted Search

```typescript
export const SEARCH_WITH_AGGREGATIONS = gql`
  query SearchWithAggregations($searchTerm: String) {
    movies(where: { title_CONTAINS: $searchTerm }) {
      title
      released
    }
    moviesAggregate(where: { title_CONTAINS: $searchTerm }) {
      count
      released {
        min
        max
        average
      }
    }
  }
`;

function FacetedSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data } = useQuery({
    queryKey: ['search', 'faceted', searchTerm],
    queryFn: () => graphqlClient.request(SEARCH_WITH_AGGREGATIONS, { searchTerm }),
    enabled: searchTerm.length > 0
  });

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {data && (
        <div className="facets">
          <div>Total: {data.moviesAggregate.count}</div>
          <div>Year range: {data.moviesAggregate.released.min} - {data.moviesAggregate.released.max}</div>
          <div>Average year: {data.moviesAggregate.released.average.toFixed(0)}</div>
        </div>
      )}
      
      <MovieList movies={data?.movies || []} />
    </div>
  );
}
```

---

## Export Data

### Export to CSV

```typescript
function ExportMovies() {
  const { data } = useQuery({
    queryKey: ['movies', 'all'],
    queryFn: () => graphqlClient.request(GET_ALL_MOVIES)
  });

  const exportToCSV = () => {
    if (!data?.movies) return;

    const headers = ['Title', 'Released', 'Tagline', 'Actors', 'Directors'];
    const rows = data.movies.map(movie => [
      movie.title,
      movie.released,
      movie.tagline || '',
      movie.actors?.map(a => a.name).join('; ') || '',
      movie.directors?.map(d => d.name).join('; ') || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movies-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={exportToCSV}>
      Export to CSV
    </button>
  );
}
```

### Export to JSON

```typescript
function ExportToJSON() {
  const exportJSON = async () => {
    const data = await graphqlClient.request(GET_ALL_MOVIES);
    
    const json = JSON.stringify(data.movies, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movies-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <button onClick={exportJSON}>Export to JSON</button>;
}
```

---

## Import Data

### Import from CSV

```typescript
function ImportMoviesFromCSV() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImport = async (file: File) => {
    setImporting(true);
    
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    const movies: MovieFormData[] = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        title: values[0].replace(/"/g, ''),
        released: parseInt(values[1]),
        tagline: values[2].replace(/"/g, '')
      };
    });

    // Import in batches of 50
    const batchSize = 50;
    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);
      
      await graphqlClient.request(CREATE_MOVIES_BATCH, { 
        movies: batch 
      });
      
      setProgress(Math.min(100, ((i + batchSize) / movies.length) * 100));
    }

    setImporting(false);
    toast.success(`Imported ${movies.length} movies!`);
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImport(e.target.files[0]);
          }
        }}
        disabled={importing}
      />
      
      {importing && (
        <div>
          <div>Importing... {progress.toFixed(0)}%</div>
          <progress value={progress} max={100} />
        </div>
      )}
    </div>
  );
}
```

---

## Performance Tips

### 1. Request Splitting

For complex queries, split into multiple smaller requests:

```typescript
function MovieDetails({ title }: { title: string }) {
  // Fetch basic info immediately
  const { data: movie } = useQuery({
    queryKey: ['movie', title],
    queryFn: () => graphqlClient.request(GET_MOVIE_BASIC, { title })
  });

  // Fetch actors in parallel
  const { data: actors } = useQuery({
    queryKey: ['movie', title, 'actors'],
    queryFn: () => graphqlClient.request(GET_MOVIE_ACTORS, { title })
  });

  // Fetch directors in parallel
  const { data: directors } = useQuery({
    queryKey: ['movie', title, 'directors'],
    queryFn: () => graphqlClient.request(GET_MOVIE_DIRECTORS, { title })
  });

  return <MovieCard movie={movie} actors={actors} directors={directors} />;
}
```

### 2. Prefetching

```typescript
function MovieListWithPrefetch() {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = (movieTitle: string) => {
    // Prefetch movie details on hover
    queryClient.prefetchQuery({
      queryKey: ['movie', movieTitle],
      queryFn: () => graphqlClient.request(GET_MOVIE, { title: movieTitle })
    });
  };

  return (
    <div>
      {movies.map(movie => (
        <div 
          key={movie.title}
          onMouseEnter={() => handleMouseEnter(movie.title)}
        >
          {movie.title}
        </div>
      ))}
    </div>
  );
}
```

---

## Conclusion

These advanced patterns help you build production-ready applications with:
- Better UX through pagination and infinite scroll
- Improved performance with optimistic updates
- Powerful search and filtering capabilities
- Data import/export functionality
- Smart prefetching and caching strategies

Start with the basics from the quick start guide, then gradually adopt these patterns as your application grows!
