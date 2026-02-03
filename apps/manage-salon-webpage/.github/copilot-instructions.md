# Manage Salon Webpage - Copilot Instructions

## Brand Identity: dein.salon

### Brand Character

dein.salon is a professional, high-quality B2B platform for hair salons (management, booking, revenue).

**Core Values:**

- Clarity & Control in daily salon operations
- Trust & Professionalism
- Modern software with artisanal depth

**Tonality:** Calm · Mature · High-quality · Functional

- NO playfulness, NO beauty kitsch
- Professional B2B aesthetic

## Design System Guidelines

**Usage Rules:**

- Use Warm Off-White for all page backgrounds and card surfaces
- Use Muted Copper sparingly for important CTAs and active states only
- Use Near-Black for all body text and UI elements
- Maintain high contrast for accessibility
- Avoid bright, playful colors

### Typography

**Primary Font: Inter**

- Use for: All UI, dashboard, forms, data, body text
- Weights: 400 (body), 500 (labels/UI), 600-700 (headlines/KPIs)
- Excellent readability, neutral, modern, ideal for data-heavy UIs

**Secondary Font: Libre Baskerville**

- Use for: Marketing headlines, landing page hero, brand moments
- Effect: Classic, high-quality, subtle salon character
- **DO NOT** use for body text in dashboard

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

### Layout Implementation

- Main layout wrapper in `layout.tsx` or separate `MainLayout` component
- Sidebar component with menu items
- Mobile menu overlay/drawer component
- Content area wrapper for page content

### Menu Configuration

- Define menu items in a separate configuration file
- Include icon, label, and route for each menu item
- Support nested menu items if needed in the future

## Do's and Don'ts

### Do:

✅ Use CSS variables for all design tokens
✅ Use Lucide React for icons
✅ Make layouts responsive with mobile-first approach
✅ Keep components small and focused
✅ Use semantic HTML elements
✅ Add proper TypeScript types
✅ Test on both desktop and mobile viewports

### Don't:

❌ Don't hardcode colors, spacing, or font sizes
❌ Don't use other icon libraries
❌ Don't use inline styles unless absolutely necessary
❌ Don't create overly complex component hierarchies
❌ Don't forget accessibility features
❌ Don't ignore dark mode support
