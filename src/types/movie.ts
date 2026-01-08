export interface Person {
  name: string;
  born?: bigint | number; // BigInt in schema, but we'll handle as number in JS
}

export interface Movie {
  title: string;
  released: bigint | number; // BigInt! is required in schema
  tagline?: string;
  peopleActedIn?: Person[];
  peopleDirected?: Person[];
}

export interface MovieFormData {
  title: string;
  released: number; // We'll convert to BigInt when sending
  tagline?: string;
}

export interface PersonFormData {
  name: string;
  born?: number;
}
