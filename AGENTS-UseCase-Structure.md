# Use Case Structure

This file describes how use cases should be structured in this project. Read this before implementing or modifying any use case in a backend domain.

## Overview

A **use case** represents a single application-level action. Each use case is a separate file containing exactly one class with one method called `execute`. Use cases orchestrate cross-domain validation and delegate business logic to aggregates.

## File naming

Use cases are named after the action they perform:

```
src/use-cases/<action>-<entity>.use-case.ts
```

Examples:

- `create-section.use-case.ts`
- `update-section.use-case.ts`
- `delete-section.use-case.ts`
- `list-sections.use-case.ts`
- `reorder-sections.use-case.ts`

## Structure of a use case file

Each use case file contains:

1. **Command or Query DTO** – The input type. Use `Command` for write operations and `Query` for read operations.
2. **Result DTO** (optional) – The return type, if it differs from a simple void or domain type.
3. **Use Case interface** – Defines the `execute` method signature.
4. **Context Tag** – The Effect context tag for dependency injection.
5. **Live implementation** – Uses the Effect service pattern directly (`Layer.effect`), no separate interface file needed.

### Example: Write use case (command)

```typescript
import { Context, Effect, Layer } from "effect";
import { SomeAggregate } from "../application/some/some.aggregate";
import { SomeError } from "../application/some/errors";

// --- Command DTO ---

export interface CreateSomethingCommand {
  name: string;
  description: string;
}

// --- Result DTO ---

export type CreateSomethingResult = { id: string; name: string };

// --- Use Case ---

export interface CreateSomethingUseCase {
  execute(
    command: CreateSomethingCommand,
  ): Effect.Effect<CreateSomethingResult, SomeError>;
}

export const CreateSomethingUseCase =
  Context.GenericTag<CreateSomethingUseCase>(
    "@repo/some-domain/CreateSomethingUseCase",
  );

export const CreateSomethingUseCaseLive = Layer.effect(
  CreateSomethingUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SomeAggregate;

    return {
      execute: (command: CreateSomethingCommand) =>
        Effect.gen(function* () {
          // Cross-domain validation goes here (e.g. check existence of referenced entities)
          return yield* aggregate.createSomething(
            command.name,
            command.description,
          );
        }),
    } satisfies CreateSomethingUseCase;
  }),
);
```

### Example: Read use case (query)

```typescript
import { Context, Effect, Layer } from "effect";
import { SomeAggregate } from "../application/some/some.aggregate";
import { SomeError } from "../application/some/errors";

// --- Query DTO ---

export interface ListSomethingQuery {
  parentId: string;
}

// --- Result DTO ---

export type ListSomethingResult = { id: string; name: string }[];

// --- Use Case ---

export interface ListSomethingUseCase {
  execute(
    query: ListSomethingQuery,
  ): Effect.Effect<ListSomethingResult, SomeError>;
}

export const ListSomethingUseCase = Context.GenericTag<ListSomethingUseCase>(
  "@repo/some-domain/ListSomethingUseCase",
);

export const ListSomethingUseCaseLive = Layer.effect(
  ListSomethingUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SomeAggregate;

    return {
      execute: (query: ListSomethingQuery) =>
        aggregate.listSomething(query.parentId),
    } satisfies ListSomethingUseCase;
  }),
);
```

## Rules

1. **One use case per file.** Never combine multiple use cases in one file.
2. **One `execute` method.** The use case interface has exactly one method called `execute`.
3. **Command or Query as argument.** Write operations take a `Command` DTO, read operations take a `Query` DTO.
4. **DTOs live in the same file.** The command/query and result types are defined at the top of the use case file.
5. **DTOs are exported.** Command, query, and result types must be available outside the domain boundary.
6. **Use Effect service pattern.** Implement directly with `Layer.effect` — no separate interface and implementation files.
7. **Cross-domain validation.** Use cases validate things that span multiple aggregates or domains (e.g. "does this website exist?", "does this media file exist?").
8. **Business logic stays in aggregates.** Use cases should not contain business rules — delegate to aggregate methods.
9. **Each use case gets its own Layer export.** In `layers.ts`, each use case layer is exported individually with all dependencies provided and `Layer.orDie` applied.

## Exports

From `index.ts`, export:

- The use case Context Tag (e.g. `CreateSectionUseCase`)
- The use case Layer (e.g. `CreateSectionUseCaseLayer` from `layers.ts`)
- The command/query DTO types
- The result DTO types
- Domain errors used by the use cases
