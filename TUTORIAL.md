# Build a Movie Web Application with Neo4j and GraphQL

This tutorial guides you through building a complete web application using Neo4j's DataAPI GraphQL service. You'll learn how to read, create, update, and delete data in a graph database while building a real-world movie management application.

## What You'll Build

By the end of this tutorial, you'll have a fully functional web application that:
- Displays movies from the Neo4j Movie graph database
- Allows you to create new movies and people
- Enables editing existing movies
- Supports searching across movies, actors, and directors
- Manages relationships between movies and people
- Uses GraphQL for efficient data fetching

## What You'll Learn

- How to connect a web application to Neo4j using GraphQL
- Reading data from a graph database with GraphQL queries
- Creating and modifying data with GraphQL mutations
- Managing relationships in a graph database
- Implementing search functionality across connected data
- Building a responsive React application with TypeScript

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18 or later** installed on your computer
- **A Neo4j Aura account** with a free database instance
- **Basic knowledge** of JavaScript/TypeScript and React
- **A code editor** like VS Code

If you don't have a Neo4j Aura account, you can [sign up for free](https://neo4j.com/cloud/aura-free/).

## Tutorial Overview

This tutorial is divided into the following chapters:

1. **[Set Up Your Environment](#chapter-1-set-up-your-environment)** - Create your project and configure Neo4j
2. **[Read Data from Neo4j](#chapter-2-read-data-from-neo4j)** - Display movies from your database
3. **[Create New Data](#chapter-3-create-new-data)** - Add new movies to your database
4. **[Update Existing Data](#chapter-4-update-existing-data)** - Edit movie information
5. **[Delete Data](#chapter-5-delete-data)** - Remove movies from your database
6. **[Manage Relationships](#chapter-6-manage-relationships)** - Connect actors and directors to movies
7. **[Search and Filter](#chapter-7-search-and-filter)** - Implement search functionality
8. **[Deploy Your Application](#chapter-8-deploy-your-application)** - Make your app available online

Let's get started!

---

# Chapter 1: Set Up Your Environment

In this chapter, you'll set up your development environment, create a React application, and connect it to your Neo4j database.

## Create Your React Application

First, create a new React application with TypeScript support using Vite:

```bash
npm create vite@latest movie-manager -- --template react-ts
cd movie-manager
```

This creates a new directory called `movie-manager` with a basic React + TypeScript setup.

## Install Required Dependencies

Install the packages you'll need for this tutorial:

```bash
npm install
npm install graphql-request graphql
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

These packages provide:
- **graphql-request**: A lightweight GraphQL client for making requests
- **graphql**: Core GraphQL functionality
- **@tanstack/react-query**: Powerful data fetching and caching
- **@tanstack/react-query-devtools**: Development tools for debugging queries

## Set Up Your Neo4j Database

### Load the Movies Dataset

1. Log in to your [Neo4j Aura Console](https://console.neo4j.io/)
2. Open your database instance
3. Click on "Query" to open the Neo4j Browser
4. Run this command to load the Movies dataset:

```cypher
:play movie-graph
```

5. Follow the instructions in the guide to create the sample data

### Enable DataAPI GraphQL

1. In the Aura Console, navigate to your database
2. Click on the "APIs" tab
3. Enable "DataAPI GraphQL"
4. Note your GraphQL endpoint URL
5. Create an API token and save it securely

Your endpoint will look like: `https://your-instance-id.databases.neo4j.io/graphql`

## Configure Your Application

Create a `.env` file in the root of your project:

```bash
touch .env
```

Add your Neo4j credentials to `.env`:

```env
VITE_NEO4J_GRAPHQL_URL=https://your-instance-id.databases.neo4j.io/graphql
VITE_NEO4J_GRAPHQL_TOKEN=your-api-token-here
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It's already included in the `.gitignore` file created by Vite.

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
      authorization: `Bearer ${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`,
    },
  }
);
```

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

## Test Your Setup

Start your development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173`. You should see the default Vite + React page.

If everything works, you're ready to move on to the next chapter!

## What You've Accomplished

✅ Created a React + TypeScript application  
✅ Installed necessary dependencies  
✅ Set up a Neo4j database with the Movies dataset  
✅ Enabled DataAPI GraphQL  
✅ Configured your application to connect to Neo4j  
✅ Set up React Query for data management

**Next**: [Chapter 2: Read Data from Neo4j](#chapter-2-read-data-from-neo4j)

---

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

# Chapter 3: Create New Data

Now that you can read data, let's add the ability to create new movies and people. In this chapter, you'll learn about GraphQL mutations and form handling.

## Understanding GraphQL Mutations

While queries read data, **mutations** modify data. Mutations can:

- Create new nodes (entities)
- Update existing nodes
- Delete nodes
- Create or remove relationships

Here's a basic mutation:

```graphql
mutation {
  createMovies(input: [
    { title: "Inception", released: 2010 }
  ]) {
    movies {
      title
      released
    }
  }
}
```

The mutation creates a new movie and returns the created data.

## Add Mutation Operations

Update `src/graphql/operations.ts` by adding these mutations:

```typescript
// Add after your GET_MOVIES query

export const CREATE_MOVIE = gql`
  mutation CreateMovie($title: String!, $released: Int, $tagline: String) {
    createMovies(
      input: [{ 
        title: $title, 
        released: $released, 
        tagline: $tagline 
      }]
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;

export const CREATE_PERSON = gql`
  mutation CreatePerson($name: String!, $born: Int) {
    createPeople(
      input: [{ 
        name: $name, 
        born: $born 
      }]
    ) {
      people {
        name
        born
      }
    }
  }
`;
```

Notice the `$title: String!` syntax - the `!` means this field is required.

## Add Form Type Definitions

Update `src/types/movie.ts` to add form data types:

```typescript
// Add these interfaces to your existing file

export interface MovieFormData {
  title: string;
  released?: number;
  tagline?: string;
}

export interface PersonFormData {
  name: string;
  born?: number;
}
```

## Create a Movie Form Component

Create a new file `src/components/MovieForm.tsx`:

```typescript
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { CREATE_MOVIE } from '../graphql/operations';
import { MovieFormData } from '../types/movie';

interface CreateMovieResponse {
  createMovies: {
    movies: Array<{
      title: string;
      released?: number;
      tagline?: string;
    }>;
  };
}

interface MovieFormProps {
  onComplete: () => void;
}

export function MovieForm({ onComplete }: MovieFormProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    released: undefined,
    tagline: ''
  });

  const createMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<CreateMovieResponse>(CREATE_MOVIE, data),
    onSuccess: () => {
      // Invalidate the movies query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    },
    onError: (error) => {
      alert(`Failed to create movie: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a movie title');
      return;
    }
    
    createMovieMutation.mutate(formData);
  };

  const handleChange = (
    field: keyof MovieFormData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="movie-form">
      <h2>Add New Movie</h2>
      
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          placeholder="Enter movie title"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="released">Release Year</label>
        <input
          id="released"
          type="number"
          value={formData.released || ''}
          onChange={e => handleChange('released', parseInt(e.target.value))}
          placeholder="e.g., 2010"
          min="1900"
          max={new Date().getFullYear() + 5}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          type="text"
          value={formData.tagline || ''}
          onChange={e => handleChange('tagline', e.target.value)}
          placeholder="Enter a catchy tagline"
        />
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={createMovieMutation.isPending}
          className="btn-primary"
        >
          {createMovieMutation.isPending ? 'Creating...' : 'Create Movie'}
        </button>
        <button 
          type="button" 
          onClick={onComplete}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

### Understanding useMutation

The `useMutation` hook handles data modification:

- **`mutationFn`**: The function that performs the mutation
- **`onSuccess`**: Called after successful mutation (we invalidate the cache)
- **`onError`**: Called if the mutation fails
- **`isPending`**: Indicates if the mutation is in progress

## Update the App Component

Update `src/App.tsx` to include the form:

```typescript
import { useState } from 'react';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import './App.css';

function App() {
  const [view, setView] = useState<'list' | 'create'>('list');

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
            onClick={() => setView('create')}
            className={view === 'create' ? 'active' : ''}
          >
            Add Movie
          </button>
        </nav>
      </header>
      
      <main>
        {view === 'list' && <MovieList />}
        {view === 'create' && (
          <MovieForm onComplete={() => setView('list')} />
        )}
      </main>
    </div>
  );
}

export default App;
```

## Update Your Styles

Add these styles to `src/App.css`:

```css
/* Add these to your existing styles */

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

nav {
  display: flex;
  gap: 10px;
}

nav button {
  padding: 8px 16px;
  background: transparent;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

nav button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

nav button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.movie-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.movie-form h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #1f2937;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group .required {
  color: #dc2626;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}
```

## Test Creating Movies

Try creating a new movie:

1. Click "Add Movie" in the navigation
2. Enter a title (required field)
3. Optionally add a release year and tagline
4. Click "Create Movie"
5. You should be redirected to the movie list
6. Your new movie should appear in the list!

## How Cache Invalidation Works

When you create a movie, notice these steps:

1. The mutation runs (`createMovieMutation.mutate()`)
2. On success, we call `queryClient.invalidateQueries({ queryKey: ['movies'] })`
3. React Query automatically re-fetches the movies list
4. The UI updates with the new movie included

This pattern ensures your UI stays in sync with the database.

## What You've Learned

✅ Writing GraphQL mutations  
✅ Using React Query's `useMutation` hook  
✅ Building controlled form components  
✅ Cache invalidation for automatic UI updates  
✅ Handling form validation and errors  
✅ Using TypeScript for type-safe forms

## Try It Yourself

Extend your skills by:

1. Adding validation for the release year (should be a reasonable year)
2. Creating a similar form for adding new people (actors/directors)
3. Adding a success message after creating a movie
4. Implementing form reset after submission

**Next**: [Chapter 4: Update Existing Data](#chapter-4-update-existing-data)

---

# Chapter 4: Update Existing Data

With create functionality in place, let's add the ability to edit existing movies. You'll learn about mutation variables, conditional rendering, and updating your UI optimistically.

## Add the Update Mutation

Update `src/graphql/operations.ts` with an update mutation:

```typescript
// Add this after CREATE_MOVIE

export const UPDATE_MOVIE = gql`
  mutation UpdateMovie(
    $title: String!
    $released: Int
    $tagline: String
  ) {
    updateMovies(
      where: { title: $title }
      update: { 
        released: $released, 
        tagline: $tagline 
      }
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;
```

Notice the mutation has two parts:
- **`where`**: Identifies which movie to update (by title)
- **`update`**: Specifies which fields to change

## Update the Movie Form

Modify `src/components/MovieForm.tsx` to handle both create and edit modes:

```typescript
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { CREATE_MOVIE, UPDATE_MOVIE } from '../graphql/operations';
import { Movie, MovieFormData } from '../types/movie';

interface CreateMovieResponse {
  createMovies: {
    movies: Array<{
      title: string;
      released?: number;
      tagline?: string;
    }>;
  };
}

interface UpdateMovieResponse {
  updateMovies: {
    movies: Array<{
      title: string;
      released?: number;
      tagline?: string;
    }>;
  };
}

interface MovieFormProps {
  movie?: Movie;  // Optional - if provided, we're editing
  onComplete: () => void;
}

export function MovieForm({ movie, onComplete }: MovieFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!movie;
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    released: undefined,
    tagline: ''
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        released: movie.released,
        tagline: movie.tagline
      });
    }
  }, [movie]);

  const createMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<CreateMovieResponse>(CREATE_MOVIE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    },
    onError: (error) => {
      alert(`Failed to create movie: ${error.message}`);
    }
  });

  const updateMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<UpdateMovieResponse>(UPDATE_MOVIE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    },
    onError: (error) => {
      alert(`Failed to update movie: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a movie title');
      return;
    }
    
    if (isEditing) {
      updateMovieMutation.mutate(formData);
    } else {
      createMovieMutation.mutate(formData);
    }
  };

  const handleChange = (
    field: keyof MovieFormData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const isPending = createMovieMutation.isPending || updateMovieMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="movie-form">
      <h2>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
      
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          placeholder="Enter movie title"
          required
          disabled={isEditing}  // Can't change title when editing
        />
        {isEditing && (
          <p className="help-text">
            Title cannot be changed (it's used as the identifier)
          </p>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="released">Release Year</label>
        <input
          id="released"
          type="number"
          value={formData.released || ''}
          onChange={e => handleChange('released', parseInt(e.target.value))}
          placeholder="e.g., 2010"
          min="1900"
          max={new Date().getFullYear() + 5}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          type="text"
          value={formData.tagline || ''}
          onChange={e => handleChange('tagline', e.target.value)}
          placeholder="Enter a catchy tagline"
        />
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary"
        >
          {isPending 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update Movie' : 'Create Movie')
          }
        </button>
        <button 
          type="button" 
          onClick={onComplete}
          className="btn-secondary"
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Add Edit Buttons to Movie List

Update `src/components/MovieList.tsx` to add edit functionality:

```typescript
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { GET_MOVIES } from '../graphql/operations';
import { Movie } from '../types/movie';

interface GetMoviesResponse {
  movies: Movie[];
}

interface MovieListProps {
  onEdit: (movie: Movie) => void;  // Callback to handle editing
}

export function MovieList({ onEdit }: MovieListProps) {
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

            <div className="card-actions">
              <button 
                onClick={() => onEdit(movie)}
                className="btn-edit"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Update App Component

Modify `src/App.tsx` to handle the edit state:

```typescript
import { useState } from 'react';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { Movie } from './types/movie';
import './App.css';

function App() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('edit');
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
      
      <main>
        {view === 'list' && <MovieList onEdit={handleEdit} />}
        {view === 'create' && (
          <MovieForm onComplete={handleComplete} />
        )}
        {view === 'edit' && selectedMovie && (
          <MovieForm movie={selectedMovie} onComplete={handleComplete} />
        )}
      </main>
    </div>
  );
}

export default App;
```

## Add Styles for Edit Buttons

Add these styles to `src/App.css`:

```css
/* Add to existing styles */

.card-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.btn-edit {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #2563eb;
}

.help-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
}
```

## Test the Edit Functionality

Try editing a movie:

1. Find a movie in your list
2. Click the "Edit" button
3. Modify the release year or tagline
4. Click "Update Movie"
5. The movie list should refresh with your changes

Note that you can't edit the title - this is because we're using the title as the identifier in our `where` clause.

## Why Not Allow Title Edits?

In a graph database, we need a way to uniquely identify nodes. We're using the title as our identifier (`where: { title: $title }`). If we allowed title changes, we'd need to:

1. Use a different identifier (like an ID field)
2. Or implement special logic to handle title changes

For this tutorial, we keep it simple by treating title as immutable.

## What You've Learned

✅ Writing update mutations with `where` clauses  
✅ Conditional component behavior (create vs edit)  
✅ Pre-filling forms with existing data  
✅ Disabling fields during editing  
✅ Managing UI state for different views  
✅ Combining multiple mutations in one component

## Try It Yourself

Enhance the update functionality:

1. Add a confirmation message after successful updates
2. Implement "Cancel" that asks for confirmation if the form has changes
3. Add a "Last Updated" timestamp (you'd need to add this to your schema)
4. Show a visual indicator when a movie has been recently updated

**Next**: [Chapter 5: Delete Data](#chapter-5-delete-data)

---

# Chapter 5: Delete Data

Let's add the ability to remove movies from your database. You'll learn about delete mutations and implementing user confirmations to prevent accidental deletions.

## Add the Delete Mutation

Update `src/graphql/operations.ts`:

```typescript
// Add this after UPDATE_MOVIE

export const DELETE_MOVIE = gql`
  mutation DeleteMovie($title: String!) {
    deleteMovies(where: { title: $title }) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`;
```

This mutation:
- Uses a `where` clause to find the movie by title
- Returns `nodesDeleted` (number of nodes removed)
- Returns `relationshipsDeleted` (number of relationships removed)

## Update Movie List with Delete

Modify `src/components/MovieList.tsx` to add delete functionality:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { GET_MOVIES, DELETE_MOVIE } from '../graphql/operations';
import { Movie } from '../types/movie';

interface GetMoviesResponse {
  movies: Movie[];
}

interface DeleteMovieResponse {
  deleteMovies: {
    nodesDeleted: number;
    relationshipsDeleted: number;
  };
}

interface MovieListProps {
  onEdit: (movie: Movie) => void;
}

export function MovieList({ onEdit }: MovieListProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => 
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES, { limit: 20 })
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (title: string) =>
      graphqlClient.request<DeleteMovieResponse>(DELETE_MOVIE, { title }),
    onSuccess: (data) => {
      // Show confirmation of what was deleted
      const { nodesDeleted, relationshipsDeleted } = data.deleteMovies;
      console.log(
        `Deleted ${nodesDeleted} movie(s) and ${relationshipsDeleted} relationship(s)`
      );
      
      // Refresh the movie list
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      alert(`Failed to delete movie: ${error.message}`);
    }
  });

  const handleDelete = (movie: Movie) => {
    // Get confirmation before deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.title}"?\n\n` +
      `This will also remove all relationships to actors and directors.`
    );

    if (confirmed) {
      deleteMovieMutation.mutate(movie.title);
    }
  };

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

            <div className="card-actions">
              <button 
                onClick={() => onEdit(movie)}
                className="btn-edit"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(movie)}
                className="btn-delete"
                disabled={deleteMovieMutation.isPending}
              >
                {deleteMovieMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Add Delete Button Styles

Update `src/App.css`:

```css
/* Add to existing styles */

.btn-delete {
  padding: 6px 12px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-delete:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

## Understanding Graph Deletions

When you delete a movie node in Neo4j:

1. The movie node itself is removed
2. All relationships connected to that movie are also removed
3. But the Person nodes (actors/directors) remain in the database

This is a key feature of graph databases - you can remove a node and its connections without affecting other nodes in the graph.

For example, if you delete "The Matrix", you remove:
- The Matrix movie node
- Relationships: Keanu Reeves ACTED_IN The Matrix
- Relationships: The Wachowskis DIRECTED The Matrix

But Keanu Reeves and The Wachowskis still exist in the database.

## Test the Delete Functionality

Try deleting a movie:

1. Find a movie you created earlier (don't delete the classic movies!)
2. Click "Delete"
3. Confirm the deletion in the dialog
4. The movie should disappear from the list

## Add a Better Confirmation Dialog (Optional Enhancement)

For a better user experience, you could create a custom confirmation modal instead of using `window.confirm()`. Here's a simple example:

Create `src/components/ConfirmDialog.tsx`:

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button onClick={onConfirm} className="btn-danger">
            {confirmText}
          </button>
          <button onClick={onCancel} className="btn-secondary">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

And corresponding styles in `App.css`:

```css
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #1f2937;
}

.dialog p {
  margin-bottom: 20px;
  color: #4b5563;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-danger {
  padding: 8px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover {
  background: #b91c1c;
}
```

## What You've Learned

✅ Writing delete mutations in GraphQL  
✅ Understanding node and relationship deletion in graphs  
✅ Implementing user confirmations  
✅ Handling delete mutation states  
✅ Providing user feedback during operations  
✅ Managing optimistic UI updates

## Try It Yourself

Enhance the delete functionality:

1. Implement the custom ConfirmDialog component
2. Add an "undo" feature (you'd need to store deleted data temporarily)
3. Show a success message after deletion
4. Add the ability to delete multiple movies at once (batch deletion)
5. Add a "trash" view where deleted items can be restored within 30 days

**Next**: [Chapter 6: Manage Relationships](#chapter-6-manage-relationships)

---

# Chapter 6: Manage Relationships

The real power of a graph database lies in relationships. In this chapter, you'll learn to connect movies with actors and directors, and manage these relationships dynamically.

## Understanding Graph Relationships

In Neo4j, relationships connect nodes and have:
- A **type** (e.g., ACTED_IN, DIRECTED)
- A **direction** (from one node to another)
- Optional **properties** (e.g., roles: ["Neo"])

In GraphQL, we manage relationships using `connect` and `disconnect` operations:

```graphql
# Connect an actor to a movie
updateMovies(
  where: { title: "The Matrix" }
  connect: { 
    actors: { 
      where: { node: { name: "Keanu Reeves" } } 
    } 
  }
)

# Disconnect an actor from a movie
updateMovies(
  where: { title: "The Matrix" }
  disconnect: { 
    actors: { 
      where: { node: { name: "Keanu Reeves" } } 
    } 
  }
)
```

## Add Relationship Mutations

Update `src/graphql/operations.ts`:

```typescript
// Add after DELETE_MOVIE

// First, add a query to get all people
export const GET_PEOPLE = gql`
  query GetPeople($limit: Int) {
    people(options: { limit: $limit, sort: [{ name: ASC }] }) {
      name
      born
    }
  }
`;

// Relationship management mutations
export const ASSIGN_ACTOR = gql`
  mutation AssignActor($movieTitle: String!, $actorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      connect: { 
        actors: { 
          where: { node: { name: $actorName } } 
        } 
      }
    ) {
      movies {
        title
        actors {
          name
        }
      }
    }
  }
`;

export const REMOVE_ACTOR = gql`
  mutation RemoveActor($movieTitle: String!, $actorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      disconnect: { 
        actors: { 
          where: { node: { name: $actorName } } 
        } 
      }
    ) {
      movies {
        title
      }
    }
  }
`;

export const ASSIGN_DIRECTOR = gql`
  mutation AssignDirector($movieTitle: String!, $directorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      connect: { 
        directors: { 
          where: { node: { name: $directorName } } 
        } 
      }
    ) {
      movies {
        title
        directors {
          name
        }
      }
    }
  }
`;

export const REMOVE_DIRECTOR = gql`
  mutation RemoveDirector($movieTitle: String!, $directorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      disconnect: { 
        directors: { 
          where: { node: { name: $directorName } } 
        } 
      }
    ) {
      movies {
        title
      }
    }
  }
`;
```

## Create Relationship Manager Component

Create `src/components/RelationshipManager.tsx`:

```typescript
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { 
  ASSIGN_ACTOR, 
  REMOVE_ACTOR, 
  ASSIGN_DIRECTOR, 
  REMOVE_DIRECTOR,
  GET_PEOPLE 
} from '../graphql/operations';
import { Movie } from '../types/movie';

interface Props {
  movie: Movie;
  onComplete: () => void;
}

interface GetPeopleResponse {
  people: { name: string; born?: number }[];
}

export function RelationshipManager({ movie, onComplete }: Props) {
  const queryClient = useQueryClient();
  const [selectedPerson, setSelectedPerson] = useState('');
  const [relationType, setRelationType] = useState<'actor' | 'director'>('actor');

  const { data: peopleData, isLoading: peopleLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () =>
      graphqlClient.request<GetPeopleResponse>(GET_PEOPLE, { limit: 200 })
  });

  const assignActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(ASSIGN_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setSelectedPerson('');
    }
  });

  const removeActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(REMOVE_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  const assignDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(ASSIGN_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setSelectedPerson('');
    }
  });

  const removeDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(REMOVE_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  const handleAssign = () => {
    if (!selectedPerson) {
      alert('Please select a person');
      return;
    }

    // Check if already assigned
    if (relationType === 'actor' && movie.actors?.some(a => a.name === selectedPerson)) {
      alert('This person is already an actor in this movie');
      return;
    }
    if (relationType === 'director' && movie.directors?.some(d => d.name === selectedPerson)) {
      alert('This person is already a director of this movie');
      return;
    }

    if (relationType === 'actor') {
      assignActorMutation.mutate({
        movieTitle: movie.title,
        actorName: selectedPerson
      });
    } else {
      assignDirectorMutation.mutate({
        movieTitle: movie.title,
        directorName: selectedPerson
      });
    }
  };

  const handleRemove = (personName: string, type: 'actor' | 'director') => {
    const confirmed = window.confirm(
      `Remove ${personName} as ${type === 'actor' ? 'an actor' : 'a director'} from ${movie.title}?`
    );

    if (!confirmed) return;

    if (type === 'actor') {
      removeActorMutation.mutate({
        movieTitle: movie.title,
        actorName: personName
      });
    } else {
      removeDirectorMutation.mutate({
        movieTitle: movie.title,
        directorName: personName
      });
    }
  };

  // Get available people (not already assigned in current role)
  const availablePeople = peopleData?.people.filter(person => {
    if (relationType === 'actor') {
      return !movie.actors?.some(a => a.name === person.name);
    } else {
      return !movie.directors?.some(d => d.name === person.name);
    }
  }) || [];

  return (
    <div className="relationship-manager">
      <div className="manager-header">
        <h2>Manage Cast & Crew</h2>
        <h3>{movie.title}</h3>
      </div>

      <div className="current-relationships">
        <div className="relationship-section">
          <h4>Actors ({movie.actors?.length || 0})</h4>
          {movie.actors && movie.actors.length > 0 ? (
            <ul className="person-list">
              {movie.actors.map(actor => (
                <li key={actor.name}>
                  <div className="person-info">
                    <span className="person-name">{actor.name}</span>
                    {actor.born && (
                      <span className="person-born">Born {actor.born}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(actor.name, 'actor')}
                    className="btn-remove"
                    disabled={removeActorMutation.isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No actors assigned</p>
          )}
        </div>

        <div className="relationship-section">
          <h4>Directors ({movie.directors?.length || 0})</h4>
          {movie.directors && movie.directors.length > 0 ? (
            <ul className="person-list">
              {movie.directors.map(director => (
                <li key={director.name}>
                  <div className="person-info">
                    <span className="person-name">{director.name}</span>
                    {director.born && (
                      <span className="person-born">Born {director.born}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(director.name, 'director')}
                    className="btn-remove"
                    disabled={removeDirectorMutation.isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No directors assigned</p>
          )}
        </div>
      </div>

      <div className="add-relationship">
        <h4>Add Person</h4>
        <div className="add-form">
          <select 
            value={relationType} 
            onChange={e => {
              setRelationType(e.target.value as 'actor' | 'director');
              setSelectedPerson('');
            }}
            className="role-select"
          >
            <option value="actor">Actor</option>
            <option value="director">Director</option>
          </select>

          <select 
            value={selectedPerson} 
            onChange={e => setSelectedPerson(e.target.value)}
            className="person-select"
            disabled={peopleLoading}
          >
            <option value="">
              {peopleLoading ? 'Loading people...' : 'Select person...'}
            </option>
            {availablePeople.map((person) => (
              <option key={person.name} value={person.name}>
                {person.name} {person.born ? `(${person.born})` : ''}
              </option>
            ))}
          </select>

          <button 
            onClick={handleAssign} 
            disabled={
              !selectedPerson || 
              assignActorMutation.isPending || 
              assignDirectorMutation.isPending
            }
            className="btn-primary"
          >
            Add {relationType}
          </button>
        </div>
      </div>

      <div className="manager-actions">
        <button onClick={onComplete} className="btn-secondary">
          Done
        </button>
      </div>
    </div>
  );
}
```

## Add "Manage Cast" Button to Movie List

Update `src/components/MovieList.tsx`:

```typescript
// Update the interface to include onManage
interface MovieListProps {
  onEdit: (movie: Movie) => void;
  onManage: (movie: Movie) => void;  // Add this
}

// Update the component signature
export function MovieList({ onEdit, onManage }: MovieListProps) {
  // ... existing code ...

  // In the JSX, update the card-actions div:
  <div className="card-actions">
    <button 
      onClick={() => onEdit(movie)}
      className="btn-edit"
    >
      Edit
    </button>
    <button 
      onClick={() => onManage(movie)}
      className="btn-manage"
    >
      Manage Cast
    </button>
    <button 
      onClick={() => handleDelete(movie)}
      className="btn-delete"
      disabled={deleteMovieMutation.isPending}
    >
      {deleteMovieMutation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  </div>
}
```

## Update App Component

Update `src/App.tsx`:

```typescript
import { useState } from 'react';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { RelationshipManager } from './components/RelationshipManager';
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

## Add Relationship Manager Styles

Add to `src/App.css`:

```css
/* Relationship Manager Styles */

.relationship-manager {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.manager-header h2 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #1f2937;
}

.manager-header h3 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #6b7280;
  font-weight: normal;
}

.current-relationships {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.relationship-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #374151;
  font-size: 1rem;
}

.person-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.person-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.person-name {
  font-weight: 500;
  color: #1f2937;
}

.person-born {
  font-size: 0.875rem;
  color: #6b7280;
}

.btn-remove {
  padding: 6px 12px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  background: #f9fafb;
  border-radius: 6px;
}

.add-relationship {
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
}

.add-relationship h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #374151;
}

.add-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.role-select,
.person-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.role-select {
  width: 120px;
}

.person-select {
  flex: 1;
}

.manager-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-manage {
  padding: 6px 12px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-manage:hover {
  background: #7c3aed;
}
```

## Test Relationship Management

Try managing relationships:

1. Click "Manage Cast" on any movie
2. View current actors and directors
3. Select a role type (actor or director)
4. Choose a person from the dropdown
5. Click "Add actor" or "Add director"
6. Try removing people from the movie
7. Click "Done" and see the updated movie card

## Understanding Connect vs Disconnect

The `connect` operation creates a relationship:
- Finds the specified nodes (movie and person)
- Creates a relationship between them
- Doesn't fail if the relationship already exists

The `disconnect` operation removes a relationship:
- Finds the specified nodes
- Removes the relationship between them
- Leaves both nodes in the database

## What You've Learned

✅ Managing relationships in a graph database  
✅ Using GraphQL `connect` and `disconnect` operations  
✅ Building complex UI for relationship management  
✅ Preventing duplicate relationships  
✅ Working with nested mutations  
✅ Filtering available options based on existing data

## Try It Yourself

Enhance relationship management:

1. Add relationship properties (e.g., roles for actors)
2. Implement bulk assignment (add multiple people at once)
3. Show movies a person is connected to when assigning
4. Add drag-and-drop for reordering people
5. Create a dedicated "People" view to manage all people

**Next**: [Chapter 7: Search and Filter](#chapter-7-search-and-filter)

---

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

# Chapter 8: Deploy Your Application

Congratulations! You've built a fully functional movie management application. In this final chapter, you'll learn how to deploy your application so others can use it.

## Prepare for Production

### 1. Environment Variables

For production, you'll need to set up environment variables properly. Most hosting platforms provide ways to set these securely without committing them to your repository.

### 2. Build Your Application

Test your production build locally:

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

Test the build locally:

```bash
npm run preview
```

## Deploy to Vercel (Recommended)

Vercel is a popular platform for deploying React applications with great integration for Vite projects.

### Step-by-Step Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin your-repo-url
     git push -u origin main
     ```

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - Add `VITE_NEO4J_GRAPHQL_URL`
     - Add `VITE_NEO4J_GRAPHQL_TOKEN`
   - Click "Deploy"

Your app will be live at `your-project.vercel.app` in minutes!

## Deploy to Netlify

Netlify is another excellent option for static sites.

### Step-by-Step Deployment

1. **Create `netlify.toml`** in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   ```

2. **Push to GitHub** (same as above)

3. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Configure environment variables in Site settings
   - Click "Deploy site"

## Environment Variable Security

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** to your repository
2. **Use platform-specific environment variable settings** for production
3. **Consider using a backend proxy** for added security
4. **Rotate your Neo4j tokens regularly**

### Optional: Add a Backend Proxy

For better security, you might want to create a backend proxy:

```javascript
// backend/server.js
import express from 'express';
import { GraphQLClient } from 'graphql-request';

const app = express();
const client = new GraphQLClient(process.env.NEO4J_URL, {
  headers: { authorization: `Bearer ${process.env.NEO4J_TOKEN}` }
});

app.post('/api/graphql', async (req, res) => {
  try {
    const data = await client.request(req.body.query, req.body.variables);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

This keeps your Neo4j credentials server-side.

## Post-Deployment Checklist

✅ Test all CRUD operations  
✅ Verify search functionality  
✅ Test on mobile devices  
✅ Check browser console for errors  
✅ Test with different data scenarios  
✅ Verify environment variables are working  
✅ Check loading states and error handling  
✅ Test with slow network conditions

## Monitoring and Analytics

Consider adding:

1. **Error tracking**: Sentry, LogRocket
2. **Analytics**: Google Analytics, Plausible
3. **Performance monitoring**: Web Vitals, Lighthouse CI

Example Sentry integration:

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Commits to main branch** → Automatically deploy to production
- **Pull requests** → Create preview deployments
- **Branch deployments** → Test features before merging

## Performance Optimization

### 1. Code Splitting

Vite automatically code-splits your application. You can also manually split:

```typescript
const RelationshipManager = lazy(() => 
  import('./components/RelationshipManager')
);

// Use with Suspense:
<Suspense fallback={<div>Loading...</div>}>
  <RelationshipManager />
</Suspense>
```

### 2. Image Optimization

If you add images, use WebP format and lazy loading:

```typescript
<img 
  src="poster.webp" 
  alt="Movie poster"
  loading="lazy"
/>
```

### 3. Query Optimization

Use pagination for large datasets:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['movies'],
  queryFn: ({ pageParam = 0 }) => 
    graphqlClient.request(GET_MOVIES, { 
      offset: pageParam, 
      limit: 20 
    }),
  getNextPageParam: (lastPage, pages) => 
    lastPage.movies.length === 20 ? pages.length * 20 : undefined
});
```

## What You've Learned

✅ Building for production  
✅ Deploying to modern hosting platforms  
✅ Managing environment variables securely  
✅ Setting up continuous deployment  
✅ Adding monitoring and analytics  
✅ Optimizing performance

## Next Steps

Congratulations on completing this tutorial! You've built a complete web application with:

- ✅ Full CRUD operations
- ✅ GraphQL integration
- ✅ Relationship management
- ✅ Search functionality
- ✅ Production deployment

### Ideas for Further Development

1. **Authentication**: Add user accounts with Auth0 or Firebase
2. **Authorization**: Implement role-based access control
3. **Advanced Features**:
   - Movie ratings and reviews
   - Recommendation system
   - Batch operations
   - Export/import functionality
4. **UI Enhancements**:
   - Dark mode
   - Keyboard shortcuts
   - Drag-and-drop interfaces
5. **Mobile App**: Use React Native to create mobile versions
6. **Advanced Graph Features**:
   - Shortest path between actors
   - Movie recommendation graph
   - Collaborative filtering

## Additional Resources

- [Neo4j GraphQL Documentation](https://neo4j.com/docs/graphql-manual/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)
- [Neo4j Community Forum](https://community.neo4j.com/)

---

Thank you for following this tutorial! If you have questions or feedback, please reach out to the Neo4j community.

Happy coding! 🎬🚀
