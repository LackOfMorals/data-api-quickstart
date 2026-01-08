# Best Practices & Patterns

Guidelines for building production-ready applications with Neo4j DataAPI GraphQL, React, and graphql-request.

## GraphQL Query Design

### 1. Use Fragments Inline (graphql-request)

Since graphql-request doesn't support fragment composition like Apollo Client, define fragments inline:

```typescript
// Good - Inline fragments
export const GET_MOVIES = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  query GetMovies($limit: Int) {
    movies(options: { limit: $limit }) {
      ...MovieFields
    }
  }
`;
```

### 2. Request Only What You Need

Don't fetch unnecessary fields:

```typescript
// Bad - Fetching too much
query GetMovies {
  movies {
    title
    released
    tagline
    actors {
      name
      born
      moviesActedIn {  // Unnecessary deep nesting
        title
      }
    }
  }
}

// Good - Only what's displayed
query GetMovies {
  movies {
    title
    released
  }
}
```

### 3. Use Variables for Dynamic Queries

Never interpolate values directly into query strings:

```typescript
// Bad - Vulnerable to injection, no type safety
const query = gql`
  query {
    movies(where: { title: "${userInput}" }) {
      title
    }
  }
`;

// Good - Use variables
const query = gql`
  query GetMovie($title: String!) {
    movies(where: { title: $title }) {
      title
    }
  }
`;
```

### 4. Implement Pagination Early

Even if your dataset is small now:

```typescript
export const GET_MOVIES = gql`
  query GetMovies($limit: Int!, $offset: Int!) {
    movies(
      options: { 
        limit: $limit
        offset: $offset
        sort: [{ released: DESC }]
      }
    ) {
      title
      released
    }
    moviesAggregate {
      count
    }
  }
`;
```

## React Query Patterns

### 1. Consistent Query Keys

Use descriptive, consistent query keys:

```typescript
// Good
const queryKey = ['movies', { limit, offset, sortBy }];
const queryKey = ['movie', movieTitle];
const queryKey = ['search', 'movies', searchTerm];

// Bad
const queryKey = ['data'];
const queryKey = ['movies123'];
```

### 2. Proper Cache Invalidation

Invalidate related queries after mutations:

```typescript
const createMovieMutation = useMutation({
  mutationFn: async (data) =>
    graphqlClient.request(CREATE_MOVIE, data),
  onSuccess: () => {
    // Invalidate all movie queries
    queryClient.invalidateQueries({ queryKey: ['movies'] });
    // Also invalidate search if it includes movies
    queryClient.invalidateQueries({ queryKey: ['search'] });
  }
});
```

### 3. Error Handling

Provide meaningful error messages:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['movies'],
  queryFn: async () => {
    try {
      return await graphqlClient.request(GET_MOVIES, { limit: 50 });
    } catch (err) {
      // Transform error for better UX
      if (err.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      }
      throw err;
    }
  }
});

// In component
if (error) {
  return (
    <div className="error">
      <p>Error: {error.message}</p>
      <button onClick={() => refetch()}>Try Again</button>
    </div>
  );
}
```

### 4. Loading States

Distinguish between initial loading and refetching:

```typescript
const { data, isLoading, isFetching, isRefetching } = useQuery({
  queryKey: ['movies'],
  queryFn: () => graphqlClient.request(GET_MOVIES)
});

// Show different UI states
if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage />;

return (
  <div>
    {isFetching && !isRefetching && <RefreshIndicator />}
    <MovieList movies={data.movies} />
  </div>
);
```

### 5. Optimistic Updates

For better UX, update UI immediately:

```typescript
const deleteMovieMutation = useMutation({
  mutationFn: (title: string) =>
    graphqlClient.request(DELETE_MOVIE, { title }),
  
  onMutate: async (title) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ['movies'] });
    
    // Snapshot current data
    const previousMovies = queryClient.getQueryData(['movies']);
    
    // Optimistically update
    queryClient.setQueryData(['movies'], (old: any) => ({
      movies: old.movies.filter((m: Movie) => m.title !== title)
    }));
    
    return { previousMovies };
  },
  
  onError: (err, title, context) => {
    // Rollback on error
    queryClient.setQueryData(['movies'], context?.previousMovies);
  },
  
  onSettled: () => {
    // Always refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['movies'] });
  }
});
```

## Component Architecture

### 1. Separate Data Fetching from Presentation

```typescript
// Container Component (data fetching)
function MovieListContainer() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: () => graphqlClient.request(GET_MOVIES)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <MovieListPresentation movies={data.movies} />;
}

// Presentation Component (pure UI)
interface MovieListPresentationProps {
  movies: Movie[];
}

function MovieListPresentation({ movies }: MovieListPresentationProps) {
  return (
    <div className="movie-list">
      {movies.map(movie => (
        <MovieCard key={movie.title} movie={movie} />
      ))}
    </div>
  );
}
```

### 2. Colocate Queries with Components

Keep GraphQL operations near the components that use them:

```
components/
├── MovieList/
│   ├── MovieList.tsx
│   ├── MovieList.queries.ts
│   └── MovieList.types.ts
├── MovieForm/
│   ├── MovieForm.tsx
│   ├── MovieForm.mutations.ts
│   └── MovieForm.types.ts
```

### 3. Create Reusable Hooks

Extract common data fetching logic:

```typescript
// hooks/useMovies.ts
export function useMovies(options?: { limit?: number }) {
  return useQuery({
    queryKey: ['movies', options],
    queryFn: () => 
      graphqlClient.request(GET_MOVIES, { 
        limit: options?.limit || 50 
      })
  });
}

// hooks/useCreateMovie.ts
export function useCreateMovie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MovieFormData) =>
      graphqlClient.request(CREATE_MOVIE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });
}

// Usage in component
function MovieForm() {
  const createMovie = useCreateMovie();
  
  const handleSubmit = (data: MovieFormData) => {
    createMovie.mutate(data);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Type Safety

### 1. Generate Types from Schema

Use tools like GraphQL Code Generator:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript
```

```yaml
# codegen.yml
schema: ${NEO4J_GRAPHQL_URL}
documents: 'src/**/*.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
```

### 2. Type GraphQL Responses

```typescript
// Define response types
interface GetMoviesResponse {
  movies: Movie[];
}

interface CreateMovieResponse {
  createMovies: {
    movies: Movie[];
  };
}

// Use in queries
const { data } = useQuery({
  queryKey: ['movies'],
  queryFn: async () => 
    graphqlClient.request<GetMoviesResponse>(GET_MOVIES)
});

// data is properly typed!
const movies: Movie[] = data?.movies || [];
```

### 3. Strict Null Checking

Handle potential undefined/null values:

```typescript
// Good
{movie.actors?.map(actor => actor.name).join(', ') || 'No actors'}

// Better - with type guard
const actorNames = movie.actors && movie.actors.length > 0
  ? movie.actors.map(a => a.name).join(', ')
  : 'No actors listed';
```

## Performance Optimization

### 1. Implement Virtual Scrolling

For large lists:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function MovieList({ movies }: { movies: Movie[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <MovieCard 
            key={virtualRow.key}
            movie={movies[virtualRow.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. Debounce Search Inputs

```typescript
import { useDebouncedValue } from '@mantine/hooks'; // or implement your own

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm] = useDebouncedValue(searchTerm, 300);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedTerm],
    queryFn: () => graphqlClient.request(SEARCH_ALL, { 
      searchTerm: debouncedTerm 
    }),
    enabled: debouncedTerm.length > 2
  });
  
  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

### 3. Configure Stale Time

Reduce unnecessary refetches:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

## Security Best Practices

### 1. Never Expose Tokens Client-Side

```typescript
// Bad - Token in client code
const client = new GraphQLClient('https://api.example.com', {
  headers: {
    authorization: 'Bearer hardcoded-token-here'
  }
});

// Good - Token from environment variable
const client = new GraphQLClient(
  import.meta.env.VITE_NEO4J_GRAPHQL_URL,
  {
    headers: {
      authorization: `Bearer ${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`
    }
  }
);
```

### 2. Validate User Input

```typescript
const createMovieMutation = useMutation({
  mutationFn: async (data: MovieFormData) => {
    // Validate before sending
    if (!data.title || data.title.length > 200) {
      throw new Error('Invalid title');
    }
    
    if (data.released && (data.released < 1800 || data.released > 2100)) {
      throw new Error('Invalid year');
    }
    
    return graphqlClient.request(CREATE_MOVIE, data);
  }
});
```

### 3. Handle Rate Limiting

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false;
        }
        // Retry 429 (rate limit) with exponential backoff
        if (error.response?.status === 429) {
          return failureCount < 3;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

## Testing

### 1. Mock GraphQL Requests

```typescript
import { graphqlClient } from '../lib/graphql-client';

jest.mock('../lib/graphql-client', () => ({
  graphqlClient: {
    request: jest.fn()
  }
}));

test('displays movies', async () => {
  (graphqlClient.request as jest.Mock).mockResolvedValue({
    movies: [
      { title: 'The Matrix', released: 1999 }
    ]
  });
  
  render(<MovieList />);
  
  expect(await screen.findByText('The Matrix')).toBeInTheDocument();
});
```

### 2. Test Components with React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

## Deployment

### 1. Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'graphql-vendor': ['graphql', 'graphql-request']
        }
      }
    }
  }
});
```

### 2. Environment Variables

Use different tokens for dev/staging/production:

```bash
# .env.development
VITE_NEO4J_GRAPHQL_URL=https://dev.instance.neo4j.io/graphql
VITE_NEO4J_GRAPHQL_TOKEN=dev-token

# .env.production
VITE_NEO4J_GRAPHQL_URL=https://prod.instance.neo4j.io/graphql
VITE_NEO4J_GRAPHQL_TOKEN=prod-token
```

### 3. Error Tracking

Integrate error tracking service:

```typescript
import * as Sentry from "@sentry/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        Sentry.captureException(error);
      }
    },
    mutations: {
      onError: (error) => {
        Sentry.captureException(error);
      }
    }
  }
});
```

## Summary

Following these patterns will help you build:
- ✅ Type-safe applications
- ✅ Performant UIs
- ✅ Maintainable codebases
- ✅ Secure implementations
- ✅ Testable components

Remember: Start simple, add complexity only when needed!
