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
3. **Effect Service** The Service which implements the use case

## Rules

1. **One use case per file.** Never combine multiple use cases in one file.
2. **One `execute` method.** The use case interface has exactly one method called `execute`.
3. **Command or Query as argument.** Write operations take a `Command` DTO, read operations take a `Query` DTO.
4. **DTOs live in the same file.** The command/query and result types are defined at the top of the use case file.
5. **DTOs are exported.** Command, query, and result types must be available outside the domain boundary.
6. **Cross-domain validation.** Use cases validate things that span multiple aggregates or domains (e.g. "does this website exist?", "does this media file exist?").
7. **Business logic stays in aggregates.** Use cases should not contain business rules local to single aggregates (should be in aggregate service). Neither should they contain domain logic, that needs to be inside a domain service.
