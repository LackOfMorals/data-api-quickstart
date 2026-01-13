# Chapter 7: Search and Filter

Search is one of the most powerful features in a graph database. In this chapter, you'll implement flexible search across movies, actors, and directors using GraphQL's filtering capabilities.

## Understanding GraphQL Filtering

Neo4j's GraphQL library provides powerful [filtering](https://neo4j.com/docs/graphql/current/filtering/) operators:

contains and endsWith  while some is a relationship filter.

- **`contains`/ `startsWith` / `endsWith`**: String comparisons (case-insensitive)
- **`lt` / `lte` / `gt` / `gte`**: Numeric comparisons
- **`some`**: Relationship filter  
- **`OR` /  `AND` /  `NOT`**: Logical operators

Example: Find the movie "The Matrix" 

```graphql
query {
  movies ( 
  where: { title: { eq: "The Matrix" } } ) 
  { 
     title
     tagline
     released 
  }
}

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
        { title: { contains: $searchTerm } },
        { tagline: { contains: $searchTerm } }
      ]
    }
    sort: { released: ASC }
  ) {
    title
    released
    tagline
    peopleActedIn {
      name
      born
    }
    peopleDirected {
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


## Create Search Component

Create `src/components/Search.tsx`:

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { SEARCH_ALL } from '../graphql/operations';
import type { Movie } from '../types/movie';

interface SearchResponse {
  movies: Movie[];
}

export function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['search', activeSearch],
    queryFn: async () =>
      graphqlClient.request<SearchResponse>(SEARCH_ALL, { searchTerm: activeSearch }),
    enabled: activeSearch.length > 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveSearch(searchTerm);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search movies, actors, directors..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {isLoading && <p className="text-center text-gray-600">Searching...</p>}
      
      {data?.movies && (
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Found {data.movies.length} movie(s)
          </h3>
          <div className="space-y-4">
            {data.movies.map((movie: Movie) => {
              const actors = movie.peopleActedIn || [];
              const directors = movie.peopleDirected || [];
              
              return (
                <div key={movie.title} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {movie.title} ({Number(movie.released)})
                  </h4>
                  {movie.tagline && (
                    <p className="text-gray-700 mt-1 italic">{movie.tagline}</p>
                  )}
                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      <strong className="text-gray-700">Cast:</strong>{' '}
                      <span className="text-gray-600">{actors.map(a => a.name).join(', ') || 'None'}</span>
                    </p>
                    <p>
                      <strong className="text-gray-700">Directors:</strong>{' '}
                      <span className="text-gray-600">{directors.map(d => d.name).join(', ') || 'None'}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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
import type { Movie } from './types/movie';
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
2. **Tagline keywords**: Search for "reality" or "dream"
3. **Partial matches**: Search for "mat" to find Matrix


## What You've Learned

✅ Using GraphQL filter operators  
✅ Combining filters with OR conditions    
✅ Building a search UI with React  
✅ Highlighting search matches  
✅ Handling empty search results


## Try It Yourself

Enhance the search:

1. Add sorting options (by title, year, relevance)
2. Implement search suggestions as user types
3. Add filters for release year ranges
4. Show search history

**Next**: [Chapter 8: Deploy Your Application](#chapter-8-deploy-your-application)

---