# dein.salon Monorepo Project

In this repository you find a Project whose aim is to provide a Saas booking service for salons. Salon managers can configure an online presence for their salon in the `apps/manage-salon-webpage` nextjs website. This includes (for now and in future), configuring a website, managing stylist employees, services offered to customers and booked appointments by customers. Customers can find the salon presence in the `apps/salon-webpage` nextjs app, there at the path leading to the correct salon, they can view the configured webpage and book appointments.

# Package structure

The Project strictly follows domain-driven-design and therefore consists of multiple domains which might be extended in the future and dont oblidge to the ddd rules completely yet:

- `packages/salon-domain`: This domain cares about the fundamental properties regarding a salon, so data like address, name, opening times, stylists and services provided by the salon, more to come.
- `packages/website-database`: Needs to be renamed to `website-domain` in the future. This domain cares about the configuration and visual appearance of the website regarding each salon. Therefore it contains sections for the website, titles, styles etc.
- `packages/auth-domain`: This domain cares about user managemant and authorization for both stylists and managers accessing the salon management page and authenticating users trying to book and manage their appointments.

Most code is written using Effect-TS (documentation can be found [here](https://effect.website/llms.txt))

# More Information

You should read the following files on a need to know basis.

- `AGENTS-Backend-Service.md`: Read this file before planning or modifying anythin that touches one of the backend domains (Also backend logic within the frontends).
- `AGENTS-Frontend-UI.md`: Read this file before planning or modifying anything that touches the frontend.
