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
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search movies, actors, directors..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {isLoading && <p className="text-center text-gray-600">Searching...</p>}
      
      {data?.movies && (
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Found {data.movies.length} movie(s)
          </h3>
          <div className="space-y-4">
            {data.movies.map((movie: Movie) => {
              const actors = movie.peopleActedIn || [];
              const directors = movie.peopleDirected || [];
              
              return (
                <div key={movie.title} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {movie.title} ({Number(movie.released)})
                  </h4>
                  {movie.tagline && (
                    <p className="text-gray-700 mt-1 italic">{movie.tagline}</p>
                  )}
                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      <strong className="text-gray-700">Cast:</strong>{' '}
                      <span className="text-gray-600">{actors.map(a => a.name).join(', ') || 'None'}</span>
                    </p>
                    <p>
                      <strong className="text-gray-700">Directors:</strong>{' '}
                      <span className="text-gray-600">{directors.map(d => d.name).join(', ') || 'None'}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
