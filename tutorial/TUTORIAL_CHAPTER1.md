# Chapter 1: Set Up Your Environment

In this chapter, you'll set up your development environment, create a React application, and connect it to your Neo4j database.

## Create Your React Application

First, create a new React application with TypeScript support using Vite:

```bash
npm create vite@latest movie-manager -- --template react-ts
cd movie-manager
```

This creates a new directory called `movie-manager` with a basic React + TypeScript setup.

## Install Required Dependencies

Install the packages you'll need for this tutorial:

```bash
npm install
npm install graphql-request graphql
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

These packages provide:
- **graphql-request**: A lightweight GraphQL client for making requests
- **graphql**: Core GraphQL functionality
- **@tanstack/react-query**: Powerful data fetching and caching
- **@tanstack/react-query-devtools**: Development tools for debugging queries

## Set Up Your Neo4j Database

### Load the Movies Dataset

1. Log in to your [Neo4j Aura Console](https://console.neo4j.io/)
2. Open your database instance
3. Click on "Query" to open the Neo4j Browser
4. Run this command to load the Movies dataset:

```cypher
:play movie-graph
```

5. Follow the instructions in the guide to create the sample data

### Enable DataAPI GraphQL

1. In the Aura Console, navigate to your database
2. Click on the "APIs" tab
3. Enable "DataAPI GraphQL"
4. Note your GraphQL endpoint URL
5. Create an API token and save it securely

Your endpoint will look like: `https://your-instance-id.databases.neo4j.io/graphql`

## Configure Your Application

Create a `.env` file in the root of your project:

```bash
touch .env
```

Add your Neo4j credentials to `.env`:

```env
VITE_NEO4J_GRAPHQL_URL=https://your-instance-id.databases.neo4j.io/graphql
VITE_NEO4J_GRAPHQL_TOKEN=your-api-token-here
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It's already included in the `.gitignore` file created by Vite.

## Create the GraphQL Client

Create a new directory and file for your GraphQL client configuration:

```bash
mkdir src/lib
touch src/lib/graphql-client.ts
```

Add the following code to `src/lib/graphql-client.ts`:

```typescript
import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_NEO4J_GRAPHQL_URL,
  {
    headers: {
      authorization: `Bearer ${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`,
    },
  }
);
```

This creates a configured GraphQL client that will authenticate with your Neo4j database.

## Set Up React Query

Update your `src/main.tsx` to include React Query:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

## Test Your Setup

Start your development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173`. You should see the default Vite + React page.

If everything works, you're ready to move on to the next chapter!

## What You've Accomplished

✅ Created a React + TypeScript application  
✅ Installed necessary dependencies  
✅ Set up a Neo4j database with the Movies dataset  
✅ Enabled DataAPI GraphQL  
✅ Configured your application to connect to Neo4j  
✅ Set up React Query for data management

**Next**: [Chapter 2: Read Data from Neo4j](#chapter-2-read-data-from-neo4j)

---