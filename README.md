# Neo4j DataAPI GraphQL Quick Start

A practical guide to building React applications with Neo4j's GraphQL API.

## Who This Is For

**If you're curious about graph databases:**

You've probably heard about graph databases but haven't had the time to build with one. You're uncertain if it will help with your use case or not.

This project gives you hands-on examples using a movie graph database. You'll see how relationships work in practice and why certain queries are just easier with a graph. No theoretical explanations—just working code showing what graphs are good at.

**If you already use Neo4j:**

You know your way around Cypher and graph modeling, but want to see how to actually build a web app with Neo4j's GraphQL API. This shows you the full stack—React components, mutations, relationship management, all the patterns you need.

The code uses modern tools (React Query, TypeScript, Tailwind) and handles the graph-specific stuff like connect/disconnect operations properly.

## What You're Building

A movie catalog where you can:
- Add/edit/delete movies
- Connect actors and directors to movies
- Search across movie titles, taglines, and people
- See how relationships work in a UI

It's the classic Neo4j movies dataset, but surfaced with a web application. Simple enough to understand quickly and yet complete enough to see real patterns.

## Choose Your Path

### 📚 New to Neo4j GraphQL? → [Start with the Tutorial](./TUTORIAL.md)

The **[TUTORIAL.md](./TUTORIAL.md)** is a comprehensive, 8-chapter guide that builds the application step-by-step. Each chapter introduces new concepts progressively:

1. Set up your environment
2. Read data from Neo4j
3. Create new data
4. Update existing data
5. Delete data
6. Manage relationships
7. Search and filter
8. Deploy your application

Perfect if you want to understand *why* things work the way they do, with detailed explanations of GraphQL concepts, graph database patterns, and React best practices.

### ⚡ Already familiar? → [Use the Quick Start](./QUICKSTART.md)

The **[QUICKSTART.md](./QUICKSTART.md)** is a condensed reference with all the code you need. It assumes you know React, GraphQL, and basic graph concepts. You can copy-paste components and get running fast.

Perfect if you just need working code and want to customize it for your own project.

## Prerequisites

- You're comfortable with React, TypeScript, and GraphQL basics
- Node.js 18 or newer
- A Neo4j Aura instance (free tier works)

## Tech Stack

- React 18 + TypeScript + Vite
- graphql-request (lighter than other GraphQL clients)
- TanStack Query for data fetching
- Tailwind CSS
- Neo4j Aura with DataAPI GraphQL

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/data-api-quickstart.git
cd data-api-quickstart
npm install

# Add your Neo4j DataAPI GraphQL credentials
cp .env.example .env
# Edit .env with your endpoint and token

npm run dev
```

Open http://localhost:5173 and you're ready to go.

## Documentation

### Main Guides
- **[TUTORIAL.md](./TUTORIAL.md)** - Complete 8-chapter tutorial (recommended for learning)
- **[QUICKSTART.md](./QUICKSTART.md)** - Condensed reference guide (for experienced devs)
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Environment setup and Neo4j configuration

### Additional Resources
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Production patterns and optimization
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [ADVANCED_EXAMPLES.md](./ADVANCED_EXAMPLES.md) - Pagination, optimistic updates, etc.
- [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md) - Styling with Tailwind utilities
- [SCHEMA.md](./SCHEMA.md) - Understanding the GraphQL schema
- [INDEX.md](./INDEX.md) - Complete documentation index

## Project Structure

```
src/
├── components/          # React components
│   ├── MovieList.tsx
│   ├── MovieForm.tsx
│   ├── Search.tsx
│   └── RelationshipManager.tsx
├── graphql/            # All queries and mutations
│   └── operations.ts
├── lib/                # GraphQL client setup
│   └── graphql-client.ts
├── types/              # TypeScript types
│   └── movie.ts
└── App.tsx             # Main app
```

Pretty standard React setup. The interesting bits are in `graphql/operations.ts` where you can see how Neo4j relationship queries work.

## The Graph Advantage

Here's a concrete example. To find "movies with actors who also acted in movies directed by someone who directed another movie I've seen"—that's a SQL statement with multiple JOINs and possibly multiple queries.

With a graph, it's just following relationships. The query basically describes what you want in plain language:

```graphql
query {
  movies(where: { 
    actors_SOME: { 
      actedInMovies_SOME: { 
        directors_SOME: { 
          directedMovies_SOME: { 
            title_IN: $myWatchedMovies 
          }
        }
      }
    }
  }) {
    title
  }
}
```

Either that's useful for your use case or it isn't, but at least you'll know.

Not every app needs a graph database. But if your data is highly connected—social networks, recommendations, org charts, fraud detection, supply chains, bill of materials—it's worth trying.

## What You'll Learn

- **GraphQL fundamentals** - Queries, mutations, fragments, and variables
- **Graph relationships** - Connect/disconnect operations, traversing relationships
- **React patterns** - Component structure, hooks, state management
- **Data fetching** - React Query integration, caching, optimistic updates
- **TypeScript** - Type-safe GraphQL operations
- **Production deployment** - Building and deploying to Vercel/Netlify

## Example Features

The completed application demonstrates:

**CRUD Operations:**
```typescript
// Create
createMovies(input: [{ title: "Inception", released: 2010 }])

// Read
movies(where: { title: "Inception" })

// Update
updateMovies(where: { title: "Inception" }, update: { released: 2010 })

// Delete
deleteMovies(where: { title: "Inception" })
```

**Relationship Management:**
```typescript
// Connect actor to movie
updateMovies(
  where: { title: "Inception" }
  connect: { actors: { where: { node: { name: "Leonardo DiCaprio" }}}}
)

// Disconnect
updateMovies(
  where: { title: "Inception" }
  disconnect: { actors: { where: { node: { name: "Leonardo DiCaprio" }}}}
)
```

**Complex Search:**
```typescript
// Search across movies, actors, directors
movies(where: {
  OR: [
    { title_CONTAINS: "matrix" }
    { actors_SOME: { name_CONTAINS: "keanu" }}
    { directors_SOME: { name_CONTAINS: "wachowski" }}
  ]
})
```

## Contributing

Found an issue? PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT

## Questions?

- [Neo4j Community Forum](https://community.neo4j.com/)
- [Neo4j Discord](https://discord.gg/neo4j)
- [GitHub Issues](https://github.com/LackOfMorals/data-api-quickstart/issues)

---

**Ready to start?** 
- New to Neo4j GraphQL? → Start with [TUTORIAL.md](./TUTORIAL.md)
- Need quick reference? → Jump to [QUICKSTART.md](./QUICKSTART.md)
