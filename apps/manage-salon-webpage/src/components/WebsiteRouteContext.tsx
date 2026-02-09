"use client";

import { createContext, useContext } from "react";

export type WebsiteRouteContextValue = {
  salonId: string;
  websiteId?: string;
  sectionId?: string;
};

const WebsiteRouteContext = createContext<WebsiteRouteContextValue | null>(
  null,
);

/**
 * Provides route IDs to descendants.
 */
export function WebsiteRouteContextProvider({
  value,
  children,
}: {
  value: WebsiteRouteContextValue;
  children: React.ReactNode;
}) {
  return (
    <WebsiteRouteContext.Provider value={value}>
      {children}
    </WebsiteRouteContext.Provider>
  );
}

/**
 * Access route IDs inside client components.
 */
export function useWebsiteRouteContext(): WebsiteRouteContextValue {
  const context = useContext(WebsiteRouteContext);
  if (!context) {
    throw new Error("WebsiteRouteContext is not available");
  }
  return context;
}
