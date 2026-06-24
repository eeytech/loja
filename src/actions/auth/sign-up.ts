"use server";

import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import { userTable } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  email: z.email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

type SignUpResult =
  | { success: true }
  | { success: false; error: string; field?: "email" | "password" };

export async function signUp(
  data: z.infer<typeof signUpSchema>,
): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
    columns: { id: true },
  });

  if (existing) {
    return {
      success: false,
      error: "E-mail já cadastrado.",
      field: "email",
    };
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(userTable)
    .values({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      emailVerified: false,
    })
    .returning({ id: userTable.id });

  await createSession(user.id);

  return { success: true };
}
