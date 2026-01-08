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
