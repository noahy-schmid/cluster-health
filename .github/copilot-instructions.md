After making changes, do not generate README.md or other documentation files using Copilot.
Also dont provide a summary of the changes made.

After making code changes, always check the modified files for errors using the get_errors tool.


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
