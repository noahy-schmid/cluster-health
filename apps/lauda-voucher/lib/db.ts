import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { usedVouchersTable } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}

let dbInstance: ReturnType<typeof drizzle> | undefined;

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(DATABASE_URL as string);
  }
  return dbInstance;
}

export async function isVoucherUsed(id: string): Promise<boolean> {
  const [row] = await getDb()
    .select()
    .from(usedVouchersTable)
    .where(eq(usedVouchersTable.id, id));
  return !!row;
}

export async function markVoucherUsed(
  id: string,
  amount: number,
): Promise<void> {
  await getDb().insert(usedVouchersTable).values({ id, amount });
}
