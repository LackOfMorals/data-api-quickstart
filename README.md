# Neo4j DataAPI GraphQL Quick Start

A comprehensive guide to building a movie management application using Neo4j DataAPI GraphQL, React, TypeScript, and graphql-request.

## What's Inside

This quick start demonstrates:

- ✅ Full CRUD operations for Movies, Actors, and Directors
- ✅ Relationship management (assign/remove actors and directors to movies)
- ✅ Global search across all entities
- ✅ Modern React + TypeScript + GraphQL stack
- ✅ graphql-request + React Query for efficient data fetching
- ✅ Clean component architecture
- ✅ Type-safe GraphQL operations

## Getting Started

Read the complete guide in [QUICKSTART.md](./QUICKSTART.md)

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **graphql-request** - Lightweight GraphQL client
- **TanStack Query (React Query)** - Powerful data fetching and caching
- **Neo4j DataAPI GraphQL** - Graph database with GraphQL API

## Prerequisites

- Node.js 18+
- Neo4j Aura instance with DataAPI GraphQL enabled
- Movies dataset loaded in your database

## Quick Links

- [Neo4j Aura](https://neo4j.com/cloud/aura/)
- [DataAPI GraphQL Documentation](https://neo4j.com/docs/aura/data-apis/graphql/)
- [graphql-request Documentation](https://github.com/jasonkuhrt/graphql-request)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## Features

### Movie Management
- List all movies with actors and directors
- Create new movies
- Update movie details
- Delete movies

### People Management
- View actors and directors
- Create new people
- Update person details
- Delete people

### Relationship Management
- Assign actors to movies
- Assign directors to movies
- Remove actors from movies
- Remove directors from movies

### Search
- Search across movies, actors, and directors
- Results show matching movies with full cast information

## Project Structure

```
movie-manager/
├── src/
│   ├── components/
│   │   ├── MovieList.tsx
│   │   ├── MovieForm.tsx
│   │   ├── Search.tsx
│   │   └── RelationshipManager.tsx
│   ├── graphql/
│   │   └── operations.ts
│   ├── lib/
│   │   └── graphql-client.ts
│   ├── types/
│   │   └── movie.ts
│   ├── App.tsx
│   └── App.css
├── .env
└── package.json
```

## Contributing

This is a quick start guide. Feel free to extend it with:
- Pagination
- Optimistic updates
- Error boundaries
- Loading skeletons
- Advanced filtering
- Sorting options
- Export functionality

## License

MIT

## Support

For issues or questions:
- Neo4j Community Forum
- Neo4j Discord
- GitHub Issues
