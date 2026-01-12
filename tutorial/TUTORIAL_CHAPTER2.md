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

Lets now setup our React application to support GraphQL 

## Create the GraphQL Client

Create a new directory and file for your GraphQL client configuration:

```bash
mkdir src/lib
touch src/lib/graphql-client.ts
```

Add the following code to `src/lib/graphql-client.ts`:

```typescript
import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_NEO4J_GRAPHQL_URL,
  {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`,
    },
  }
);
```
You will notice that our headers does not contain an authorization key / value pair.  This because the Neo4j DataAPI GraphQL endpoint expects to have an x-api-key that contains an API Key for authentication. 

This creates a configured GraphQL client that will authenticate with your Neo4j database.

## Set Up React Query

Update your `src/main.tsx` to include React Query:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

## Define Your Type Definitions

As we are using TypeScript, we will need to define types that match teh data structure. Create a new directory and file:

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
  peopleActedIn?: Person[];
  peopleDirected?: Person[];
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
  query GetMovies {
    movies {
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

Let's break down what this query does:

- **`query GetMovies`**: Names the query for debugging
- **Fields like `title`, `released`, `tagline`**: Specifies exactly which data to fetch
- **peopleActedIn and peopleDirected**: Specifies the relationship between a Movie and its' actors and directors

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
import type { Movie } from '../types/movie';

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
            
            {movie.peopleActedIn?.length > 0 && (
              <div className="people">
                <strong>Cast:</strong>
                <span> {movie.peopleActedIn?.map(a => a.name).join(', ')}</span>
              </div>
            )}
            
            {movie.peopleDirected?.length > 0  && (
              <div className="people">
                <strong>Directed by:</strong>
                <span> {movie.peopleDirected.map(d => d.name).join(', ')}</span>
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

Your application should now display movies from your Neo4j database! 

Enter ```npm run dev`` and then open `http://localhost:5173` in your browser.

You should see:
- A list of movies sorted by release date
- Each movie showing its title, year, tagline
- Cast and director information
- A clean, card-based layout

## What You've Learned

✅ How to write basic GraphQL queries  
✅ Fetching data with React Query  
✅ Traversing relationships in a graph database  
✅ Handling loading and error states  
✅ Displaying nested data from related entities


## Try It Yourself

Before moving on, try modifying the query to filter the result

1. Return only the Matrix series
2. Show only the Movies directed by Rob Reiner


You will find the [Neo4j GraphQL library reference on Filtering ](https://neo4j.com/docs/graphql/current/filtering/) useful for this

**Next**: [Chapter 3: Create New Data](#chapter-3-create-new-data)

---
