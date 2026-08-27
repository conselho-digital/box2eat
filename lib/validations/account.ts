import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo"),
  phone: z.string().trim().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const emailSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});

export type EmailInput = z.infer<typeof emailSchema>;

export const passwordSchema = z.object({
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
});

export type PasswordInput = z.infer<typeof passwordSchema>;

export const mfaCodeSchema = z.object({
  code: z.string().length(6, "O código tem 6 dígitos"),
});

export type MfaCodeInput = z.infer<typeof mfaCodeSchema>;
