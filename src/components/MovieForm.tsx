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
    released: new Date().getFullYear(),
    tagline: ''
  });

  const createMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<CreateMovieResponse>(CREATE_MOVIE, {
        ...data,
        released: data.released
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const updateMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<UpdateMovieResponse>(UPDATE_MOVIE, {
        ...data,
        released: data.released
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        released: Number(movie.released),
        tagline: movie.tagline || ''
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
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {movie ? 'Edit Movie' : 'Create Movie'}
        </h3>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Movie title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={!!movie}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <label htmlFor="released" className="block text-sm font-medium text-gray-700 mb-2">
            Released Year *
          </label>
          <input
            id="released"
            type="number"
            placeholder="Year"
            value={formData.released}
            onChange={e => setFormData({ 
              ...formData, 
              released: parseInt(e.target.value) || new Date().getFullYear()
            })}
            required
            min="1800"
            max="2100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
            Tagline
          </label>
          <input
            id="tagline"
            type="text"
            placeholder="Optional tagline"
            value={formData.tagline || ''}
            onChange={e => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={createMovieMutation.isPending || updateMovieMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {movie ? 'Update' : 'Create'}
          </button>
          <button 
            type="button" 
            onClick={onComplete}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
