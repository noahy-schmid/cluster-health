import { Section } from "@/lib/types/section-types";

const STORAGE_KEY = "salon-sections";

export function getSectionsFromStorage(): Section[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSectionsToStorage(sections: Section[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
}

export function getSectionById(id: string): Section | null {
  const sections = getSectionsFromStorage();
  return sections.find((s) => s.id === id) || null;
}

export function updateSectionInStorage(section: Section): void {
  const sections = getSectionsFromStorage();
  const index = sections.findIndex((s) => s.id === section.id);
  if (index !== -1) {
    sections[index] = section;
    saveSectionsToStorage(sections);
  }
}

export function deleteSectionFromStorage(id: string): void {
  const sections = getSectionsFromStorage();
  const filtered = sections.filter((s) => s.id !== id);
  saveSectionsToStorage(filtered);
}
