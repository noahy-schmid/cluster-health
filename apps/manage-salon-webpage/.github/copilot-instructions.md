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
