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
