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

- Add or update JSDoc for every backend use case
- Add or update JSDoc for exported DTOs and other domain-facing types or objects exposed outside the domain boundary
- Do not add broad JSDoc to domain-internal helper types or internal-only objects unless explicitly requested

### Frontend code

- Add or update JSDoc for every server action
- Document action purpose, inputs, side effects, returned data, and important failure behavior when that is not obvious from the type signature

### Architecture and package docs

- Keep LikeC4 documentation current
- Model domains, aggregates, use cases, package boundaries, and infrastructure relationships
- Represent frontends as single blocks when deeper frontend internals are not necessary for the architectural view
- Maintain package-local documentation in a `docs` folder for each affected app or package
- Package-local docs should show the local structure and relationships to other domains, infrastructure, and consumer applications

## Procedure

1. Identify the affected scope.
   Determine which apps, packages, domains, and infrastructure connections changed.

2. Review changed code before writing docs.
   Inspect new or modified use cases, exported DTOs, server actions, aggregates, adapters, and cross-package entry points.

3. Update backend JSDoc.
   For each changed backend use case, document:
   - the business intent of the use case
   - the command or query it accepts
   - the result it returns, if any
   - important dependencies, orchestration responsibilities, or cross-domain validation

4. Update exposed domain API JSDoc.
   For each DTO, type, object, or service surface exposed by the domain, document:
   - what it represents
   - who consumes it
   - any important invariants or expectations
     Skip internal-only types that do not cross the domain boundary.

5. Update frontend server action JSDoc.
   For each changed server action, document:
   - what mutation or query it performs
   - expected input and return shape
   - security, authorization, or cache implications when relevant
   - noteworthy redirects, revalidation, or failure modes

6. Update package-local docs.
   In each affected app or package, create or update a `docs` folder and describe:
   - the local module structure
   - major aggregates and use cases where relevant
   - outward dependencies on infrastructure or other packages
   - inbound consumers from apps or other domains
     Use the template in [package-documentation-template.md](./assets/package-documentation-template.md).

7. Update LikeC4 architecture docs.
   Reflect the current architecture in the shared LikeC4 model. Include:
   - domain blocks and their main responsibilities
   - use cases and aggregates within the domain or package they belong to
   - relationships between domains
   - relationships to infrastructure such as database and S3
   - frontend applications as coarse-grained consumers when that is sufficient

8. Run a completion audit.
   Verify that the documentation matches the implemented names, relationships, and boundaries, not the intended design.

## Decision Rules

- If a type is exported from a domain package or appears in a public domain entry point, document it.
- If a type is only used internally within a domain, do not document it by default.
- If a frontend change only alters rendering and not server actions or architectural boundaries, package docs or LikeC4 updates may be unnecessary.
- If a change affects cross-domain flows, infrastructure, or system boundaries, update both local docs and LikeC4.
- If the exact architecture view is unclear, prefer a simpler accurate model over an overly detailed speculative one.

## Quality Checks

- Every changed backend use case has JSDoc
- Every changed exported DTO or exposed domain-facing object has JSDoc
- Every changed frontend server action has JSDoc
- Each affected package or app has a current `docs` entry describing local structure and relationships
- LikeC4 reflects current domains, aggregates, use cases, infrastructure, and main consumers
- Documentation names match the actual code symbols and file structure
- Documentation explains intent and boundaries, not just restates type names

## Output Expectations

When using this skill, finish by reporting:

- which packages or apps had documentation updated
- whether backend JSDoc, frontend JSDoc, package docs, and LikeC4 were all reviewed
- any documentation gaps intentionally left unresolved because the architecture or ownership was unclear
