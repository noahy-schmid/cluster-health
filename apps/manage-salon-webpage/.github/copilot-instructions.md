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

### Layout Implementation

- Main layout wrapper in `layout.tsx` or separate `MainLayout` component
- Sidebar component with menu items
- Mobile menu overlay/drawer component
- Content area wrapper for page content

### Menu Configuration

- Define menu items in a separate configuration file
- Include icon, label, and route for each menu item
- Support nested menu items if needed in the future

## Component Architecture

### Server vs Client Components

- **Prefer server components by default** - maximize server-side rendering whenever possible
- **Use client components only when necessary** - for interactivity, hooks, or browser APIs
- When a page needs client-side code, create a `client.tsx` file next to the page file
- Example structure:
  ```
  page.tsx          # Server component (data fetching, layout)
  client.tsx        # Client component (interactive UI)
  ```

### Form Components

- **Always create forms in separate files** using the pattern `name.form.tsx`
- Place form files next to where they're used (co-location)
- **Only use form components from `src/components/website/forms/`**:
  - `FormInput` - Text inputs, URLs, numbers
  - `FormTextarea` - Multi-line text
  - `FormToggle` - Boolean switches
  - `FormActions` - Save/Cancel button pairs
  - `ImageUrlList` - Managing lists of image URLs
- **Never build custom form UI** - use existing form components
- **If you need a new form element**, create it in `src/components/website/forms/` and make it reusable
- Example form structure:

  ```tsx
  "use client";

  import FormInput from "@/components/website/forms/FormInput";
  import FormActions from "@/components/website/forms/FormActions";

  export default function NameForm({ onSubmit, onCancel, isSubmitting }) {
    // Form logic here
  }
  ```

### Authentication and Authorization Guards

- **ALWAYS use existing guards** for authentication and authorization checks
- Available guards are located in `src/api/guards/`:
  - `AuthGuard.getAuthToken()`: Get authenticated user token
  - `SalonAccessGuard.canAccessSalon(salonId)`: Check salon access
  - `WebsiteAccessGuard`: Check website access
- **DO NOT** manually handle session cookies and authentication
- **DO NOT** duplicate authentication logic

### Best Practices

- Keep server components in `page.tsx` for data fetching, authentication, and layout
- Move interactive UI to `client.tsx` when needed
- Forms should be self-contained in `.form.tsx` files
- Reuse form components consistently across the application
- Follow the existing patterns in the codebase
