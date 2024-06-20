import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";

export const checkUserById = async (id: number) => {
  const exist = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!exist) return null;

  return exist;
};
