import { create } from "zustand";
import {
  createWebsite,
  getHeroSettings,
  updateHeroSettings as updateHeroSettingsAction,
} from "@/api/website-actions";
import { HeroSettings } from "@/lib/types/section-types";

const WEBSITE_ID_KEY = "deinsalon_website_id";

type WebsiteStore =
  | {
      loading: true;
      heroSettings: HeroSettings;
      initialize: () => Promise<void>;
      updateHeroSettings: (settings: HeroSettings) => Promise<void>;
    }
  | {
      loading: false;
      websiteId: string;
      heroSettings: HeroSettings;
      initialize: () => Promise<void>;
      updateHeroSettings: (settings: HeroSettings) => Promise<void>;
    };

const defaultHeroSettings: HeroSettings = {
  backgroundImageUrl: "",
  logoImageUrl: "",
  title: "",
  subtitle: "",
};

export const useWebsiteStore = create<WebsiteStore>((set) => ({
  websiteId: null,
  loading: true,
  error: null,
  heroSettings: defaultHeroSettings,

  initialize: async () => {
    try {
      // Check localStorage first
      const savedId = localStorage.getItem(WEBSITE_ID_KEY);

      if (savedId) {
        // Fetch hero settings from database
        const heroResult = await getHeroSettings(savedId);
        const heroSettings = heroResult.success
          ? heroResult.settings
          : defaultHeroSettings;

        set({ websiteId: savedId, loading: false, heroSettings });
        return;
      }

      // No saved ID, create a new website
      const result = await createWebsite();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Save to localStorage
      localStorage.setItem(WEBSITE_ID_KEY, result.websiteId);

      // Fetch hero settings from the newly created website
      const heroResult = await getHeroSettings(result.websiteId);
      const heroSettings = heroResult.success
        ? heroResult.settings
        : defaultHeroSettings;

      set({ websiteId: result.websiteId, loading: false, heroSettings });
    } catch (error) {
      console.error("Error initializing website store:", error);
    }
  },

  updateHeroSettings: async (settings: HeroSettings) => {
    const state = useWebsiteStore.getState();

    if (state.loading) {
      console.error("Cannot update hero settings while loading");
      return;
    }

    try {
      // Update in database
      const result = await updateHeroSettingsAction(state.websiteId, settings);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      set({ heroSettings: settings });
    } catch (error) {
      console.error("Error updating hero settings:", error);
    }
  },
}));
