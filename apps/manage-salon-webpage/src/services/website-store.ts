import { create } from "zustand";
import { createWebsite } from "@/api/website-actions";

const WEBSITE_ID_KEY = "deinsalon_website_id";

type WebsiteStore =
  | {
      loading: true;
      initialize: () => Promise<void>;
    }
  | {
      loading: false;
      websiteId: string;
      initialize: () => Promise<void>;
    };

export const useWebsiteStore = create<WebsiteStore>((set) => ({
  websiteId: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      // Check localStorage first
      const savedId = localStorage.getItem(WEBSITE_ID_KEY);

      if (savedId) {
        set({ websiteId: savedId, loading: false });
        return;
      }

      // No saved ID, create a new website
      const result = await createWebsite();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Save to localStorage
      localStorage.setItem(WEBSITE_ID_KEY, result.websiteId);

      set({ websiteId: result.websiteId, loading: false });
    } catch (error) {
      console.error("Error initializing website store:", error);
    }
  },
}));
