After making changes, do not generate README.md or other documentation files using Copilot.
Also dont provide a summary of the changes made.

After making code changes, always check the modified files for errors using the get_errors tool.

## Unexpected Changes

- If you notice files changed unexpectedly, re-read the affected files and continue without blocking.

## Database Migrations

- **Schema changes**: Update the schema.ts file when adding new tables or fields
- **Do NOT create migration files manually** - migrations are generated automatically by the database tooling
- Only define the schema structure in schema.ts

## Implementation Approach

**Before implementing new classes or functions or types:**

1. First create function/method signatures with JSDoc comments explaining purpose, parameters, and return values
2. Present the signatures to the user for approval
3. Only proceed with full implementation after user confirms the signatures are correct
4. This applies to:
   - New classes with all their methods
   - New repository classes
   - New service classes
   - Any file containing multiple new functions
5. To get the confirmation of the user, print the signatures in a clear format and ask for approval before proceeding, dont use the `askQuestions` tool.
6. This also applies when changing the signature of functions, types, or classes that already exist. _Always_ present the proposed signature changes to the user for approval before implementing.

**Before implementing Logic:**

1. If in any doubt about details of an implementation use the `askQuestions` tool to clarify requirements before proceeding with the implementation. This applies to any implementation task, including small functions or methods.

## Guidelines for NextJS Frontends

### Component Structure

- Use **client components** (`"use client"`) only when necessary (interactivity, hooks, state)
- Use **server components** by default for better performance
- Organize components in a logical folder structure under `src/components/`

### Layout Guidelines

- **Desktop**: Fixed sidebar on the left, scrollable content area on the right
- **Mobile**: Hamburger menu, full-width content, sidebar as overlay/drawer
- **Responsive breakpoints**: Use Tailwind's default breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Sidebar width**: Consistent across the application
- **Header**: Optional sticky header for mobile with hamburger menu

### Icon Usage

- **Only use Lucide React** for all icons
- Import icons individually: `import { MenuIcon } from 'lucide-react'`
- Use consistent icon sizes defined via CSS variables

### Styling Conventions

- Use **Tailwind CSS** for all styling
- Use the defined variables from the @theme in `globals.css` like `p-md`, `rounded-lg` etc.
- Dont use custom css
- Maintain the calm, professional aesthetic: subtle shadows, rounded corners, generous whitespace
- Dark mode: Use darker, muted tones that maintain the professional, calm character

### Code Quality

- **TypeScript**: Use proper typing, avoid `any`
- **Prefer `undefined` over `null`**: Use `undefined` for optional values and uninitialized state
- **Accessibility**: Include proper ARIA labels, keyboard navigation
- **Performance**: Optimize images, lazy load when appropriate
- **Mobile-first**: Design mobile view first, then enhance for desktop
- **Modularity**: For each UI component, create small reusable pieces in seperate files, if a piece belongs to another, use subfolders.
- **Error Checking**: ALWAYS check files for errors using get_errors tool before finishing a task, especially after editing code
- **Task Planning**: For multi-step tasks, ALWAYS create a todo list first using the manage_todo_list tool before implementing

### File Naming

- Components: PascalCase (e.g., `Sidebar.tsx`, `MainLayout.tsx`)
- Utilities: kebab-case (e.g., `menu-items.ts`)
- CSS: kebab-case (e.g., `globals.css`)

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- For sidebar toggle: Use client-side state or context if needed across components
- Keep state as close to where it's used as possible

## Architecture Decisions

### Server Actions

- **ALWAYS use Server Actions** instead of API routes (`app/api/*/route.ts`) when possible
- Place all server actions in the `src/api/` folder
- Use `"use server"` directive at the top of action files
- Name action files with `-actions.ts` suffix (e.g., `sections-actions.ts`, `website-actions.ts`)
- Server actions provide better integration with React Server Components and forms

### Import Statements

- **NEVER use dynamic imports** (e.g., `await import(...)`)
- **ALWAYS use static imports** at the top of the file
- Dynamic imports should not be used even if you think they avoid circular dependencies
- If there are circular dependency issues, refactor the code structure instead
