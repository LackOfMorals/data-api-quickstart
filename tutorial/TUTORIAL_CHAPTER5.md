# Chapter 5: Delete Data

Let's add the ability to remove movies from your database. You'll learn about delete mutations and implementing user confirmations to prevent accidental deletions.

## Add the Delete Mutation

Update `src/graphql/operations.ts`:

```typescript
// Add this after UPDATE_MOVIE
export const DELETE_MOVIE = gql`
  mutation DeleteMovie($title: String!) {
  deleteMovies(where: { title: { eq: $title } }) {
    nodesDeleted
  }
}
`;
```

This mutation:
- Uses a `where` clause to find the movie by title
- Returns `nodesDeleted` (number of nodes removed).  Recall that you always have to return _something_ after a mutation. 


## Update Movie List with Delete

Modify `src/components/MovieList.tsx` to add delete functionality:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { GET_MOVIES, DELETE_MOVIE } from '../graphql/operations';
import type { Movie } from '../types/movie';

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

1. Implement the custom ConfirmDialog component from above
2. Show a success message after deletion
3. Add the ability to delete multiple movies at once (batch deletion)


**Next**: [Chapter 6: Manage Relationships](#chapter-6-manage-relationships)

---
