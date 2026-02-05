import { db, sectionsTable, Transaction } from "../index";
import { eq, and } from "drizzle-orm";
import { SectionType } from "./types";

export class BaseSectionRepository {
  async createSection(websiteId: string, type: SectionType, order: number) {
    const [insertedSection] = await db
      .insert(sectionsTable)
      .values({
        websiteId,
        type,
        order,
      })
      .returning();

    return insertedSection;
  }

  async updateSectionMetadata(
    sectionId: string,
    data: { menuTitle?: string | null },
    tx?: Transaction,
  ) {
    const dbInstance = tx ?? db;
    const result = await dbInstance
      .update(sectionsTable)
      .set(data)
      .where(eq(sectionsTable.id, sectionId))
      .returning();

    return result;
  }

  async fetchSectionById(sectionId: string, type?: SectionType) {
    const conditions = type
      ? and(eq(sectionsTable.id, sectionId), eq(sectionsTable.type, type))
      : eq(sectionsTable.id, sectionId);

    const [section] = await db.select().from(sectionsTable).where(conditions);

    return section;
  }

  async deleteSectionById(sectionId: string, websiteId: string) {
    await db
      .delete(sectionsTable)
      .where(
        and(
          eq(sectionsTable.id, sectionId),
          eq(sectionsTable.websiteId, websiteId),
        ),
      );
  }
}
