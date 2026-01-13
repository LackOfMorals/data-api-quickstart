# Chapter 4: Update Existing Data

With create functionality in place, let's add the ability to edit existing movies. You'll learn about mutation variables, conditional rendering, and updating your UI optimistically.

## Add the Update Mutation

Update `src/graphql/operations.ts` with an update mutation:

```typescript
// Add this after CREATE_MOVIE
export const UPDATE_MOVIE = gql`
  mutation UpdateMovie($title: String!, $released: Int, $tagline: String) {
     updateMovies(
      where: {title: {eq: $title}}
      update: {tagline: {set: $tagline}, released: {set: $released}}
  ){
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
- **`update`**: Specifies which fields to change - tagline and released


## Update the Movie Form

Modify `src/components/MovieForm.tsx` to handle both create and edit modes:

```typescript
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { CREATE_MOVIE, UPDATE_MOVIE } from '../graphql/operations';
import type { Movie, MovieFormData } from '../types/movie';

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
import type { Movie } from '../types/movie';

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
import type { Movie } from './types/movie';
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

In a graph database, we need a way to uniquely identify nodes. We're using the title as our identifier (`where: {title: {eq: $title}}`). If we allowed title changes, we'd need to:

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


**Next**: [Chapter 5: Delete Data](#chapter-5-delete-data)

---
