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

