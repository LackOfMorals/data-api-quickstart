# Getting Started

Follow these steps to get the application running locally.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Neo4j Aura instance with DataAPI GraphQL enabled
- The Movies dataset loaded in your database

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Neo4j credentials:
   ```
   VITE_NEO4J_GRAPHQL_URL=https://your-instance-id.databases.neo4j.io/graphql
   VITE_NEO4J_GRAPHQL_TOKEN=your-auth-token
   ```

### Where to find your credentials:

1. Log in to [Neo4j Aura Console](https://console.neo4j.io/)
2. Select your database instance
3. Click "Connect" → "DataAPI GraphQL"
4. Copy the endpoint URL and generate an auth token

## Step 3: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 4: Load the Movies Dataset (if not already loaded)

If you don't have the Movies dataset in your database:

1. Go to Neo4j Aura Console
2. Open your database with Neo4j Browser
3. Run this command to load the dataset:
   ```cypher
   :play movies
   ```
4. Follow the instructions to load the sample data

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── MovieList.tsx
│   ├── MovieForm.tsx
│   ├── Search.tsx
│   └── RelationshipManager.tsx
├── graphql/            # GraphQL operations
│   └── operations.ts
├── lib/                # Utilities & config
│   └── graphql-client.ts
├── types/              # TypeScript types
│   └── movie.ts
├── App.tsx             # Main application
├── App.css             # Styles
└── main.tsx            # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Port already in use

If port 5173 is already in use, Vite will automatically use the next available port. Check the terminal output for the actual port.

### Environment variables not working

Make sure:
1. Your `.env` file is in the project root (same directory as `package.json`)
2. Variable names start with `VITE_`
3. You've restarted the dev server after changing `.env`

### CORS errors

Ensure your Neo4j Aura instance allows requests from `http://localhost:5173`. You can configure this in the Aura console.

### GraphQL errors

Verify:
1. Your endpoint URL is correct
2. Your auth token is valid
3. The Movies dataset is loaded in your database
4. The schema matches the queries (Movie and Person node labels)

## Next Steps

- Read [QUICKSTART.md](./QUICKSTART.md) for a detailed tutorial
- Check [BEST_PRACTICES.md](./BEST_PRACTICES.md) for production tips
- Explore [ADVANCED_EXAMPLES.md](./ADVANCED_EXAMPLES.md) for more features
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if you encounter issues

## Support

- [Neo4j Community Forum](https://community.neo4j.com/)
- [Neo4j Discord](https://discord.gg/neo4j)
- [DataAPI GraphQL Documentation](https://neo4j.com/docs/aura/data-apis/graphql/)
