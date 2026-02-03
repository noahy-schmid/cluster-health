import { create } from "zustand";
import { Section, SectionType } from "@/lib/types/section-types";
import {
  createSection as createSectionAction,
  deleteSection as deleteSectionAction,
  reorderSections as reorderSectionsAction,
  fetchSections as fetchSectionsAction,
  updateSection as updateSectionAction,
} from "@/api/sections-actions";
import { useWebsiteStore } from "./website-store";

interface SectionsStore {
  sections: Section[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  createSection: (
    type: SectionType,
    position: number,
  ) => Promise<Section | null>;
  updateSection: (section: Section) => Promise<void>;
  removeSection: (id: string) => Promise<void>;
  reorderSections: (oldIndex: number, newIndex: number) => Promise<void>;
}

let initializePromise: Promise<void> | null = null;

// Helper function to update order values based on array position
function updateSectionOrders(sections: Section[]): Section[] {
  return sections.map((section, index) => ({
    ...section,
    order: index,
  }));
}

export const useSectionsStore = create<SectionsStore>((set, get) => ({
  sections: [],
  isLoading: true,
  error: null,

  initialize: async () => {
    const websiteState = useWebsiteStore.getState();

    if (websiteState.loading || !websiteState.websiteId) {
      set({ error: "Website not initialized", isLoading: false });
      return;
    }

    const websiteId = websiteState.websiteId;

    // Prevent multiple initializations
    if (initializePromise) {
      return initializePromise;
    }

    // Check if already initialized
    if (!get().isLoading) {
      return;
    }

    initializePromise = (async () => {
      try {
        set({ isLoading: true, error: null });

        // Fetch from backend
        const result = await fetchSectionsAction(websiteId);

        if (result.success && result.sections) {
          set({ sections: result.sections, isLoading: false });
        } else {
          set({
            error: result.error || "Failed to load sections",
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error initializing sections:", error);
        set({ error: "Failed to initialize sections", isLoading: false });
      } finally {
        initializePromise = null;
      }
    })();

    return initializePromise;
  },

  createSection: async (type, position) => {
    const websiteState = useWebsiteStore.getState();

    if (websiteState.loading || !websiteState.websiteId) {
      set({ error: "Website not initialized" });
      return null;
    }

    const websiteId = websiteState.websiteId;

    try {
      // Call backend to create section
      const result = await createSectionAction(websiteId, type, position);

      if (result.success && result.section) {
        // Add to local state
        set((state) => {
          const newSections = [...state.sections];
          newSections.splice(position, 0, result.section!);
          // Update order values
          const orderedSections = updateSectionOrders(newSections);
          return { sections: orderedSections };
        });

        return result.section;
      } else {
        set({ error: result.error || "Failed to create section" });
        return null;
      }
    } catch (error) {
      console.error("Error creating section:", error);
      set({ error: "Failed to create section" });
      return null;
    }
  },

  updateSection: async (section) => {
    const websiteState = useWebsiteStore.getState();

    if (websiteState.loading || !websiteState.websiteId) {
      set({ error: "Website not initialized" });
      return;
    }

    const websiteId = websiteState.websiteId;

    try {
      // Update in local state
      set((state) => {
        const newSections = state.sections.map((s) =>
          s.id === section.id ? section : s,
        );
        return { sections: newSections };
      });

      // Call backend
      const result = await updateSectionAction(websiteId, section);

      if (!result.success) {
        set({ error: result.error || "Failed to update section" });
        // Reload sections
        await get().initialize();
      }
    } catch (error) {
      console.error("Error updating section:", error);
      set({ error: "Failed to update section" });
      // Reload sections
      await get().initialize();
    }
  },

  removeSection: async (id) => {
    const websiteState = useWebsiteStore.getState();

    if (websiteState.loading || !websiteState.websiteId) {
      set({ error: "Website not initialized" });
      return;
    }

    const websiteId = websiteState.websiteId;

    try {
      // Optimistic update
      set((state) => {
        const newSections = state.sections.filter(
          (section) => section.id !== id,
        );
        // Update order values
        const orderedSections = updateSectionOrders(newSections);
        return { sections: orderedSections };
      });

      // Call backend
      const result = await deleteSectionAction(websiteId, id);

      if (!result.success) {
        // Revert on failure - would need to restore from backend
        set({ error: result.error || "Failed to delete section" });
        // Reload sections
        await get().initialize();
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      set({ error: "Failed to delete section" });
      // Reload sections
      await get().initialize();
    }
  },

  reorderSections: async (oldIndex, newIndex) => {
    const websiteState = useWebsiteStore.getState();

    if (websiteState.loading || !websiteState.websiteId) {
      set({ error: "Website not initialized" });
      return;
    }

    const websiteId = websiteState.websiteId;

    try {
      // Optimistic update
      set((state) => {
        const newSections = [...state.sections];
        const [movedSection] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        // Update order values
        const orderedSections = updateSectionOrders(newSections);
        return { sections: orderedSections };
      });

      // Get the new order of section IDs
      const sectionIds = get().sections.map((s) => s.id);

      // Call backend
      const result = await reorderSectionsAction(websiteId, sectionIds);

      if (!result.success) {
        set({ error: result.error || "Failed to reorder sections" });
        // Reload sections
        await get().initialize();
      }
    } catch (error) {
      console.error("Error reordering sections:", error);
      set({ error: "Failed to reorder sections" });
      // Reload sections
      await get().initialize();
    }
  },
}));
