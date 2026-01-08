# Troubleshooting Guide

Common issues and solutions when building with Neo4j DataAPI GraphQL.

## Authentication Issues

### Problem: "Unauthorized" or 401 errors

**Causes:**
- Invalid or expired authentication token
- Missing `Bearer` prefix in Authorization header
- Token doesn't have permissions for the instance

**Solutions:**
1. Verify your token in the Neo4j Aura console
2. Check that the token is correctly set in `.env`:
   ```
   VITE_NEO4J_GRAPHQL_TOKEN=your-actual-token-here
   ```
3. Ensure the graphql-client.ts includes the Bearer prefix:
   ```typescript
   authorization: `Bearer ${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`
   ```
4. Restart your dev server after changing `.env` files

## CORS Issues

### Problem: "CORS policy" errors in browser console

**Causes:**
- Neo4j Aura instance not configured to allow localhost
- Incorrect origin settings

**Solutions:**
1. In Neo4j Aura console, add `http://localhost:5173` to allowed origins
2. For production, add your production domain
3. Check browser console for the exact CORS error message

## GraphQL Schema Mismatches

### Problem: "Field X doesn't exist on type Y"

**Causes:**
- Your database schema doesn't match the GraphQL queries
- Type definitions in TypeScript don't match GraphQL schema

**Solutions:**
1. Verify your database has the Movies dataset loaded:
   ```cypher
   MATCH (m:Movie) RETURN m LIMIT 1
   ```
2. Check that node labels match (Movie, Person, not Movies, People)
3. Verify relationship types (ACTED_IN, DIRECTED)
4. Use GraphQL introspection to see actual schema:
   ```graphql
   query IntrospectionQuery {
     __schema {
       types {
         name
         fields {
           name
         }
       }
     }
   }
   ```

## Data Not Appearing

### Problem: Mutations succeed but data doesn't show

**Causes:**
- React Query cache not invalidating
- Queries using wrong variables

**Solutions:**
1. Check React Query DevTools to see cache state
2. Verify `queryClient.invalidateQueries()` is called after mutations
3. Try manually refetching:
   ```typescript
   const { refetch } = useQuery(...)
   refetch()
   ```
4. Check if queries have the correct `queryKey`

## Type Errors

### Problem: TypeScript errors in components

**Common Issues:**

1. **Undefined properties on Movie type**
   ```typescript
   // Wrong
   movie.actors.map(...)
   
   // Right
   movie.actors?.map(...) || []
   ```

2. **Response type mismatches**
   ```typescript
   // Define proper response types
   interface GetMoviesResponse {
     movies: Movie[];
   }
   
   // Use in query
   graphqlClient.request<GetMoviesResponse>(GET_MOVIES, ...)
   ```

## React Query Issues

### Problem: Queries don't trigger on mount

**Solutions:**
1. Check `enabled` option - make sure it's not set to `false`
2. Verify `queryKey` is stable (not recreated on each render)
3. Check React Query DevTools for query state

### Problem: Infinite refetching loops

**Solutions:**
1. Don't include unstable objects/arrays in `queryKey`
2. Set `refetchOnWindowFocus: false` if not needed
3. Check `staleTime` and `cacheTime` settings

## GraphQL Request Errors

### Problem: Variables not being sent correctly

**Solutions:**
1. Ensure variable names match GraphQL schema exactly:
   ```graphql
   # Schema expects
   mutation CreateMovie($title: String!)
   
   # Must pass
   { title: "Movie Name" }
   ```
2. Check variable types match schema (String vs Int)
3. Verify required variables are provided

### Problem: GraphQL syntax errors

**Solutions:**
1. Validate queries with GraphQL Playground or similar tool
2. Check for common issues:
   - Missing commas between fields
   - Incorrect fragment usage
   - Mismatched brackets

## Performance Issues

### Problem: Slow queries or large response payloads

**Solutions:**
1. Add pagination:
   ```graphql
   query GetMovies($limit: Int, $offset: Int) {
     movies(options: { limit: $limit, offset: $offset }) {
       ...
     }
   }
   ```
2. Limit nested fields (don't fetch more than needed)
3. Use React Query's caching effectively
4. Consider implementing virtual scrolling for large lists

## Environment Variable Issues

### Problem: `undefined` when accessing environment variables

**Solutions:**
1. Prefix must be `VITE_` for Vite projects
2. Restart dev server after changing `.env`
3. Check file is named exactly `.env` (not `.env.txt`)
4. Verify file is in project root (where package.json is)

## Network Debugging

### Useful Tools:

1. **Browser DevTools Network Tab**
   - View actual GraphQL requests/responses
   - Check headers, payload, response status

2. **React Query DevTools**
   - Inspect cache state
   - View query status
   - Manually trigger refetch

3. **GraphQL Playground**
   - Test queries outside your app
   - Validate syntax
   - Explore schema

### How to Debug:

1. Open browser DevTools → Network tab
2. Filter by "graphql" or your endpoint
3. Click on request to see:
   - Request payload (query + variables)
   - Response data
   - Headers (including auth)
4. Look for error messages in response

## Common GraphQL Patterns Issues

### Connect/Disconnect not working

**Problem:** Relationships not being created/removed

**Solutions:**
1. Verify the `where` clause matches existing nodes:
   ```graphql
   connect: { 
     actors: { 
       where: { 
         node: { name: $actorName } # Must match exactly
       } 
     } 
   }
   ```
2. Check that both nodes exist before connecting
3. Ensure relationship type is correct (ACTED_IN vs ACTS_IN)

### Search not finding results

**Problem:** Search returns empty array

**Solutions:**
1. Check `CONTAINS` operator is case-sensitive on some fields
2. Verify field names in `OR` conditions match schema
3. Try simpler queries first to isolate issue:
   ```graphql
   query SimpleSearch {
     movies(where: { title_CONTAINS: "Matrix" }) {
       title
     }
   }
   ```

## Getting Help

If you're still stuck:

1. Check the [Neo4j Community Forum](https://community.neo4j.com/)
2. Join [Neo4j Discord](https://discord.gg/neo4j)
3. Review [DataAPI GraphQL docs](https://neo4j.com/docs/aura/data-apis/graphql/)
4. Check [graphql-request GitHub](https://github.com/jasonkuhrt/graphql-request) for client issues
5. Review [TanStack Query docs](https://tanstack.com/query/latest) for caching issues

## Still Need Help?

Include in your question:
- Exact error message
- Code snippet showing the issue
- Network request/response from DevTools
- Environment (Node version, browser, OS)
- What you've already tried
