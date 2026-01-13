# Chapter 6: Manage Relationships

The real power of a graph database lies in relationships. In this chapter, you'll learn to connect movies with actors and directors, and manage these relationships dynamically.

## Understanding Graph Relationships

In Neo4j, relationships connect nodes and have:
- A **type** (e.g., ACTED_IN, DIRECTED)
- A **direction** (from one node to another)
- Optional **properties** (e.g., roles: ["Neo"])

In GraphQL, we manage relationships using `connect` and `disconnect` operations:

```graphql
# Connect an actor to a movie
mutation AssignActor($movieTitle: String!, $actorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleActedIn: {
        connect: {
          edge: { roles: "actor" }
          where: { node: { name: { eq: $actorName } } }
        }
      }
    }
  ) {
    movies {
      title
      peopleActedIn {
        name
      }
    }
  }
}
```

- **Filter** for a particular movie `where: { title: { eq: $movieTitle } }`
- We link a movie with an actor by updating **peopleActedIn**  using `where: { node: { name: { eq: $actorName } } }`
- Like any other **mutation**, we always return fields; the movie and the name of the actor


# Disconnect an actor from a movie

```graphql
mutation RemoveActor($movieTitle: String!, $actorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleActedIn: {
        disconnect: {
          where: { node: { name: { eq: $actorName } } }
        }
      }
    }
  ) {
    movies {
      title
      peopleActedIn {
        name
      }
    }
  }
}
```
The GraphQL statement to remove an actor from a movie is very similar to that used to assign them.  This time we use **disconnect**

- We **find** the actor by using `where: { node: { name: { eq: $actorName } } }`

Lets add these mutations to our GraphQL statements.


## Add Relationship Mutations

Update `src/graphql/operations.ts`:

```typescript
// Add after DELETE_MOVIE

// First, add a query to get all people
export const GET_PEOPLE = gql`
  query GetPeople {
    people {
      name
      born
    }
  }
`;


// Relationship management mutations
export const ASSIGN_ACTOR = gql`
mutation AssignActor($movieTitle: String!, $actorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleActedIn: {
        connect: {
          edge: { roles: "actor" }
          where: { node: { name: { eq: $actorName } } }
        }
      }
    }
  ) {
    movies {
      title
      peopleActedIn {
        name
      }
    }
  }
}
`;


export const REMOVE_ACTOR = gql`
mutation RemoveActor($movieTitle: String!, $actorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleActedIn: {
        disconnect: {
          where: { node: { name: { eq: $actorName } } }
        }
      }
    }
  ) {
    movies {
      title
      peopleActedIn {
        name
      }
    }
  }
}
`;

export const ASSIGN_DIRECTOR = gql`
mutation AssignDirector($movieTitle: String!, $directorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleDirected: {
        connect: { where: { node: { name: { eq: $directorName } } } }
      }
    }
  ) {
    movies {
      title
      peopleDirected {
        name
      }
    }
  }
}
`;


export const REMOVE_DIRECTOR = gql`
  mutation RemoveDirector($movieTitle: String!, $directorName: String!) {
    updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleDirected: {
        disconnect: {
          where: { node: { name: { eq: $directorName } } }
        }
      }
    }
  ) {
      movies {
        title
        peopleDirected {
          name
        }
      }
    }
  }
`;

```

## Create Relationship Manager Component

Create `src/components/RelationshipManager.tsx`:

```typescript
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { 
  ASSIGN_ACTOR, 
  REMOVE_ACTOR, 
  ASSIGN_DIRECTOR, 
  REMOVE_DIRECTOR,
  GET_PEOPLE 
} from '../graphql/operations';
import type { Movie } from '../types/movie';

interface Props {
  movie: Movie;
  onComplete: () => void;
}

interface GetPeopleResponse {
  people: { name: string; born?: number }[];
}

export function RelationshipManager({ movie, onComplete }: Props) {
  const queryClient = useQueryClient();
  const [selectedPerson, setSelectedPerson] = useState('');
  const [relationType, setRelationType] = useState<'actor' | 'director'>('actor');

  const { data: peopleData, isLoading: peopleLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () =>
      graphqlClient.request<GetPeopleResponse>(GET_PEOPLE, { limit: 200 })
  });

  const assignActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(ASSIGN_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setSelectedPerson('');
    }
  });

  const removeActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(REMOVE_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  const assignDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(ASSIGN_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setSelectedPerson('');
    }
  });

  const removeDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(REMOVE_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  const handleAssign = () => {
    if (!selectedPerson) {
      alert('Please select a person');
      return;
    }

    // Check if already assigned
    if (relationType === 'actor' && movie.peopleActedIn?.some(a => a.name === selectedPerson)) {
      alert('This person is already an actor in this movie');
      return;
    }
    if (relationType === 'director' && movie.peopleDirected?.some(d => d.name === selectedPerson)) {
      alert('This person is already a director of this movie');
      return;
    }

    if (relationType === 'actor') {
      assignActorMutation.mutate({
        movieTitle: movie.title,
        actorName: selectedPerson
      });
    } else {
      assignDirectorMutation.mutate({
        movieTitle: movie.title,
        directorName: selectedPerson
      });
    }
  };

  const handleRemove = (personName: string, type: 'actor' | 'director') => {
    const confirmed = window.confirm(
      `Remove ${personName} as ${type === 'actor' ? 'an actor' : 'a director'} from ${movie.title}?`
    );

    if (!confirmed) return;

    if (type === 'actor') {
      removeActorMutation.mutate({
        movieTitle: movie.title,
        actorName: personName
      });
    } else {
      removeDirectorMutation.mutate({
        movieTitle: movie.title,
        directorName: personName
      });
    }
  };

  // Get available people (not already assigned in current role)
  const availablePeople = peopleData?.people.filter(person => {
    if (relationType === 'actor') {
      return !movie.peopleActedIn?.some(a => a.name === person.name);
    } else {
      return !movie.peopleDirected?.some(d => d.name === person.name);
    }
  }) || [];

  return (
    <div className="relationship-manager">
      <div className="manager-header">
        <h2>Manage Cast & Crew</h2>
        <h3>{movie.title}</h3>
      </div>

      <div className="current-relationships">
        <div className="relationship-section">
          <h4>Actors ({movie.peopleActedIn?.length || 0})</h4>
          {movie.peopleActedIn && movie.peopleActedIn.length > 0 ? (
            <ul className="person-list">
              {movie.peopleActedIn.map(actor => (
                <li key={actor.name}>
                  <div className="person-info">
                    <span className="person-name">{actor.name}</span>
                    {actor.born && (
                      <span className="person-born">Born {actor.born}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(actor.name, 'actor')}
                    className="btn-remove"
                    disabled={removeActorMutation.isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No actors assigned</p>
          )}
        </div>

        <div className="relationship-section">
          <h4>Directors ({movie.peopleDirected?.length || 0})</h4>
          {movie.peopleDirected && movie.peopleDirected.length > 0 ? (
            <ul className="person-list">
              {movie.peopleDirected.map(director => (
                <li key={director.name}>
                  <div className="person-info">
                    <span className="person-name">{director.name}</span>
                    {director.born && (
                      <span className="person-born">Born {director.born}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(director.name, 'director')}
                    className="btn-remove"
                    disabled={removeDirectorMutation.isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No directors assigned</p>
          )}
        </div>
      </div>

      <div className="add-relationship">
        <h4>Add Person</h4>
        <div className="add-form">
          <select 
            value={relationType} 
            onChange={e => {
              setRelationType(e.target.value as 'actor' | 'director');
              setSelectedPerson('');
            }}
            className="role-select"
          >
            <option value="actor">Actor</option>
            <option value="director">Director</option>
          </select>

          <select 
            value={selectedPerson} 
            onChange={e => setSelectedPerson(e.target.value)}
            className="person-select"
            disabled={peopleLoading}
          >
            <option value="">
              {peopleLoading ? 'Loading people...' : 'Select person...'}
            </option>
            {availablePeople.map((person) => (
              <option key={person.name} value={person.name}>
                {person.name} {person.born ? `(${person.born})` : ''}
              </option>
            ))}
          </select>

          <button 
            onClick={handleAssign} 
            disabled={
              !selectedPerson || 
              assignActorMutation.isPending || 
              assignDirectorMutation.isPending
            }
            className="btn-primary"
          >
            Add {relationType}
          </button>
        </div>
      </div>

      <div className="manager-actions">
        <button onClick={onComplete} className="btn-secondary">
          Done
        </button>
      </div>
    </div>
  );
}
```

## Add "Manage Cast" Button to Movie List

Update `src/components/MovieList.tsx`:

```typescript
// Update the interface to include onManage
interface MovieListProps {
  onEdit: (movie: Movie) => void;
  onManage: (movie: Movie) => void;  // Add this
}

// Update the component signature
export function MovieList({ onEdit, onManage }: MovieListProps) {
  // ... existing code ...

  // In the JSX, update the card-actions div:
  <div className="card-actions">
    <button 
      onClick={() => onEdit(movie)}
      className="btn-edit"
    >
      Edit
    </button>
    <button 
      onClick={() => onManage(movie)}
      className="btn-manage"
    >
      Manage Cast
    </button>
    <button 
      onClick={() => handleDelete(movie)}
      className="btn-delete"
      disabled={deleteMovieMutation.isPending}
    >
      {deleteMovieMutation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  </div>
}
```

## Update App Component

Update `src/App.tsx`:

```typescript
import { useState } from 'react';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import { RelationshipManager } from './components/RelationshipManager';
import type { Movie } from './types/movie';
import './App.css';

function App() {
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
        <h1>🎬 Movie Manager</h1>
        <nav>
          <button 
            onClick={() => setView('list')}
            className={view === 'list' ? 'active' : ''}
          >
            Movies
          </button>
          <button 
            onClick={() => {
              setSelectedMovie(undefined);
              setView('create');
            }}
            className={view === 'create' ? 'active' : ''}
          >
            Add Movie
          </button>
        </nav>
      </header>
      
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
          <RelationshipManager 
            movie={selectedMovie} 
            onComplete={handleComplete} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
```

## Add Relationship Manager Styles

Add to `src/App.css`:

```css
/* Relationship Manager Styles */

.relationship-manager {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.manager-header h2 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #1f2937;
}

.manager-header h3 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #6b7280;
  font-weight: normal;
}

.current-relationships {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.relationship-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #374151;
  font-size: 1rem;
}

.person-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.person-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.person-name {
  font-weight: 500;
  color: #1f2937;
}

.person-born {
  font-size: 0.875rem;
  color: #6b7280;
}

.btn-remove {
  padding: 6px 12px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  background: #f9fafb;
  border-radius: 6px;
}

.add-relationship {
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
}

.add-relationship h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #374151;
}

.add-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.role-select,
.person-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.role-select {
  width: 120px;
}

.person-select {
  flex: 1;
}

.manager-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-manage {
  padding: 6px 12px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-manage:hover {
  background: #7c3aed;
}
```

## Test Relationship Management

Try managing relationships:

1. Click "Manage Cast" on any movie
2. View current actors and directors
3. Select a role type (actor or director)
4. Choose a person from the dropdown
5. Click "Add actor" or "Add director"
6. Try removing people from the movie
7. Click "Done" and see the updated movie card

## Understanding Connect vs Disconnect

The `connect` operation creates a relationship:
- Finds the specified nodes (movie and person)
- Creates a relationship between them
- Doesn't fail if the relationship already exists

The `disconnect` operation removes a relationship:
- Finds the specified nodes
- Removes the relationship between them
- Leaves both nodes in the database

## What You've Learned

✅ Managing relationships in a graph database  
✅ Using GraphQL `connect` and `disconnect` operations  
✅ Building complex UI for relationship management  
✅ Preventing duplicate relationships  
✅ Working with nested mutations  
✅ Filtering available options based on existing data

## Try It Yourself

Enhance relationship management:

1. Add relationship properties (e.g., roles for actors)
2. Create a dedicated "People" view to manage all people

**Next**: [Chapter 7: Search and Filter](#chapter-7-search-and-filter)

---

