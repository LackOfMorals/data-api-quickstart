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
