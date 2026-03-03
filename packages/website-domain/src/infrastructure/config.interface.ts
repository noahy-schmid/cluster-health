import { Context } from "effect";

export interface Configuration {
  databaseUrl: string;
}

export const Configuration = Context.GenericTag<Configuration>(
  "@config/website-domain/Configuration",
);
