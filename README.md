# Neo4j DataAPI GraphQL Quick Start

A comprehensive guide to building a movie management application using Neo4j DataAPI GraphQL, React, TypeScript, graphql-request, and Tailwind CSS.

## What's Inside

This quick start demonstrates:

- ✅ Full CRUD operations for Movies, Actors, and Directors
- ✅ Relationship management (assign/remove actors and directors to movies)
- ✅ Global search across all entities
- ✅ Modern React + TypeScript + GraphQL stack
- ✅ graphql-request + React Query for efficient data fetching
- ✅ Tailwind CSS for beautiful, responsive styling
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
- **Tailwind CSS** - Utility-first CSS framework
- **Neo4j Aura** - Graph database
- **DataAPI GraphQL** - GraphQL API layer

## Prerequisites

- Node.js 18+
- Neo4j Aura instance with DataAPI GraphQL enabled
- Movies dataset loaded in your database

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/data-api-quickstart.git
cd data-api-quickstart

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Neo4j credentials

# Run development server
npm run dev
```

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** ⭐ - Complete step-by-step tutorial
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Setup and installation
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Production-ready patterns
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[ADVANCED_EXAMPLES.md](./ADVANCED_EXAMPLES.md)** - Advanced features
- **[TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md)** - Tailwind CSS usage guide
- **[INDEX.md](./INDEX.md)** - Complete documentation index

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
│   ├── components/          # React components
│   │   ├── MovieList.tsx
│   │   ├── MovieForm.tsx
│   │   ├── Search.tsx
│   │   └── RelationshipManager.tsx
│   ├── graphql/            # GraphQL operations
│   │   └── operations.ts
│   ├── lib/                # Utilities & config
│   │   └── graphql-client.ts
│   ├── types/              # TypeScript types
│   │   └── movie.ts
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
├── tailwind.config.js      # Tailwind configuration
├── .env.example            # Environment template
└── package.json            # Dependencies
```

## Styling with Tailwind CSS

This project uses Tailwind CSS for styling. See [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md) for:
- How to use utility classes
- Common patterns
- Customization options
- Responsive design
- VS Code setup

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute.

## License

MIT - See [LICENSE](./LICENSE) for details

## Support

For issues or questions:
- [Neo4j Community Forum](https://community.neo4j.com/)
- [Neo4j Discord](https://discord.gg/neo4j)
- [GitHub Issues](https://github.com/YOUR_USERNAME/data-api-quickstart/issues)

## Next Steps

1. ⭐ Star this repository
2. 📖 Follow the [QUICKSTART.md](./QUICKSTART.md) guide
3. 💬 Join the [Neo4j Community](https://community.neo4j.com/)
4. 🚀 Build something amazing!

Happy coding! 🎉
