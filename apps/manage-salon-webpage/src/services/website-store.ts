import { create } from "zustand";
import { createWebsite } from "@/api/website-actions";
import { HeroSettings } from "@/lib/types/section-types";

const WEBSITE_ID_KEY = "deinsalon_website_id";
const HERO_SETTINGS_KEY = "deinsalon_hero_settings";

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
      const savedHeroSettings = localStorage.getItem(HERO_SETTINGS_KEY);

      const heroSettings = savedHeroSettings
        ? JSON.parse(savedHeroSettings)
        : defaultHeroSettings;

      if (savedId) {
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

      set({ websiteId: result.websiteId, loading: false, heroSettings });
    } catch (error) {
      console.error("Error initializing website store:", error);
    }
  },

  updateHeroSettings: async (settings: HeroSettings) => {
    try {
      // Save to localStorage
      localStorage.setItem(HERO_SETTINGS_KEY, JSON.stringify(settings));

      set({ heroSettings: settings });
    } catch (error) {
      console.error("Error updating hero settings:", error);
    }
  },
}));
