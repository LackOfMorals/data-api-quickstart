# Tailwind CSS Setup

This project uses Tailwind CSS for styling. Here's how to set it up and use it.

## Installation

The dependencies are already in `package.json`. Just run:

```bash
npm install
```

## Configuration Files

The project includes these Tailwind configuration files:

1. **tailwind.config.js** - Tailwind configuration
2. **postcss.config.js** - PostCSS configuration for processing Tailwind
3. **src/index.css** - Contains Tailwind directives

## Using Tailwind Classes

### Utility-First Approach

Tailwind uses utility classes directly in your JSX. Here are some examples from this project:

```tsx
// Buttons
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click Me
</button>

// Cards
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  Content here
</div>

// Forms
<input 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Responsive Design

Tailwind uses mobile-first responsive prefixes:

```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

Breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### Common Patterns in This Project

#### Color Scheme
- Primary (Blue): `bg-blue-600`, `hover:bg-blue-700`
- Success (Green): `bg-green-600`, `hover:bg-green-700`
- Danger (Red): `bg-red-600`, `hover:bg-red-700`
- Secondary (Gray): `bg-gray-200`, `hover:bg-gray-300`
- Purple: `bg-purple-600`, `hover:bg-purple-700`

#### Spacing
- Padding: `p-4`, `px-6`, `py-2`
- Margin: `mb-6`, `mt-4`, `space-y-4`
- Gap: `gap-3`, `gap-6`

#### Typography
- Headings: `text-2xl font-bold`, `text-xl font-semibold`
- Body: `text-gray-700`, `text-sm`
- Muted: `text-gray-500 italic`

#### Borders & Shadows
- Border: `border border-gray-200`
- Rounded: `rounded-lg`, `rounded-md`
- Shadow: `shadow-sm`, `hover:shadow-md`

### State Variants

```tsx
// Hover
<button className="hover:bg-blue-700">

// Disabled
<button className="disabled:bg-gray-400 disabled:cursor-not-allowed">

// Focus
<input className="focus:ring-2 focus:ring-blue-500">
```

## Customizing Tailwind

To add custom colors, fonts, or spacing, edit `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        'brand': '#your-color',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
}
```

## VS Code IntelliSense

Install the "Tailwind CSS IntelliSense" extension for autocomplete:

1. Open VS Code
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "Tailwind CSS IntelliSense"
4. Install it

This gives you:
- Autocomplete for class names
- Linting
- Hover previews
- Syntax highlighting

## Tips

1. **Don't worry about file size** - Tailwind automatically removes unused classes in production builds

2. **Use @apply sparingly** - Prefer utility classes directly in JSX for better visibility

3. **Compose with utility classes** - Instead of creating custom CSS classes, combine utilities:
   ```tsx
   <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
   ```

4. **Extract components, not CSS** - If you're repeating class names, create a React component instead

5. **Use Flexbox and Grid** - Tailwind has excellent utilities for modern layouts

## Documentation

Full Tailwind documentation: https://tailwindcss.com/docs

## Cheat Sheet

Quick reference: https://nerdcave.com/tailwind-cheat-sheet
