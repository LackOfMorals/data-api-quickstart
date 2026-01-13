import { gql } from 'graphql-request';

// ============ QUERIES ============

// Query movies - should work as-is
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

// Query specific movie by title
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

// Query all people
export const GET_PEOPLE = gql`
  query GetPeople {
    people {
      name
      born
    }
  }
`;

// Search with OR conditions
export const SEARCH_ALL = gql`
  query SearchAll($searchTerm: String!) {
  movies(
    where: {
      OR: [
        { title: { contains: $searchTerm } },
        { tagline: { contains: $searchTerm } }
      ]
    }
    sort: { released: ASC }
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
  mutation CreateMovie($title: String!, $released: Int!, $tagline: String) {
    createMovies(
      input: [{ 
        title: $title
        released: $released
        tagline: $tagline 
      }]
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
  mutation UpdateMovie($title: String!, $released: Int, $tagline: String) {
     updateMovies(
      where: {title: {eq: $title}}
      update: {tagline: {set: $tagline}, released: {set: $released}}
  ){
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
  deleteMovies(where: { title: { eq: $title } }) {
    nodesDeleted
  }
}
`;

// Person CRUD
export const CREATE_PERSON = gql`
  mutation CreatePerson($name: String!, $born: Int) {
    createPeople(
      input: [{ 
        name: $name
        born: $born 
      }]
    ) {
      people {
        name
        born
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($name: String!, $born: Int) {
    updatePeople(
      where: { name: $name }
      update: { born: $born }
    ) {
      people {
        name
        born
      }
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($name: String!) {
    deletePeople(
      where: { name: $name }
    ) {
      nodesDeleted
    }
  }
`;

// ============ RELATIONSHIP MUTATIONS ============

// Connect relationships (top-level connect argument)
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

// Disconnect relationships (nested in update argument)
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
