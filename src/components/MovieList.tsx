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
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES)
  });
  
  const deleteMovieMutation = useMutation({
    mutationFn: async (title: string) =>
      graphqlClient.request<DeleteMovieResponse>(DELETE_MOVIE, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  if (isLoading) return <div className="text-center py-8">Loading movies...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.movies.map((movie: Movie) => {
          const actors = movie.peopleActedIn || [];
          const directors = movie.peopleDirected || [];
          
          return (
            <div key={movie.title} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{movie.title}</h3>
              <p className="text-gray-600 mb-1">Released: {Number(movie.released)}</p>
              {movie.tagline && <p className="text-gray-700 mb-4 italic">{movie.tagline}</p>}
              
              <div className="space-y-2 mb-4 text-sm">
                <div>
                  <strong className="text-gray-700">Actors:</strong>{' '}
                  <span className="text-gray-600">{actors.map(a => a.name).join(', ') || 'None'}</span>
                </div>
                <div>
                  <strong className="text-gray-700">Directors:</strong>{' '}
                  <span className="text-gray-600">{directors.map(d => d.name).join(', ') || 'None'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(movie)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onManage(movie)}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  Manage Cast
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Delete "${movie.title}"?`)) {
                      deleteMovieMutation.mutate(movie.title);
                    }
                  }}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
