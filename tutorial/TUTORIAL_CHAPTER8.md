# Chapter 8: Deploy Your Application

Congratulations! You've taken the first steps towards creating a movie management web application. In this final chapter, you'll learn how to deploy your application so others can use it.

## Prepare for Production

### 1. Environment Variables

For production, you'll need to set up environment variables properly. Most hosting platforms provide ways to set these securely without committing them to your repository.

### 2. Build Your Application

Test your production build locally:

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

Test the build locally:

```bash
npm run preview
```

## Deploy to Vercel (Recommended)

Vercel is a popular platform for deploying React applications with great integration for Vite projects.

### Step-by-Step Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin your-repo-url
     git push -u origin main
     ```

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - Add `VITE_NEO4J_GRAPHQL_URL`
     - Add `VITE_NEO4J_GRAPHQL_TOKEN`
   - Click "Deploy"

Your app will be live at `your-project.vercel.app` in minutes!

## Deploy to Netlify

Netlify is another excellent option for static sites.

### Step-by-Step Deployment

1. **Create `netlify.toml`** in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   ```

2. **Push to GitHub** (same as above)

3. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Configure environment variables in Site settings
   - Click "Deploy site"

## Environment Variable Security

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** to your repository
2. **Use platform-specific environment variable settings** for production
3. **Consider using a backend proxy** for added security
4. **Rotate your Neo4j tokens regularly**

### Optional: Add a Backend Proxy

For better security, you might want to create a backend proxy:

```javascript
// backend/server.js
import express from 'express';
import { GraphQLClient } from 'graphql-request';

const app = express();
const client = new GraphQLClient(process.env.NEO4J_URL, {
  headers: { authorization: `Bearer ${process.env.NEO4J_TOKEN}` }
});

app.post('/api/graphql', async (req, res) => {
  try {
    const data = await client.request(req.body.query, req.body.variables);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

This keeps your Neo4j credentials server-side.

## Post-Deployment Checklist

✅ Test all CRUD operations  
✅ Verify search functionality  
✅ Test on mobile devices  
✅ Check browser console for errors  
✅ Test with different data scenarios  
✅ Verify environment variables are working  
✅ Check loading states and error handling  
✅ Test with slow network conditions

## Monitoring and Analytics

Consider adding:

1. **Error tracking**: Sentry, LogRocket
2. **Analytics**: Google Analytics, Plausible
3. **Performance monitoring**: Web Vitals, Lighthouse CI

Example Sentry integration:

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Commits to main branch** → Automatically deploy to production
- **Pull requests** → Create preview deployments
- **Branch deployments** → Test features before merging

## Performance Optimization

### 1. Code Splitting

Vite automatically code-splits your application. You can also manually split:

```typescript
const RelationshipManager = lazy(() => 
  import('./components/RelationshipManager')
);

// Use with Suspense:
<Suspense fallback={<div>Loading...</div>}>
  <RelationshipManager />
</Suspense>
```

### 2. Image Optimization

If you add images, use WebP format and lazy loading:

```typescript
<img 
  src="poster.webp" 
  alt="Movie poster"
  loading="lazy"
/>
```

### 3. Query Optimization

Use pagination for large datasets:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['movies'],
  queryFn: ({ pageParam = 0 }) => 
    graphqlClient.request(GET_MOVIES, { 
      offset: pageParam, 
      limit: 20 
    }),
  getNextPageParam: (lastPage, pages) => 
    lastPage.movies.length === 20 ? pages.length * 20 : undefined
});
```

## What You've Learned

✅ Building for production  
✅ Deploying to modern hosting platforms  
✅ Managing environment variables securely  
✅ Setting up continuous deployment  
✅ Adding monitoring and analytics  
✅ Optimizing performance

## Next Steps

Congratulations on completing this tutorial! You've built a complete web application with:

- ✅ Full CRUD operations
- ✅ GraphQL integration
- ✅ Relationship management
- ✅ Search functionality
- ✅ Production deployment
