# Use Case Structure

This file describes how use cases should be structured in this project. Read this before implementing or modifying any use case in a backend domain.

## Overview

A **use case** represents a single application-level action. Each use case is a separate file containing exactly one class with one method called `execute`. Use cases orchestrate cross-domain validation and delegate business logic to aggregates.

## File naming

Use cases are named after the action they perform:

```
src/use-cases/<action>-<entity>.use-case.ts
```

e.g. `create-section.use-case.ts`

## Structure of a use case file

Each use case file contains:

1. **Command or Query DTO** – The input type. Use `Command` for write operations and `Query` for read operations.
2. **Result DTO** (optional) – The return type, if it differs from a simple void or domain type.
3. **Use Case class** – Implemented using `Effect.Service` (class extends `Effect.Service<T>()`). The class defines the `execute` method, `accessors: true`, and its `dependencies` array.

### Example pattern

```typescript
import { Effect } from "effect";
import { SomeAggregate } from "../application/some/some.aggregate";
import { SomeError } from "../application/some/errors";

// --- Command DTO ---
export interface DoSomethingCommand {
  id: string;
  value: string;
}

// --- Result DTO ---
export type DoSomethingResult = { id: string };

// --- Use Case ---
const make = Effect.gen(function* () {
  const aggregate = yield* SomeAggregate;

  return {
    execute: (
      command: DoSomethingCommand,
    ): Effect.Effect<DoSomethingResult, SomeError> =>
      aggregate.doSomething(command.id, command.value),
  };
});

export class DoSomethingUseCase extends Effect.Service<DoSomethingUseCase>()(
  "@repo/some-domain/DoSomethingUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SomeAggregate.Default],
  },
) {}
```

## Rules

1. **One use case per file.** Never combine multiple use cases in one file.
2. **One `execute` method.** The use case has exactly one method called `execute`.
3. **Use `Effect.Service` class pattern.** Always use `class extends Effect.Service<T>()()` — never use separate interface + `Context.GenericTag` + `Layer.effect`. This pattern is mandatory for use cases and aggregates (but never for ports/adapters).
4. **Command or Query as argument.** Write operations take a `Command` DTO, read operations take a `Query` DTO.
5. **DTOs live in the same file.** The command/query and result types are defined at the top of the use case file.
6. **DTOs are exported.** Command, query, and result types must be available outside the domain boundary.
7. **Cross-domain validation.** Use cases validate things that span multiple aggregates or domains (e.g. "does this website exist?", "does this media file exist?").
8. **Business logic stays in aggregates.** Use cases should not contain business rules local to single aggregates (should be in aggregate service). Neither should they contain domain logic, that needs to be inside a domain service.
9. **Dependencies array.** Include domain-internal dependencies in the class's `dependencies` array. External domain dependencies (e.g. adapters that depend on services from other domains) should be provided in `layers.ts`.
10. **Layer exports.** In `layers.ts`, export each use case layer using `.Default` (e.g. `export const MyUseCaseLayer = MyUseCase.Default`). For use cases needing external dependencies, pipe `.Default` with `Layer.provide(...)`.
11. **Testing.** In integration tests, use `.DefaultWithoutDependencies` to bypass the class's dependency array and provide test-specific dependencies manually.
