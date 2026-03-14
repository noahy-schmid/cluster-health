# Intro

This file contains information for when you want to modify a backend service. It contains informations of how each backend domain should be structured and how naming conventions work.

# Domain structure

Each domain _should_ follow a ddd structure implemented using Effect-TS (documentation can be found [here](https://effect.website/llms.txt)) For packages where this structure is not completely adhered yet, the aim is to get there.

- `/src`: Root folder containing `index.ts` to export interfaces and layers
- `/src/use-cases`: This folder contains all the use cases which will be exported and used by domains and webpages outside of the domain. **When implementing use cases, first read [AGENTS-UseCase-Structure.md](./AGENTS-UseCase-Structure.md) for detailed guidelines on how use cases must be structured.** Each use case is a separate file with one `execute` method, a command/query DTO, and a result DTO.
- `/src/use-cases/<action>-<entity>.use-case.ts`: A single use case file, e.g. `create-section.use-case.ts`, `list-sections.use-case.ts`
- `/src/application`: Contains all files and folders of the application layer
- `/src/application/errors.ts`: Shared base error types used across aggregates: `InternalError`, `NotFoundError`, `ConflictError`, `ValidationError`. `InfrastructureError` is also defined here and used by all ports and adapters for database/infrastructure operation failures instead of per-port error classes. Each aggregate re-exports only the errors it uses from its own `errors.ts` file.
- `/src/application/<aggregate>`: Folder containing all files for a given aggregate like `Website`. The aggregate is implemented using the Effect service pattern directly (no separate interface file and implementation file). Errors for the aggregate go in a separate file within the same folder, e.g. `/src/application/<aggregate>/errors.ts`. An aggregate may **never** directly interact with infrastructure (like databases) or other domains, they always need to communicate through ports! **Cross-aggregate validations** (e.g. checking if an entity from aggregate A is referenced by aggregate B) must **never** be done inside an aggregate. These validations belong in use cases which can access multiple ports.
- `/src/application/domain-services`: Domain services that contain domain logic spanning multiple aggregates or ports but that don't naturally belong to a single aggregate. Domain services are used by use cases and follow the `Effect.Service` pattern.
- `/src/ports`: In here all port interface definitions live, these are again just interfaces defined through `<some>.port.ts` with the interface being called `<Some>Port`. Everytime logic from a domain needs to access information outside the domain e.g. from another domain or a database or message-queue etc. a Port needs to be defined or extended. A port may not enforce business rules, that is the task of aggregate services. Ports should wrap simple infrastructure operations — typically one port per database table. For read-heavy operations that need joins across multiple tables, a dedicated read port (e.g. `read-service.port.ts`) may be created. When a port only has identity mappings (domain type = port type), the aggregate may re-export the port type directly instead of duplicating it.
- `/src/adapters`: In here all adapter implementations are defined, always referencing some port and some technology, so e.g. Port `WebsitePort` which encapsulates the website db table, has a `PostgresWebsiteAdapter` living in `postgres-website.adapter.ts`. When there are multiple adapters for the same port (e.g. one per section type), they go in a subfolder like `adapters/section/`. Each adapter is its own file and is written using Effect. Type-specific validation (invariant checking) belongs in the type-specific adapter, not in the aggregate.
- `/src/schema.ts`: Contains the database schema regarding that domain. Each domain has their own namespace in the postgres database. If the schema needs to be extended, change it here. DO NOT generate migrations yourself, migrations are generated through `pnpm db:generate`
- `/src/errors.ts`: File for specifying errors that are allowed to be exposed outside of the domain boundary.

## Type definitions

Type definitions are always done close to the interfaces, so ports always define their own in and output types, not depending on other types. Aggregates define their own types which are allowed to be derived from port types which are used but aggregates have strong ownership of their own definition and should not directly reflect how things are stored in the database but rather how the aggregate splits into entities and data objects. Use cases define their own command/query and result DTO types in the same file as the use case. These DTOs are the only types exported beyond the domain boundary. UseCase Layers which are exported beyond the domain boundary are _always_ provided with all their dependencies, such that other domains can just use them easily. e.g. `CreateSectionUseCaseLayer` depends on aggregates, ports and adapters however they are all provided in the exported layer.

## Errors

Ports and Adapters need to make sure they convert errors thrown by whatever they connect to, to errors used within the domain. The error exposed by the port should be parsable completely without any knowledge of the connected ressource behind the adapter. All ports and adapters use the shared `InfrastructureError` from `application/errors.ts` for database/infrastructure operation failures — do NOT define per-port error classes.

## Infrastructure Layer

All configuration and infrastructure access must go through Effect layers:

- `/src/infrastructure/config.interface.ts`: Configuration interface definition with all environment variables
- `/src/infrastructure/config.service.ts`: Configuration layer implementation that reads from environment variables
- `/src/infrastructure/database.interface.ts`: Database interface definition exposing the drizzle instance
- `/src/infrastructure/database.service.ts`: Database layer that instantiates drizzle using config

**Rules:**

- **NEVER** access `process.env` directly in adapters or services
- **ALWAYS** use a Configuration service to access configuration values
- Database connections must be provided through Effect Layers, not imported directly
- This enables easier testing and proper dependency injection

# Exports

Regarding exports outside of the domain package, **only** UseCases, their layers and the command/query/result DTO types and errors they expose may be exported. Every internal logic, like adapters, ports and aggregates shall stay unexported.
