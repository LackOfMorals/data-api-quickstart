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
              <strong>Actors:</strong> {movie.actors?.map(a => a.name).join(', ') || 'None'}
            </div>
            <div>
              <strong>Directors:</strong> {movie.directors?.map(d => d.name).join(', ') || 'None'}
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
