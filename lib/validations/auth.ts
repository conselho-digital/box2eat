import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

const phonePattern = /^\+?\d[\d\s()-]{7,}$/;

export const signUpIdentifierSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo"),
  identifier: z
    .string()
    .trim()
    .min(5, "Informe um e-mail ou telefone válido")
    .refine(
      (value) => z.string().email().safeParse(value).success || phonePattern.test(value),
      "Informe um e-mail ou telefone válido",
    ),
});

export type SignUpIdentifierInput = z.infer<typeof signUpIdentifierSchema>;

export const otpCodeSchema = z.object({
  code: z.string().trim().length(6, "O código tem 6 dígitos"),
});

export type OtpCodeInput = z.infer<typeof otpCodeSchema>;
