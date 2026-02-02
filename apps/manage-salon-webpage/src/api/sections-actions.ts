"use server";

import { Section, SectionType } from "@/lib/types/section-types";

/**
 * Server action to create a new section
 * Takes type and position, returns the created section with generated ID
 */
export async function createSection(
  type: SectionType,
  position: number,
): Promise<{ success: boolean; section?: Section; error?: string }> {
  try {
    // TODO: Save to database
    const id = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let newSection: Section;

    if (type === "text-with-image") {
      newSection = {
        id,
        type: "text-with-image",
        settings: {
          imageUrl: "",
          title: "New Text with Image Section",
          text: "Add your text here",
        },
        order: position,
      };
    } else if (type === "gallery") {
      newSection = {
        id,
        type: "gallery",
        settings: {
          title: "New Gallery",
          subtitle: "Gallery subtitle",
          imageUrls: [],
        },
        order: position,
      };
    } else {
      return { success: false, error: "Invalid section type" };
    }

    console.log("Creating section:", newSection);
    return { success: true, section: newSection };
  } catch (error) {
    console.error("Error creating section:", error);
    return { success: false, error: "Failed to create section" };
  }
}

/**
 * Server action to update an existing section
 */
export async function updateSection(
  section: Section,
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Update in database
    console.log("Updating section:", section);
    return { success: true };
  } catch (error) {
    console.error("Error updating section:", error);
    return { success: false, error: "Failed to update section" };
  }
}

/**
 * Server action to get a section by ID
 */
export async function getSectionById(id: string): Promise<Section | null> {
  try {
    // TODO: Fetch from database
    // For now, handled client-side
    console.log("Fetching section by ID:", id);
    return null;
  } catch (error) {
    console.error("Error fetching section:", error);
    return null;
  }
}

/**
 * Server action to delete a section
 */
export async function deleteSection(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Delete from database
    console.log("Deleting section:", id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting section:", error);
    return { success: false, error: "Failed to delete section" };
  }
}

/**
 * Server action to reorder sections
 */
export async function reorderSections(
  sections: Section[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Update order in database
    console.log(
      "Reordering sections:",
      sections.map((s) => s.id),
    );
    return { success: true };
  } catch (error) {
    console.error("Error reordering sections:", error);
    return { success: false, error: "Failed to reorder sections" };
  }
}

/**
 * Server action to fetch all sections
 */
export async function fetchSections(): Promise<{
  success: boolean;
  sections?: Section[];
  error?: string;
}> {
  try {
    // TODO: Fetch from database
    // For now, handled client-side via storage
    console.log("Fetching sections from backend");

    return { success: true };
  } catch (error) {
    console.error("Error fetching sections:", error);
    return { success: false, error: "Failed to fetch sections" };
  }
}
