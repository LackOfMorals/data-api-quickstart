import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { Search } from './components/Search';
import { RelationshipManager } from './components/RelationshipManager';
import { Movie } from './types/movie';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900">Movie Manager</h1>
          <nav className="flex gap-3">
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Movies
            </button>
            <button 
              onClick={() => setView('create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Movie
            </button>
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
