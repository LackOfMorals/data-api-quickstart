# Schema Discovery Guide

If you're getting GraphQL errors about unknown fields, you need to check your actual schema. This guide will help you discover the correct field names for your Neo4j DataAPI GraphQL instance.

## Quick Fix

The default queries assume your schema has these fields:
- `movies(limit: Int, offset: Int)` - for querying movies
- `actedInBy` - for actors on a Movie
- `directedBy` - for directors on a Movie

If your schema is different, follow the steps below to discover the correct field names.

## Method 1: GraphQL Introspection Query (Recommended)

Run this query in your GraphQL playground or through the browser console:

```graphql
query IntrospectionQuery {
  __type(name: "Movie") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

This will show you all available fields on the Movie type, including:
- Basic fields (title, released, tagline)
- Relationship fields (actors, directors, or whatever they're named)

## Method 2: Check the Schema Browser

1. Go to your Neo4j Aura console
2. Navigate to your database instance
3. Open the DataAPI GraphQL endpoint in a browser
4. Most GraphQL endpoints have a "Docs" or "Schema" tab on the right
5. Search for the "Movie" type to see all available fields

## Method 3: Use a GraphQL Client

Use a tool like [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/) or [Insomnia](https://insomnia.rest/) to connect to your endpoint and explore the schema visually.

## Common Schema Variations

### Variation 1: Direct Relationship Fields
```graphql
type Movie {
  title: String!
  released: Int
  tagline: String
  actors: [Person!]!        # Direct field
  directors: [Person!]!     # Direct field
}
```

### Variation 2: Connection Fields
```graphql
type Movie {
  title: String!
  released: Int
  tagline: String
  actorsConnection: PersonConnection!
  directorsConnection: PersonConnection!
}
```

### Variation 3: Named After Relationships
```graphql
type Movie {
  title: String!
  released: Int
  tagline: String
  actedInBy: [Person!]!     # Named after ACTED_IN relationship
  directedBy: [Person!]!    # Named after DIRECTED relationship
}
```

### Variation 4: Inverse Direction
```graphql
type Movie {
  title: String!
  released: Int
  tagline: String
  hasActor: [Person!]!
  hasDirector: [Person!]!
}
```

## How to Update Your Queries

Once you know your actual field names, update `src/graphql/operations.ts`:

### Example: If your schema uses `actors` and `directors`

```typescript
export const GET_MOVIES = gql`
  query GetMovies($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      title
      released
      tagline
      actors {          # Changed from actedInBy
        name
        born
      }
      directors {       # Changed from directedBy
        name
        born
      }
    }
  }
`;
```

### Example: If your schema uses connection fields

```typescript
export const GET_MOVIES = gql`
  query GetMovies($limit: Int, $offset: Int) {
    movies(limit: $limit, offset: $offset) {
      title
      released
      tagline
      actorsConnection {
        edges {
          node {
            name
            born
          }
        }
      }
      directorsConnection {
        edges {
          node {
            name
            born
          }
        }
      }
    }
  }
`;
```

### Example: If your schema uses different argument names

```typescript
// If it uses first/skip instead of limit/offset
export const GET_MOVIES = gql`
  query GetMovies($first: Int, $skip: Int) {
    movies(first: $first, skip: $skip) {
      title
      released
      tagline
    }
  }
`;

// If it uses pagination with options
export const GET_MOVIES = gql`
  query GetMovies($limit: Int, $offset: Int) {
    movies(options: { limit: $limit, offset: $offset }) {
      title
      released
      tagline
    }
  }
`;
```

## Testing Your Changes

After updating the queries, test them individually:

1. **Test basic movie query:**
   ```graphql
   query {
     movies(limit: 5) {
       title
       released
     }
   }
   ```

2. **Test with relationships:**
   ```graphql
   query {
     movies(limit: 1) {
       title
       actedInBy {
         name
       }
     }
   }
   ```

3. **Test mutations:**
   ```graphql
   mutation {
     createMovies(input: [{ title: "Test Movie", released: 2024 }]) {
       movies {
         title
       }
     }
   }
   ```

## Common Issues

### Issue: "Unknown argument 'limit' on field 'Query.movies'"

**Solution:** Your schema might use different pagination arguments:
- Try `first` and `skip` instead of `limit` and `offset`
- Or use `options: { limit: ..., offset: ... }`

### Issue: "Cannot query field 'actors' on type 'Movie'"

**Solution:** The field name is different in your schema:
- Check the introspection query results
- Common alternatives: `actedInBy`, `hasActor`, `actorsConnection`

### Issue: "Field 'movies' of required type '[Movie!]!' was not provided"

**Solution:** You might be missing the `movies` wrapper in your response handling:
- Ensure you're accessing `data.movies` in your components
- Check the actual response structure in the Network tab

## Need More Help?

1. Run the introspection query above and share the results
2. Check the browser Network tab for the actual GraphQL response
3. Look at the example data structure in the response
4. Ask in the Neo4j Community Forum with your schema details

## Quick Reference: Neo4j Movie Graph Relationships

The standard Neo4j movie graph has these relationships:

```
(Person)-[:ACTED_IN]->(Movie)
(Person)-[:DIRECTED]->(Movie)
(Person)-[:PRODUCED]->(Movie)
(Person)-[:WROTE]->(Movie)
(Person)-[:REVIEWED]->(Movie)
```

From the Movie's perspective (reverse direction):
- Movie ← ACTED_IN ← Person (actors)
- Movie ← DIRECTED ← Person (directors)

The field names in your GraphQL schema should represent these relationships, but the exact naming can vary based on how your DataAPI GraphQL was configured.
