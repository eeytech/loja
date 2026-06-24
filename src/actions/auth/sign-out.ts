"use server";

import { destroySession } from "@/lib/session";

export async function signOut(): Promise<void> {
  await destroySession();
}
