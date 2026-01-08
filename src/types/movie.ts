export interface Person {
  name: string;
  born?: number;
}

export interface Movie {
  title: string;
  released?: number;
  tagline?: string;
  actors?: Person[];
  directors?: Person[];
}

export interface MovieFormData {
  title: string;
  released?: number;
  tagline?: string;
}

export interface PersonFormData {
  name: string;
  born?: number;
}
