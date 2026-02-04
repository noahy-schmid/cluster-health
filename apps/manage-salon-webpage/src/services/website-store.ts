import { create } from "zustand";
import {
  createWebsite,
  getHeroSettings,
  updateHeroSettings as updateHeroSettingsAction,
  getColorSettings,
  updateColorSettings as updateColorSettingsAction,
  ColorSettings,
  AllColorSettings,
} from "@/api/website-actions";
import { HeroSettings } from "@/lib/types/section-types";

const WEBSITE_ID_KEY = "deinsalon_website_id";

type WebsiteStore =
  | {
      loading: true;
      heroSettings: HeroSettings;
      colorSettings: ColorSettings;
      initialize: () => Promise<void>;
      updateHeroSettings: (settings: HeroSettings) => Promise<void>;
      updateColorSettings: (colors: AllColorSettings) => Promise<void>;
    }
  | {
      loading: false;
      websiteId: string;
      heroSettings: HeroSettings;
      colorSettings: ColorSettings;
      initialize: () => Promise<void>;
      updateHeroSettings: (settings: HeroSettings) => Promise<void>;
      updateColorSettings: (colors: AllColorSettings) => Promise<void>;
    };

const defaultHeroSettings: HeroSettings = {
  backgroundImageUrl: "",
  logoImageUrl: "",
  title: "",
  subtitle: "",
};

const defaultColorSettings: ColorSettings = {
  backgroundBase: "#FAF8F6",
  foregroundBase: "#1A1A1A",
  accent: "#B8845F",
};

export const useWebsiteStore = create<WebsiteStore>((set) => ({
  websiteId: null,
  loading: true,
  error: null,
  heroSettings: defaultHeroSettings,
  colorSettings: defaultColorSettings,

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

        // Fetch color settings from database
        const colorResult = await getColorSettings(savedId);
        const colorSettings = colorResult.success
          ? colorResult.colors
          : defaultColorSettings;

        set({
          websiteId: savedId,
          loading: false,
          heroSettings,
          colorSettings,
        });
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

      // Fetch color settings from the newly created website
      const colorResult = await getColorSettings(result.websiteId);
      const colorSettings = colorResult.success
        ? colorResult.colors
        : defaultColorSettings;

      set({
        websiteId: result.websiteId,
        loading: false,
        heroSettings,
        colorSettings,
      });
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

  updateColorSettings: async (colors: AllColorSettings) => {
    const state = useWebsiteStore.getState();

    if (state.loading) {
      console.error("Cannot update color settings while loading");
      return;
    }

    try {
      // Update in database (all colors including computed ones)
      const result = await updateColorSettingsAction(state.websiteId, colors);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state with base colors only
      set({
        colorSettings: {
          backgroundBase: colors.backgroundBase,
          foregroundBase: colors.foregroundBase,
          accent: colors.accent,
        },
      });
    } catch (error) {
      console.error("Error updating color settings:", error);
    }
  },
}));
