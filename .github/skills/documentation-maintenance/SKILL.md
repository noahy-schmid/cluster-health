---
name: documentation-maintenance
description: "Maintain repository documentation before finishing larger implementation tasks, refactors, or agent runs. Use when updating backend use cases, exported DTOs/domain-facing objects, frontend server actions, or architecture boundaries. Ensures JSDoc is added where required, package-local docs folders stay aligned with code, and LikeC4 architecture docs remain current for domains, aggregates, use cases, frontends, database, S3, and other infrastructure relationships."
argument-hint: "Describe the change or packages that need documentation updates"
---

# Documentation Maintenance

Use this skill before finishing a larger task, especially in agent-driven work, to keep code-level and architecture-level documentation aligned with the current implementation.

## When to Use

- Before concluding a substantial backend or frontend task
- After adding, changing, renaming, or removing use cases, aggregates, exported DTOs, or server actions
- After changing domain boundaries, infrastructure integrations, or cross-package relationships
- Before opening or updating a pull request where architectural understanding matters

## Documentation Scope

### Backend code

- JSDoc on each Use Case service class, describing first in a short sentence what it does. Then with a little more detail. And then a bullet list of important constraints on the input, invariants or side effects. e.g.

```ts
/**
 * ### Command use case for updating salon base data.
 * Updates salon base data by its identifier.
 *
 * - The salon name can be updated, but must be unique (case-insensitive) across all salons.
 * - The salon data only updates if all updated fields are valid.
 */
```

- JSDoc on the fields of any input or output data objects that are part of the public API of the domain, describing what they represent and any important constraints or requirements. e.g.

  ```ts
  export interface UpdateSalonInput {
    /** The new name for the salon. Must be unique across all salons. */
    name: string;
    /** The new address for the salon. Optional. */
    address?: string;
    ...
  }
  ```

- Dont write JSDoc for any other internal types, aggregates, or implementation details that are not part of the public API of the domain.

- When writing documentation, never explain how the internal mechanism works but focus on how use cases can be used and what a caller needs to watch out for when calling.

### Frontend code

- JSDoc on server actions, describing what the action does, what the important constraints are (e.g. authentication, required fields, uniqueness), and what the expected input and output are. e.g.

```ts
/**
 * ### Action for creating a new salon during onboarding.
 * Creates a new salon using the provided form data. This salon is bound to the currently authenticated user.
 * - The salon name must be unique (case-insensitive) across all salons.
 * - The user must not have an existing salon binding, and must be authenticated.
 * @param salonData The base data for the new salon.
 * @returns An object indicating success or failure, and containing field-specific or general error messages on failure. On success, the user is redirected to the next onboarding step.
 */
```

- JSDoc for state services. Similarly to the actions the functions for state keeping services should be documented.

### Watch Outs

- Do never generate any markdown documentation files.
- For each documentation you write, ask yourself if it is neccessary for a consumer to know this information.

## Architecture-level documentation

We use a LikeC4 architecture documentation. Each package and app has a `/docs` folder with a documentation in likec4 how the domain is structured. Therefore a `model.likec4` file should be updated in the docs folder which contains the use-cases, aggregates and dependencies to other domains, infrastructure or front ends or user groups. Next to the model there should be other files providing different views on the architecture also using likec4 like a `dependencies.likec4` file which only focuses on the basic dependencies of a domain to other domains, infrastructure etc. Other views can include sequence diagrams in likec4 for each use case provided by the domain.

Frontend logic should not be documented and instead should only be added as a single component in the root `/docs/model.likec4` file with a relationship to the use cases it uses. The frontend component should not be further detailed in the architecture documentation. The root model also includes user groups and their relationships to the frontends they use.
