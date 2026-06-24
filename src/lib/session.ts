import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { sessionTable, userTable } from "@/db/schema";

const SESSION_COOKIE = "session_token";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "customer" | "admin";
};

export type Session = {
  user: SessionUser;
};

export async function createSession(userId: string): Promise<void> {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  await db.insert(sessionTable).values({
    id: sessionId,
    userId,
    token,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await db.query.sessionTable.findFirst({
    where: eq(sessionTable.token, token),
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.delete(sessionTable).where(eq(sessionTable.token, token));
    return null;
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, session.userId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!user) return null;

  return { user };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessionTable).where(eq(sessionTable.token, token));
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
