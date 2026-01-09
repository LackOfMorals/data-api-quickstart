export interface Person {
  name: string;
  born?: number; // It's an Int in the GraphQL schema but number works here. 
}

export interface Movie {
  title: string;
  released: number ; // It's an Int in the GraphQL schema but number works here. 
  tagline?: string;
  peopleActedIn?: Person[];
  peopleDirected?: Person[];
}

export interface MovieFormData {
  title: string;
  released: number; // It's an Int in the GraphQL schema but number works here. 
  tagline?: string;
}

export interface PersonFormData {
  name: string;
  born?: number; // It's an Int in the GraphQL schema but number works here. 
}
