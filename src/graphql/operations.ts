import { gql } from 'graphql-request';

// ============ QUERIES ============

export const GET_MOVIES = gql`
  query GetMovies {
    movies {
      title
      released
      tagline
      peopleActedIn {
        name
        born
      }
      peopleDirected {
        name
        born
      }
    }
  }
`;

export const GET_MOVIE = gql`
  query GetMovie($title: String!) {
    movies(where: { title: $title }) {
      title
      released
      tagline
      peopleActedIn {
        name
        born
      }
      peopleDirected {
        name
        born
      }
    }
  }
`;

export const GET_PEOPLE = gql`
  query GetPeople {
    people {
      name
      born
    }
  }
`;

export const SEARCH_ALL = gql`
  query SearchAll($searchTerm: String!) {
    movies(
      where: {
        OR: [
          { title_CONTAINS: $searchTerm }
          { tagline_CONTAINS: $searchTerm }
          { peopleActedIn_SOME: { name_CONTAINS: $searchTerm } }
          { peopleDirected_SOME: { name_CONTAINS: $searchTerm } }
        ]
      }
    ) {
      title
      released
      tagline
      peopleActedIn {
        name
        born
      }
      peopleDirected {
        name
        born
      }
    }
  }
`;

// ============ MUTATIONS ============

// Movie CRUD
export const CREATE_MOVIE = gql`
  mutation CreateMovie($title: String!, $released: BigInt!, $tagline: String) {
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
    $released: BigInt
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
  mutation CreatePerson($name: String!, $born: BigInt) {
    createPeople(input: [{ name: $name, born: $born }]) {
      people {
        name
        born
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($name: String!, $born: BigInt) {
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
      connect: { peopleActedIn: { where: { node: { name: $actorName } } } }
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
      where: { title: $movieTitle }
      disconnect: { peopleActedIn: { where: { node: { name: $actorName } } } }
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
      connect: { peopleDirected: { where: { node: { name: $directorName } } } }
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
      where: { title: $movieTitle }
      disconnect: { peopleDirected: { where: { node: { name: $directorName } } } }
    ) {
      movies {
        title
      }
    }
  }
`;
