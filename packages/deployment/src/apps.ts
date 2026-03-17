export interface AppDefinition {
  readonly name: string;
  readonly port: number;
}

export const APPS: readonly AppDefinition[] = [
  { name: "manage-salon-webpage", port: 3000 },
  { name: "salon-webpage", port: 3000 },
  { name: "marketing-webpage", port: 3000 },
  { name: "calendar-service", port: 8080 },
] as const;
