# Intro

This file contains information for when you want to modify a backand service. It contains informations of how each backend domain should be structured and how naming conventions work.

# Domain structure

Each domain _should_ follow a ddd structure implemented using Effect-TS (documentation can be found [here](https://effect.website/llms.txt)) For packages where this structure is not completely adhered yet, the aim is to get there.

- `/src`: Root folder containing `index.ts` to export interfaces and layers
- `/src/use-cases`: This folder contains all the application services which will be exported and used by domains and webpages outside of the domain.
- `/src/use-cases/<some>.interface.ts`: Contains the interface and Effect Tag for `<Some>UseCase`
- `/src/use-cases/<some>.service.ts`: Contains the implementation to the interface
- `/src/application`: Contains all files and folders of the application layer
- `/src/application/<aggregate>`: Folder containing all files for a given aggregate like `Website` sometimes the aggregate will just live in one service, however if it becomes too verbose, the aggregate behaviour will be split in several services again called `<some>.interface.ts` for the interface and tag and `<some>.service.ts` for the implementation and the Layer definition.
- `/src/ports`: In here all port interface definitions live, these are again just interfaces defined through `<some>.port.ts` with the interface being called `<Some>Port`. Everytime logic from a domain needs to access information outside the domain e.g. from another domain or a database or message-queue etc. a Port needs to be defined or extended.
- `/src/adapters`: In here all adapter implementations are defined, always referencing some port and some technology, so e.g. Port `WebsitePort` which encapsulates the website db table, has a `PostgresWebsiteAdapter` livig in `postgres-website.adapter.ts`
- `/src/schema.ts`: Contains the database schema regarding that domain. Each domain has their own namespace in the postgres database. If the schema needs to be extended, change it here. DO NOT generate migrations yourself, migrations are generated through `pnpm drizzle:generate`
- `/src/errors.ts`: File for specifying errors that are allowed to be exposed outside of the domain boundary.

## Type definitions

Type definitions are always done close to the interfaces, so ports always define their own in and output types, not depending on other types. Aggregates define their own types which are allowed to be derived from port types which are used but aggregates have strong ownership of their own definition and should not directly reflect how things are stored in the database but rather how the aggregate splits into entities and data objects. use-cases define their own types again being allowed to be derived from types defined by aggregates, however typically the in and output types of a use-case should only regard this use-case and no unneccessary fields should be exposed. The types of use-cases are the only ones exported beyond the domain boundary. UseCase Layers which are exported beyond the domain boundary are _always_ provided with all their dependencies, such that other domains can just use them easily. e.g. `CreateWebsiteUseCaseLive` layer depends on some aggregates and ports however they are provided for the layer thats exported from the domain.

## Errors

Ports and Adapters need to make sure they convert errors thrown by whatever they connect to, to errors used within the domain. The error exposed by the port should be parsable completely without any knowledge of the connected ressource behind the adapter.
