import { gql } from 'graphql-request';

// ============ QUERIES ============

export const GET_MOVIES = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
  
  query GetMovies($limit: Int, $offset: Int) {
    movies(options: { limit: $limit, offset: $offset, sort: [{ released: DESC }] }) {
      ...MovieWithPeople
    }
  }
`;

export const GET_MOVIE = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
  
  query GetMovie($title: String!) {
    movies(where: { title: $title }) {
      ...MovieWithPeople
    }
  }
`;

export const GET_PEOPLE = gql`
  query GetPeople($limit: Int) {
    people(options: { limit: $limit, sort: [{ name: ASC }] }) {
      name
      born
    }
  }
`;

export const SEARCH_ALL = gql`
  fragment MovieFields on Movie {
    title
    released
    tagline
  }
  
  fragment MovieWithPeople on Movie {
    ...MovieFields
    actors {
      name
      born
    }
    directors {
      name
      born
    }
  }
  
  query SearchAll($searchTerm: String!) {
    movies(
      where: {
        OR: [
          { title_CONTAINS: $searchTerm }
          { tagline_CONTAINS: $searchTerm }
          { actors_SOME: { name_CONTAINS: $searchTerm } }
          { directors_SOME: { name_CONTAINS: $searchTerm } }
        ]
      }
    ) {
      ...MovieWithPeople
    }
  }
`;

// ============ MUTATIONS ============

// Movie CRUD
export const CREATE_MOVIE = gql`
  mutation CreateMovie($title: String!, $released: Int, $tagline: String) {
    createMovies(
      input: [{ title: $title, released: $released, tagline: $tagline }]
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;

export const UPDATE_MOVIE = gql`
  mutation UpdateMovie(
    $title: String!
    $released: Int
    $tagline: String
  ) {
    updateMovies(
      where: { title: $title }
      update: { released: $released, tagline: $tagline }
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;

export const DELETE_MOVIE = gql`
  mutation DeleteMovie($title: String!) {
    deleteMovies(where: { title: $title }) {
      nodesDeleted
    }
  }
`;

// Person CRUD
export const CREATE_PERSON = gql`
  mutation CreatePerson($name: String!, $born: Int) {
    createPeople(input: [{ name: $name, born: $born }]) {
      people {
        name
        born
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($name: String!, $born: Int) {
    updatePeople(where: { name: $name }, update: { born: $born }) {
      people {
        name
        born
      }
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($name: String!) {
    deletePeople(where: { name: $name }) {
      nodesDeleted
    }
  }
`;

// Relationship Management
export const ASSIGN_ACTOR = gql`
  mutation AssignActor($movieTitle: String!, $actorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      connect: { actors: { where: { node: { name: $actorName } } } }
    ) {
      movies {
        title
        actors {
          name
        }
      }
    }
  }
`;

export const REMOVE_ACTOR = gql`
  mutation RemoveActor($movieTitle: String!, $actorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      disconnect: { actors: { where: { node: { name: $actorName } } } }
    ) {
      movies {
        title
      }
    }
  }
`;

export const ASSIGN_DIRECTOR = gql`
  mutation AssignDirector($movieTitle: String!, $directorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      connect: { directors: { where: { node: { name: $directorName } } } }
    ) {
      movies {
        title
        directors {
          name
        }
      }
    }
  }
`;

export const REMOVE_DIRECTOR = gql`
  mutation RemoveDirector($movieTitle: String!, $directorName: String!) {
    updateMovies(
      where: { title: $movieTitle }
      disconnect: { directors: { where: { node: { name: $directorName } } } }
    ) {
      movies {
        title
      }
    }
  }
`;
