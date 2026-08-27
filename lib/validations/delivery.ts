import { z } from "zod";

export const deliveryApplicationSchema = z.object({
  vehicleType: z.enum(["bike", "motorcycle", "car"]),
  vehiclePlate: z.string().trim().optional(),
});

export type DeliveryApplicationInput = z.infer<typeof deliveryApplicationSchema>;

export const DOC_TYPES = ["cnh", "rg", "cpf_proof", "vehicle_photo", "selfie"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  cnh: "CNH",
  rg: "RG",
  cpf_proof: "Comprovante de CPF",
  vehicle_photo: "Foto do veículo",
  selfie: "Selfie",
};
