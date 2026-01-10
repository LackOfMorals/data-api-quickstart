# Chapter 7: Search and Filter

Search is one of the most powerful features in a graph database. In this chapter, you'll implement flexible search across movies, actors, and directors using GraphQL's filtering capabilities.

## Understanding GraphQL Filtering

Neo4j's GraphQL library provides powerful filtering operators:

- **`CONTAINS`**: Partial text matching (case-insensitive)
- **`STARTS_WITH`** / **`ENDS_WITH`**: Prefix/suffix matching
- **`IN`**: Match from a list of values
- **`_SOME`** / **`_ALL`** / **`_NONE`**: Filter on related nodes
- **`OR`** / **`AND`**: Combine multiple conditions

Example:
```graphql
movies(
  where: {
    OR: [
      { title_CONTAINS: "matrix" }
      { actors_SOME: { name_CONTAINS: "keanu" } }
    ]
  }
)
```

## Add Search Query

Update `src/graphql/operations.ts`:

```typescript
// Add after GET_PEOPLE

export const SEARCH_ALL = gql`
  query SearchAll($searchTerm: String!) {
    movies(
      where: {
        OR: [
          { title_CONTAINS: $searchTerm }
          { tagline_CONTAINS: $searchTerm }
          { actors_SOME: { name_CONTAINS: $searchTerm } }
          { directors_SOME: { name_CONTAINS: $searchTerm } }
        ]
      }
      options: { sort: [{ released: DESC }] }
    ) {
      title
      released
      tagline
      actors {
        name
        born
      }
      directors {
        name
        born
      }
    }
  }
`;
```

This query searches across:
- Movie titles
- Movie taglines
- Actor names
- Director names

## Create Search Component

Create `src/components/Search.tsx`:

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { SEARCH_ALL } from '../graphql/operations';
import { Movie } from '../types/movie';

interface SearchResponse {
  movies: Movie[];
}

interface SearchProps {
  onSelectMovie?: (movie: Movie) => void;
}

export function Search({ onSelectMovie }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', activeSearch],
    queryFn: async () =>
      graphqlClient.request<SearchResponse>(SEARCH_ALL, { 
        searchTerm: activeSearch 
      }),
    enabled: activeSearch.length > 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      setActiveSearch(searchTerm);
    } else {
      alert('Please enter at least 2 characters to search');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setActiveSearch('');
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search movies, actors, directors..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-search">
          Search
        </button>
        {activeSearch && (
          <button 
            type="button" 
            onClick={handleClear}
            className="btn-clear"
          >
            Clear
          </button>
        )}
      </form>

      {isLoading && (
        <div className="search-status">Searching...</div>
      )}

      {error && (
        <div className="search-error">
          Error searching: {error.message}
        </div>
      )}
      
      {activeSearch && data && (
        <div className="search-results">
          <div className="results-header">
            <h3>
              Found {data.movies.length} result{data.movies.length !== 1 ? 's' : ''}
              {data.movies.length > 0 && ` for "${activeSearch}"`}
            </h3>
          </div>

          {data.movies.length === 0 ? (
            <div className="no-results">
              <p>No movies found matching "{activeSearch}"</p>
              <p>Try searching for:</p>
              <ul>
                <li>Movie titles (e.g., "Matrix")</li>
                <li>Actor names (e.g., "Keanu")</li>
                <li>Director names (e.g., "Wachowski")</li>
                <li>Keywords in taglines</li>
              </ul>
            </div>
          ) : (
            <div className="results-grid">
              {data.movies.map((movie) => (
                <div 
                  key={movie.title} 
                  className={`search-result-card ${onSelectMovie ? 'clickable' : ''}`}
                  onClick={() => onSelectMovie?.(movie)}
                >
                  <h4>
                    {highlightMatch(movie.title, searchTerm)}
                  </h4>
                  
                  {movie.released && (
                    <p className="result-year">{movie.released}</p>
                  )}
                  
                  {movie.tagline && (
                    <p className="result-tagline">
                      {highlightMatch(movie.tagline, searchTerm)}
                    </p>
                  )}
                  
                  {movie.actors && movie.actors.length > 0 && (
                    <div className="result-people">
                      <strong>Cast:</strong>{' '}
                      <span>
                        {movie.actors.map((actor, i) => (
                          <span key={actor.name}>
                            {i > 0 && ', '}
                            {highlightMatch(actor.name, searchTerm)}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                  
                  {movie.directors && movie.directors.length > 0 && (
                    <div className="result-people">
                      <strong>Director:</strong>{' '}
                      <span>
                        {movie.directors.map((dir, i) => (
                          <span key={dir.name}>
                            {i > 0 && ', '}
                            {highlightMatch(dir.name, searchTerm)}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Add Search to App

Update `src/App.tsx` to include search:

```typescript
import { useState } from 'react';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { RelationshipManager } from './components/RelationshipManager';
import { Search } from './components/Search';
import { Movie } from './types/movie';
import './App.css';

function App() {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'manage'>('list');
  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('edit');
  };

  const handleManage = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('manage');
  };

  const handleSelectFromSearch = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('manage');
  };

  const handleComplete = () => {
    setView('list');
    setSelectedMovie(undefined);
  };

  return (
    <div className="app">
      <header>
        <h1>🎬 Movie Manager</h1>
        <nav>
          <button 
            onClick={() => setView('list')}
            className={view === 'list' ? 'active' : ''}
          >
            Movies
          </button>
          <button 
            onClick={() => {
              setSelectedMovie(undefined);
              setView('create');
            }}
            className={view === 'create' ? 'active' : ''}
          >
            Add Movie
          </button>
        </nav>
      </header>

      {view === 'list' && (
        <Search onSelectMovie={handleSelectFromSearch} />
      )}
      
      <main>
        {view === 'list' && (
          <MovieList onEdit={handleEdit} onManage={handleManage} />
        )}
        {view === 'create' && (
          <MovieForm onComplete={handleComplete} />
        )}
        {view === 'edit' && selectedMovie && (
          <MovieForm movie={selectedMovie} onComplete={handleComplete} />
        )}
        {view === 'manage' && selectedMovie && (
          <RelationshipManager 
            movie={selectedMovie} 
            onComplete={handleComplete} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
```

## Add Search Styles

Add to `src/App.css`:

```css
/* Search Styles */

.search-container {
  margin-bottom: 32px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-search {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-search:hover {
  background: #2563eb;
}

.btn-clear {
  padding: 12px 20px;
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.search-status,
.search-error {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  text-align: center;
}

.search-status {
  background: #f0f9ff;
  color: #0369a1;
}

.search-error {
  background: #fee2e2;
  color: #dc2626;
}

.search-results {
  margin-top: 24px;
}

.results-header {
  margin-bottom: 20px;
}

.results-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.no-results p {
  margin-bottom: 16px;
}

.no-results ul {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
}

.no-results li {
  padding: 8px 0;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.search-result-card {
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.search-result-card.clickable {
  cursor: pointer;
}

.search-result-card.clickable:hover {
  background: white;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-result-card h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 1.125rem;
}

.search-result-card mark {
  background: #fef3c7;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 600;
}

.result-year {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 12px 0;
}

.result-tagline {
  font-style: italic;
  color: #4b5563;
  margin: 0 0 12px 0;
}

.result-people {
  font-size: 0.875rem;
  margin: 8px 0 0 0;
  color: #4b5563;
}

.result-people strong {
  color: #1f2937;
}
```

## Test Search Functionality

Try different searches:

1. **Movie title**: Search for "Matrix" or "Inception"
2. **Actor name**: Search for "Keanu" or "Tom"
3. **Director**: Search for "Wachowski" or "Nolan"
4. **Tagline keywords**: Search for "reality" or "dream"
5. **Partial matches**: Search for "mat" to find Matrix
6. **Click a result** to manage its cast (if you added the onSelectMovie handler)

## Advanced: Add Filters

For more control, you could add filter options. Update `src/components/Search.tsx`:

```typescript
// Add above your component:
type FilterType = 'all' | 'title' | 'people';

// Add state:
const [filterType, setFilterType] = useState<FilterType>('all');

// Update the query logic:
const buildWhere = () => {
  const conditions = [];
  
  switch (filterType) {
    case 'title':
      conditions.push({ title_CONTAINS: activeSearch });
      conditions.push({ tagline_CONTAINS: activeSearch });
      break;
    case 'people':
      conditions.push({ actors_SOME: { name_CONTAINS: activeSearch } });
      conditions.push({ directors_SOME: { name_CONTAINS: activeSearch } });
      break;
    default: // 'all'
      conditions.push({ title_CONTAINS: activeSearch });
      conditions.push({ tagline_CONTAINS: activeSearch });
      conditions.push({ actors_SOME: { name_CONTAINS: activeSearch } });
      conditions.push({ directors_SOME: { name_CONTAINS: activeSearch } });
  }
  
  return { OR: conditions };
};

// Add filter UI before the search form:
<div className="filter-options">
  <label>
    <input 
      type="radio" 
      value="all" 
      checked={filterType === 'all'}
      onChange={() => setFilterType('all')}
    />
    All
  </label>
  <label>
    <input 
      type="radio" 
      value="title" 
      checked={filterType === 'title'}
      onChange={() => setFilterType('title')}
    />
    Titles Only
  </label>
  <label>
    <input 
      type="radio" 
      value="people" 
      checked={filterType === 'people'}
      onChange={() => setFilterType('people')}
    />
    People Only
  </label>
</div>
```

## What You've Learned

✅ Using GraphQL filter operators  
✅ Combining filters with OR conditions  
✅ Searching across relationships  
✅ Building a search UI with React  
✅ Highlighting search matches  
✅ Handling empty search results  
✅ Adding filter options

## Try It Yourself

Enhance the search:

1. Add sorting options (by title, year, relevance)
2. Implement search suggestions as user types
3. Add filters for release year ranges
4. Show search history
5. Implement pagination for large result sets
6. Add "Save Search" functionality

**Next**: [Chapter 8: Deploy Your Application](#chapter-8-deploy-your-application)

---