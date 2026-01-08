# Contributing to Neo4j DataAPI GraphQL Quick Start

Thank you for your interest in contributing! This guide will help you get started.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists in GitHub Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (Node version, browser, OS)
   - Any relevant error messages or screenshots

### Improving Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or unclear explanations
- Adding more examples
- Improving code comments
- Adding troubleshooting tips
- Translating documentation

To contribute documentation:

1. Fork the repository
2. Make your changes
3. Submit a pull request with a clear description

### Contributing Code

#### Before You Start

1. Check existing issues and PRs to avoid duplicate work
2. For large changes, open an issue first to discuss the approach
3. Make sure you can run the project locally

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/data-api-quickstart.git
cd data-api-quickstart

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Neo4j credentials

# Start development server
npm run dev
```

#### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following these guidelines:
   - Write clear, concise code
   - Follow existing code style
   - Add TypeScript types
   - Update documentation if needed
   - Test your changes thoroughly

3. Commit your changes:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request:
   - Provide a clear title and description
   - Reference any related issues
   - Explain what changes you made and why
   - Add screenshots for UI changes

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper interfaces for data structures
- Avoid using `any` type
- Use meaningful variable names

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### GraphQL

- Keep queries and mutations in `src/graphql/operations.ts`
- Use fragments for reusable field selections
- Include only necessary fields in queries
- Use descriptive operation names

### CSS

- Follow existing naming conventions
- Keep selectors specific to avoid conflicts
- Use semantic class names
- Maintain responsive design

## Testing

While this is a quick start project without formal tests, please:

1. Test all functionality manually
2. Verify the app works in multiple browsers
3. Check responsive design on different screen sizes
4. Ensure no console errors or warnings

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Your PR will be reviewed by maintainers
4. Address any feedback or requested changes
5. Once approved, a maintainer will merge your PR

## What We're Looking For

Great contributions include:

### New Features
- Additional CRUD operations
- Enhanced search functionality
- Pagination improvements
- Better error handling
- Loading states and skeletons
- Optimistic updates
- Data visualization
- Export/import features

### Improvements
- Performance optimizations
- Better TypeScript types
- Improved error messages
- Better accessibility
- Mobile responsiveness
- Code refactoring

### Documentation
- More examples
- Better explanations
- Video tutorials
- Blog posts
- Translations

### Bug Fixes
- Fixing reported issues
- Improving edge cases
- Better error handling

## Resources

- [Neo4j DataAPI GraphQL Docs](https://neo4j.com/docs/aura/data-apis/graphql/)
- [React Documentation](https://react.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [graphql-request Docs](https://github.com/jasonkuhrt/graphql-request)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## Questions?

If you have questions about contributing:

- Open a GitHub Discussion
- Ask in the Neo4j Community Forum
- Join the Neo4j Discord

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this quick start better for everyone! 🎉
