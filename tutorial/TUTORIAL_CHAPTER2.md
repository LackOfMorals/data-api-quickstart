# Chapter 2: Read Data from Neo4j

Now that your environment is set up, let's fetch and display movie data from your Neo4j database. In this chapter, you'll learn how to write GraphQL queries and display the results in your application.

## Understanding GraphQL Queries

GraphQL is a query language that lets you request exactly the data you need. Unlike REST APIs where you get fixed data structures, GraphQL lets you specify:

- Which **fields** you want
- How **deep** to traverse relationships
- What **filters** to apply

Here's a simple example:

```graphql
query {
  movies {
    title
    released
  }
}
```

This query asks for all movies, but only retrieves the `title` and `released` fields.

## Define Your Type Definitions

First, create TypeScript types that match your data structure. Create a new directory and file:

```bash
mkdir src/types
touch src/types/movie.ts
```

Add these type definitions to `src/types/movie.ts`:

```typescript
export interface Person {
  name: string;
  born?: number;
}

export interface Movie {
  title: string;
  released?: number;
  tagline?: string;
  actors?: Person[];
  directors?: Person[];
}
```

## Create Your First GraphQL Query

Create a directory for GraphQL operations:

```bash
mkdir src/graphql
touch src/graphql/operations.ts
```

Add your first query to `src/graphql/operations.ts`:

```typescript
import { gql } from 'graphql-request';

export const GET_MOVIES = gql`
  query GetMovies($limit: Int, $offset: Int) {
    movies(
      options: { 
        limit: $limit, 
        offset: $offset, 
        sort: [{ released: DESC }] 
      }
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

Let's break down what this query does:

- **`query GetMovies`**: Names the query for debugging
- **`$limit` and `$offset`**: Variables for pagination
- **`options`**: Configures sorting (newest movies first) and limits results
- **`actors` and `directors`**: Traverses relationships to get connected people
- **Fields like `title`, `released`, `tagline`**: Specifies exactly which data to fetch

## Build a Movie List Component

Create a components directory and your first component:

```bash
mkdir src/components
touch src/components/MovieList.tsx
```

Add this code to `src/components/MovieList.tsx`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { GET_MOVIES } from '../graphql/operations';
import { Movie } from '../types/movie';

interface GetMoviesResponse {
  movies: Movie[];
}

export function MovieList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => 
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES, { limit: 20 })
  });

  if (isLoading) {
    return <div className="loading">Loading movies...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error loading movies: {error.message}
      </div>
    );
  }

  if (!data?.movies.length) {
    return <div className="empty">No movies found</div>;
  }

  return (
    <div className="movie-list">
      <h2>Movies</h2>
      <div className="movie-grid">
        {data.movies.map((movie) => (
          <div key={movie.title} className="movie-card">
            <h3>{movie.title}</h3>
            <p className="year">{movie.released}</p>
            {movie.tagline && (
              <p className="tagline">"{movie.tagline}"</p>
            )}
            
            {movie.actors && movie.actors.length > 0 && (
              <div className="people">
                <strong>Cast:</strong>
                <span> {movie.actors.map(a => a.name).join(', ')}</span>
              </div>
            )}
            
            {movie.directors && movie.directors.length > 0 && (
              <div className="people">
                <strong>Directed by:</strong>
                <span> {movie.directors.map(d => d.name).join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Understanding React Query

The `useQuery` hook does several things:

- **`queryKey`**: A unique identifier for this query (enables caching)
- **`queryFn`**: The function that fetches the data
- **Automatic states**: Provides `isLoading`, `error`, and `data` states
- **Automatic caching**: Results are cached for efficient re-fetching
- **Background updates**: Can refresh data automatically

## Update Your App Component

Replace the content of `src/App.tsx` with:

```typescript
import { MovieList } from './components/MovieList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>🎬 Movie Manager</h1>
      </header>
      <main>
        <MovieList />
      </main>
    </div>
  );
}

export default App;
```

## Add Basic Styling

Replace `src/App.css` with:

```css
* {
  box-sizing: border-box;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

header h1 {
  margin: 0;
  color: #1f2937;
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.error {
  color: #dc2626;
  background-color: #fee2e2;
  border-radius: 8px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.movie-card {
  border: 1px solid #e5e7eb;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.movie-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.movie-card h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.movie-card .year {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 12px 0;
}

.movie-card .tagline {
  font-style: italic;
  color: #4b5563;
  margin: 0 0 16px 0;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 4px;
}

.movie-card .people {
  font-size: 0.875rem;
  margin: 8px 0;
  color: #4b5563;
}

.movie-card .people strong {
  color: #1f2937;
}
```

## Test Your Application

Your application should now display movies from your Neo4j database! Open `http://localhost:5173` in your browser.

You should see:
- A list of movies sorted by release date
- Each movie showing its title, year, tagline
- Cast and director information
- A clean, card-based layout

## What You've Learned

✅ How to write GraphQL queries  
✅ Using GraphQL fragments to reuse field selections  
✅ Fetching data with React Query  
✅ Traversing relationships in a graph database  
✅ Handling loading and error states  
✅ Displaying nested data from related entities

## Try It Yourself

Before moving on, try modifying the query to:

1. Change the sort order to show oldest movies first (change `DESC` to `ASC`)
2. Add more fields like a movie's runtime if it exists in your schema
3. Adjust the limit to show more or fewer movies

**Next**: [Chapter 3: Create New Data](#chapter-3-create-new-data)

---
