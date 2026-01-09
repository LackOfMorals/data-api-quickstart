# Neo4j DataAPI GraphQL Quick Start

A practical guide to building a basic React applications with Neo4j's GraphQL API.

## Who This Is For

**If you're curious about graph databases:**

You've probably heard about graph databases but haven't had the time to build with one.  You're uncertain if it will help with your use case or not.  

This quick start gives you a hands-on example using a movie graph database. You'll see how relationships work in practice and why certain queries are just easier with a graph. No theoretical explanations—just working code showing what graphs are good at.


**If you already use Neo4j:**

You know your way around Cypher and graph modeling, but want to see how to actually build a web app with Neo4j's GraphQL API. This shows you the full stack—React components, mutations, relationship management, all the patterns you need.

The code uses modern tools (React Query, TypeScript, Tailwind) and handles the graph-specific stuff like connect/disconnect operations properly.  

## What You're Building

A movie catalog where you can:
- Add/edit/delete movies
- Connect actors and directors to movies
- Search across movie titles and taglines.
- See how relationships work in a UI

It's the classic Neo4j movies dataset, but surface with a web application. Simple enough to understand quickly and yet complete enough to see real patterns.

## Prerequisites

- You're comfortable with React, TypeScript, and GraphQL basics
- Node.js 18 or newer
- A Neo4j Aura instance ( Pro trial is fine )


## Tech Stack

- React 18 + TypeScript + Vite
- graphql-request ( lighter than other GraphQL clients )
- TanStack Query for data fetching
- Tailwind CSS
- Neo4j Aura with DataAPI GraphQL

## Getting Started

If you already have Neo4j Aura instance with the Movies dataset loaded with a Data API , then it's a simple series of steps to take 


```bash
git clone https://github.com/YOUR_USERNAME/data-api-quickstart.git
cd data-api-quickstart
npm install

# Add your Neo4j DataAPI GraphQL credentials
cp .env.example .env
# Edit .env with your endpoint and token

npm run dev
```

## Documentation

The main guide is in [QUICKSTART.md](./QUICKSTART.md)—it walks through building everything step by step.

Other docs:
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Just get it running
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Production patterns
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [ADVANCED_EXAMPLES.md](./ADVANCED_EXAMPLES.md) - Pagination, optimistic updates, etc.
- [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md) - Using Tailwind utilities
- [INDEX.md](./INDEX.md) - Everything listed out


## Project Structure

```
src/
├── components/          # React components
├── graphql/            # All queries and mutations
├── lib/                # GraphQL client setup
├── types/              # TypeScript types
└── App.tsx             # Main app
```

Pretty standard React setup. The interesting bits are in `graphql/operations.ts` where you can see how Neo4j relationship queries work.

## The Graph Advantage

Here's a concrete example. To find "movies with actors who also acted in movies directed by someone who directed another movie I've seen" — that's a SQL statement with multiple JOINs and possibly multiple queries.

With a graph, it's just following relationships. The query basically describes what you want in plain language. Either that's useful for your use case or it isn't, but at least you'll know.

Not every app needs a graph database. But if your data is highly connected—social networks, recommendations, org charts, fraud detection, supply chains, bill of materials — it's worth trying.


## Contributing

Found an issue? PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT

## Questions?

- [Neo4j Community Forum](https://community.neo4j.com/)
- [Neo4j Discord](https://discord.gg/neo4j)
- [GitHub Issues](https://github.com/LackOfMorals/data-api-quickstart/issues)
