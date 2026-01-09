# Neo4j DataAPI GraphQL Quick Start Guide

Build a Movie Management Application with React, TypeScript, and GraphQL

## Overview

This guide walks you through building a single-page application to manage the Neo4j Movie graph using DataAPI GraphQL. You'll implement full CRUD operations and search functionality.

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of React, TypeScript, and GraphQL
- A Neo4j Aura instance with DataAPI GraphQL enabled
- The Movies dataset loaded in your database

## Step 1: Project Setup

Create a new React + TypeScript project:

```bash
npm create vite@latest movie-manager -- --template react-ts
cd movie-manager
npm install
```

Install required dependencies:

```bash
npm install graphql-request graphql
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

## Step 2: Configure GraphQL Client

Create `src/lib/graphql-client.ts`:

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

Create `.env`:

```env
VITE_NEO4J_GRAPHQL_URL=your-dataapi-graphql-endpoint
VITE_NEO4J_GRAPHQL_TOKEN=your-auth-token
```

## Step 3: Define GraphQL Operations

Create `src/graphql/operations.ts`:

```typescript
import { gql } from 'graphql-request';

// Movie Fragments
export const MOVIE_FRAGMENT = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
`;

export const MOVIE_WITH_PEOPLE = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
`;

export const PERSON_FRAGMENT = gql`
  fragment PersonFields on Person {
    name
    born
  }
`;

// ============ QUERIES ============

export const GET_MOVIES = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
  
  query GetMovies($limit: Int, $offset: Int) {
    movies(options: { limit: $limit, offset: $offset, sort: [{ released: DESC }] }) {
      ...MovieWithPeople
    }
  }
`;

export const GET_MOVIE = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
  
  query GetMovie($title: String!) {
    movies(where: { title: $title }) {
      ...MovieWithPeople
    }
  }
`;

export const GET_PEOPLE = gql`
  query GetPeople($limit: Int) {
    people(options: { limit: $limit, sort: [{ name: ASC }] }) {
      name
      born
    }
  }
`;

export const SEARCH_ALL = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
  
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
    ) {
      ...MovieWithPeople
    }
  }
`;

// ============ MUTATIONS ============

// Movie CRUD
export const CREATE_MOVIE = gql`
  mutation CreateMovie($title: String!, $released: Int, $tagline: String) {
    createMovies(
      input: [{ title: $title, released: $released, tagline: $tagline }]
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;

export const UPDATE_MOVIE = gql`
  mutation UpdateMovie(
    $title: String!
    $released: Int
    $tagline: String
  ) {
    updateMovies(
      where: { title: $title }
      update: { released: $released, tagline: $tagline }
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;

export const DELETE_MOVIE = gql`
  mutation DeleteMovie($title: String!) {
    deleteMovies(where: { title: $title }) {
      nodesDeleted
    }
  }
`;

// Person CRUD
export const CREATE_PERSON = gql`
  mutation CreatePerson($name: String!, $born: Int) {
    createPeople(input: [{ name: $name, born: $born }]) {
      people {
        name
        born
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($name: String!, $born: Int) {
    updatePeople(where: { name: $name }, update: { born: $born }) {
      people {
        name
        born
      }
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($name: String!) {
    deletePeople(where: { name: $name }) {
      nodesDeleted
    }
  }
`;

// Relationship Management
export const ASSIGN_ACTOR = gql`
  mutation AssignActor($movieTitle: String!, $actorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      connect: { actors: { where: { node: { name: $actorName } } } }
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
      disconnect: { actors: { where: { node: { name: $actorName } } } }
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
      connect: { directors: { where: { node: { name: $directorName } } } }
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
      disconnect: { directors: { where: { node: { name: $directorName } } } }
    ) {
      movies {
        title
      }
    }
  }
`;
```

## Step 4: Create Type Definitions

Create `src/types/movie.ts`:

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

## Step 5: Build UI Components

### Movie List Component

Create `src/components/MovieList.tsx`:

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
  };
}

interface MovieListProps {
  onEdit: (movie: Movie) => void;
  onManage: (movie: Movie) => void;
}

export function MovieList({ onEdit, onManage }: MovieListProps) {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => 
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES, { limit: 50 })
  });
  
  const deleteMovieMutation = useMutation({
    mutationFn: async (title: string) =>
      graphqlClient.request<DeleteMovieResponse>(DELETE_MOVIE, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  if (isLoading) return <div>Loading movies...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="movie-list">
      <h2>Movies</h2>
      {data?.movies.map((movie: Movie) => (
        <div key={movie.title} className="movie-card">
          <h3>{movie.title}</h3>
          <p>Released: {movie.released}</p>
          <p>{movie.tagline}</p>
          
          <div className="people">
            <div>
              <strong>Actors:</strong>
              {movie.actors?.map(a => a.name).join(', ') || 'None'}
            </div>
            <div>
              <strong>Directors:</strong>
              {movie.directors?.map(d => d.name).join(', ') || 'None'}
            </div>
          </div>

          <div className="actions">
            <button onClick={() => onEdit(movie)}>Edit</button>
            <button onClick={() => onManage(movie)}>Manage Cast</button>
            <button 
              onClick={() => {
                if (confirm(`Delete "${movie.title}"?`)) {
                  deleteMovieMutation.mutate(movie.title);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Movie Form Component

Create `src/components/MovieForm.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { CREATE_MOVIE, UPDATE_MOVIE } from '../graphql/operations';
import { Movie, MovieFormData } from '../types/movie';

interface Props {
  movie?: Movie;
  onComplete: () => void;
}

interface CreateMovieResponse {
  createMovies: {
    movies: Movie[];
  };
}

interface UpdateMovieResponse {
  updateMovies: {
    movies: Movie[];
  };
}

export function MovieForm({ movie, onComplete }: Props) {
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
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const updateMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<UpdateMovieResponse>(UPDATE_MOVIE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        released: movie.released,
        tagline: movie.tagline
      });
    }
  }, [movie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (movie) {
      updateMovieMutation.mutate(formData);
    } else {
      createMovieMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="movie-form">
      <h3>{movie ? 'Edit Movie' : 'Create Movie'}</h3>
      
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        required
        disabled={!!movie}
      />
      
      <input
        type="number"
        placeholder="Released"
        value={formData.released || ''}
        onChange={e => setFormData({ 
          ...formData, 
          released: e.target.value ? parseInt(e.target.value) : undefined 
        })}
      />
      
      <input
        type="text"
        placeholder="Tagline"
        value={formData.tagline || ''}
        onChange={e => setFormData({ ...formData, tagline: e.target.value })}
      />
      
      <div className="form-actions">
        <button type="submit" disabled={createMovieMutation.isPending || updateMovieMutation.isPending}>
          {movie ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onComplete}>Cancel</button>
      </div>
    </form>
  );
}
```

### Search Component

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
    <div className="search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search movies, actors, directors..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isLoading && <p>Searching...</p>}
      
      {data?.movies && (
        <div className="search-results">
          <h3>Found {data.movies.length} movie(s)</h3>
          {data.movies.map((movie: Movie) => (
            <div key={movie.title} className="search-result">
              <h4>{movie.title} ({movie.released})</h4>
              <p>{movie.tagline}</p>
              <p>
                <strong>Cast:</strong> {movie.actors?.map(a => a.name).join(', ')}
              </p>
              <p>
                <strong>Directors:</strong> {movie.directors?.map(d => d.name).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Relationship Manager Component

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

  const { data: peopleData } = useQuery({
    queryKey: ['people'],
    queryFn: async () =>
      graphqlClient.request<GetPeopleResponse>(GET_PEOPLE, { limit: 100 })
  });

  const assignActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(ASSIGN_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const removeActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(REMOVE_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const assignDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(ASSIGN_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const removeDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(REMOVE_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const handleAssign = () => {
    if (!selectedPerson) return;

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

  return (
    <div className="relationship-manager">
      <h3>Manage Cast & Crew - {movie.title}</h3>

      <div className="current-people">
        <div>
          <h4>Current Actors</h4>
          {movie.actors?.map(actor => (
            <div key={actor.name}>
              {actor.name}
              <button onClick={() => handleRemove(actor.name, 'actor')}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div>
          <h4>Current Directors</h4>
          {movie.directors?.map(director => (
            <div key={director.name}>
              {director.name}
              <button onClick={() => handleRemove(director.name, 'director')}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="add-person">
        <h4>Add Person</h4>
        <select 
          value={relationType} 
          onChange={e => setRelationType(e.target.value as 'actor' | 'director')}
        >
          <option value="actor">Actor</option>
          <option value="director">Director</option>
        </select>

        <select 
          value={selectedPerson} 
          onChange={e => setSelectedPerson(e.target.value)}
        >
          <option value="">Select person...</option>
          {peopleData?.people.map((person) => (
            <option key={person.name} value={person.name}>
              {person.name}
            </option>
          ))}
        </select>

        <button onClick={handleAssign} disabled={!selectedPerson}>
          Add {relationType}
        </button>
      </div>

      <button onClick={onComplete}>Close</button>
    </div>
  );
}
```

## Step 6: Main Application

Update `src/App.tsx`:

```typescript
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { Search } from './components/Search';
import { RelationshipManager } from './components/RelationshipManager';
import { Movie } from './types/movie';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
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
        <h1>Movie Manager</h1>
        <nav>
          <button onClick={() => setView('list')}>Movies</button>
          <button onClick={() => setView('create')}>Add Movie</button>
        </nav>
      </header>

      <Search />

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
          <RelationshipManager movie={selectedMovie} onComplete={handleComplete} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

## Step 7: Add Basic Styling

Create `src/App.css`:

```css
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

nav {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0052a3;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.movie-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.movie-form {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.movie-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search {
  margin-bottom: 30px;
}

.search form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-results {
  border-top: 2px solid #eee;
  padding-top: 20px;
}

.search-result {
  padding: 15px;
  margin-bottom: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.relationship-manager {
  max-width: 600px;
}

.current-people {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.add-person {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.add-person select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

## Step 8: Run Your Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## Next Steps

- Add pagination for large result sets
- Implement optimistic UI updates
- Add role information for actors
- Implement batch operations
- Add data validation
- Improve error handling and user feedback

## Key GraphQL Patterns Used

1. **Fragments**: Reusable field selections for consistent data fetching (inline in queries with graphql-request)
2. **Variables**: Type-safe parameterization of queries and mutations
3. **Filtering**: Using `where` clauses for precise data retrieval
4. **Relationship Management**: `connect` and `disconnect` for managing graph relationships
5. **Search**: Using `OR` conditions and `CONTAINS` operators for flexible search
6. **React Query Integration**: Efficient caching, automatic refetching, and optimistic updates

## Benefits of graphql-request + React Query

- **Lightweight**: Minimal bundle size compared to Apollo Client
- **Simple API**: Direct GraphQL requests without complex configuration
- **Powerful Caching**: React Query's intelligent cache management
- **Developer Experience**: Built-in devtools, loading/error states, automatic retries
- **Flexible**: Easy to customize request headers, error handling, and cache strategies

## Troubleshooting

- **Authentication errors**: Verify your GraphQL endpoint URL and token in `.env`
- **Schema mismatch**: Check that your Movie database schema matches the queries
- **CORS issues**: Ensure your Neo4j Aura instance allows requests from localhost
- **Type errors**: Verify TypeScript types match your GraphQL schema
- **Query errors**: Use React Query DevTools to inspect query states and errors
- **Network issues**: Check browser console for request/response details
