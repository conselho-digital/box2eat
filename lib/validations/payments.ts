import { z } from "zod";

/** KYC data Asaas requires to create a subconta (companies.asaas_account_id
 *  / delivery_partners.asaas_account_id) — see asaas-onboarding Edge
 *  Function. Same shape for a restaurant (CNPJ) or a courier (CPF). */
export const asaasOnboardingSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo ou razão social"),
  email: z.string().trim().email("E-mail inválido"),
  cpfCnpj: z
    .string()
    .trim()
    .regex(/^\d{11}$|^\d{14}$/, "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos), só números"),
  mobilePhone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Informe um celular válido com DDD, só números"),
  incomeValue: z.coerce.number().positive("Informe a renda/faturamento mensal"),
  address: z.string().trim().min(2, "Informe o endereço"),
  addressNumber: z.string().trim().min(1, "Informe o número"),
  province: z.string().trim().min(2, "Informe o bairro"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Informe o CEP com 8 dígitos, só números"),
  birthDate: z.string().trim().optional(),
});

export type AsaasOnboardingInput = z.infer<typeof asaasOnboardingSchema>;
