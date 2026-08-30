/** Normalizes a Brazilian phone number (with or without DDI/formatting) to E.164. */
export function toE164BR(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  // 55 + DDD (2) + number (8 or 9 digits) = 12 or 13 digits total.
  if (withCountry.length < 12 || withCountry.length > 13) return null;
  return `+${withCountry}`;
}
