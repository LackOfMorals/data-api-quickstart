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
      graphqlClient.request<GetPeopleResponse>(GET_PEOPLE)
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

  const actors = movie.peopleActedIn || [];
  const directors = movie.peopleDirected || [];

  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Manage Cast & Crew - {movie.title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Actors</h4>
            {actors.length === 0 && (
              <p className="text-gray-500 italic text-sm">No actors assigned</p>
            )}
            <div className="space-y-2">
              {actors.map(actor => (
                <div key={actor.name} className="flex justify-between items-center bg-white border border-gray-200 rounded-md p-3">
                  <span className="text-gray-800">{actor.name}</span>
                  <button 
                    onClick={() => handleRemove(actor.name, 'actor')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Directors</h4>
            {directors.length === 0 && (
              <p className="text-gray-500 italic text-sm">No directors assigned</p>
            )}
            <div className="space-y-2">
              {directors.map(director => (
                <div key={director.name} className="flex justify-between items-center bg-white border border-gray-200 rounded-md p-3">
                  <span className="text-gray-800">{director.name}</span>
                  <button 
                    onClick={() => handleRemove(director.name, 'director')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Person</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={relationType} 
              onChange={e => setRelationType(e.target.value as 'actor' | 'director')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="actor">Actor</option>
              <option value="director">Director</option>
            </select>

            <select 
              value={selectedPerson} 
              onChange={e => setSelectedPerson(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select person...</option>
              {peopleData?.people.map((person) => (
                <option key={person.name} value={person.name}>
                  {person.name}
                </option>
              ))}
            </select>

            <button 
              onClick={handleAssign} 
              disabled={!selectedPerson}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Add {relationType}
            </button>
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
