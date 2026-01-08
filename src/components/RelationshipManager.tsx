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
import { Movie } from '../types/movie';

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

  const { data: peopleData } = useQuery({
    queryKey: ['people'],
    queryFn: async () =>
      graphqlClient.request<GetPeopleResponse>(GET_PEOPLE, { limit: 100 })
  });

  const assignActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(ASSIGN_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const removeActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(REMOVE_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const assignDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(ASSIGN_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const removeDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(REMOVE_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const handleAssign = () => {
    if (!selectedPerson) return;

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

  return (
    <div className="relationship-manager">
      <h3>Manage Cast & Crew - {movie.title}</h3>

      <div className="current-people">
        <div>
          <h4>Current Actors</h4>
          {movie.actors?.map(actor => (
            <div key={actor.name}>
              {actor.name}
              <button onClick={() => handleRemove(actor.name, 'actor')}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div>
          <h4>Current Directors</h4>
          {movie.directors?.map(director => (
            <div key={director.name}>
              {director.name}
              <button onClick={() => handleRemove(director.name, 'director')}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="add-person">
        <h4>Add Person</h4>
        <select 
          value={relationType} 
          onChange={e => setRelationType(e.target.value as 'actor' | 'director')}
        >
          <option value="actor">Actor</option>
          <option value="director">Director</option>
        </select>

        <select 
          value={selectedPerson} 
          onChange={e => setSelectedPerson(e.target.value)}
        >
          <option value="">Select person...</option>
          {peopleData?.people.map((person) => (
            <option key={person.name} value={person.name}>
              {person.name}
            </option>
          ))}
        </select>

        <button onClick={handleAssign} disabled={!selectedPerson}>
          Add {relationType}
        </button>
      </div>

      <button onClick={onComplete}>Close</button>
    </div>
  );
}
