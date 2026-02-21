# Introduction

This file contains some rules of how to structure frontend applications

## Server vs Client Components

- **Prefer server components by default** - maximize server-side rendering whenever possible
- **Use client components only when necessary** - for interactivity, hooks, or browser APIs
- When a page needs client-side code, create a `client.tsx` file next to the page file
- Example structure:
  ```
  page.tsx          # Server component (data fetching, layout)
  client.tsx        # Client component (interactive UI)
  ```

# Components

For each UI element you should search the `src/components` folder to see if there is already a reusable component which might suit the purpose of what you are doing. If none exists, you might want to create one there that can be reused. These components should not have any domain specific logic.

Components that might contain domain logic or are just specific to the local page, should be created inside the page folder and be called `<some>.component.ts` (or if it is a form `<some>.form.ts`)

# Server Actions

All server communication is done through server actions. These should be placed inside the page directory for most purposes called `<some>.actions.ts`. For general purposes required more often they should be placed in the `/src/api` folder. Most logic in server actions is written in Effect-TS since these are just gateways to the backend domains. They can directly return the Effect.runPromise with all errors and logic handled inside effect. Server actions always return a type of {success: true, data: sth} | {success: false, error: string}

# Authentication

For authentication, guards within the `/src/api/guards` folder should be used, there typically is a guard with `SomeGuard.canDoSth()` which returns true or false. if no guard exists, create one. These guards should be called as a first step at each server action.

# Forms

Forms should always be contained in a seperate file and should be coupled to a server action which is called through the action property of the form! if they are only used on one page, put them in the page folder called `<some>.form.ts` otherwise they might live in the `src/components` folder. Also for specific fields within a form, search if that field already exists as a component in the components folder, if not, put one there.
