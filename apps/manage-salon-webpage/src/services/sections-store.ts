import { create } from "zustand";
import { Section, SectionType } from "@/lib/types/section-types";
import {
  createSection as createSectionAction,
  deleteSection as deleteSectionAction,
  reorderSections as reorderSectionsAction,
  fetchSections as fetchSectionsAction,
  updateSection as updateSectionAction,
} from "@/api/sections-actions";
import { getSectionsFromStorage, saveSectionsToStorage } from "@/lib/storage";

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

        // Try to load from localStorage first
        const localSections = getSectionsFromStorage();

        if (localSections.length > 0) {
          // Use local data if available
          set({ sections: localSections, isLoading: false });
        } else {
          // Fetch from backend as fallback
          const result = await fetchSectionsAction();

          if (result.success && result.sections) {
            set({ sections: result.sections, isLoading: false });
            saveSectionsToStorage(result.sections);
          } else {
            set({
              error: result.error || "Failed to load sections",
              isLoading: false,
            });
          }
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
    try {
      // Call backend to create section
      const result = await createSectionAction(type, position);

      if (result.success && result.section) {
        // Add to local state
        set((state) => {
          const newSections = [...state.sections];
          newSections.splice(position, 0, result.section!);
          // Update order values
          const orderedSections = updateSectionOrders(newSections);
          // Save to localStorage
          saveSectionsToStorage(orderedSections);
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
    try {
      // Update in local state
      set((state) => {
        const newSections = state.sections.map((s) =>
          s.id === section.id ? section : s,
        );
        // Save to localStorage
        saveSectionsToStorage(newSections);
        return { sections: newSections };
      });

      // Call backend
      const result = await updateSectionAction(section);

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
    try {
      // Optimistic update
      set((state) => {
        const newSections = state.sections.filter(
          (section) => section.id !== id,
        );
        // Update order values
        const orderedSections = updateSectionOrders(newSections);
        // Save to localStorage
        saveSectionsToStorage(orderedSections);
        return { sections: orderedSections };
      });

      // Call backend
      const result = await deleteSectionAction(id);

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
    try {
      // Optimistic update
      set((state) => {
        const newSections = [...state.sections];
        const [movedSection] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        // Update order values
        const orderedSections = updateSectionOrders(newSections);
        // Save to localStorage
        saveSectionsToStorage(orderedSections);
        return { sections: orderedSections };
      });

      // Call backend
      const result = await reorderSectionsAction(get().sections);

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
