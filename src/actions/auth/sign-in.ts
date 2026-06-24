"use server";

import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import { userTable } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const signInSchema = z.object({
  email: z.email("E-mail inválido."),
  password: z.string().min(1, "Senha obrigatória."),
});

type SignInResult =
  | { success: true }
  | { success: false; error: string };

export async function signIn(
  data: z.infer<typeof signInSchema>,
): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "E-mail ou senha inválidos." };
  }

  const { email, password } = parsed.data;

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
    columns: {
      id: true,
      passwordHash: true,
    },
  });

  // Mensagem genérica: não revela se o e-mail existe ou não
  const GENERIC_ERROR = "E-mail ou senha inválidos.";

  if (!user) {
    return { success: false, error: GENERIC_ERROR };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return { success: false, error: GENERIC_ERROR };
  }

  await createSession(user.id);

  return { success: true };
}
