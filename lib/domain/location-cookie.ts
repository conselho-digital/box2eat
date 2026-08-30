/**
 * "Próximas de mim" state lives in cookies instead of the URL, so the
 * user's coordinates never show up in the address bar or in a shared link.
 */
export const LAT_COOKIE = "b2e_lat";
export const LNG_COOKIE = "b2e_lng";
export const NEAR_OFF_COOKIE = "b2e_near_off";

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function setLocationCookies(lat: number, lng: number) {
  setCookie(LAT_COOKIE, String(lat));
  setCookie(LNG_COOKIE, String(lng));
}

export function clearLocationCookies() {
  clearCookie(LAT_COOKIE);
  clearCookie(LNG_COOKIE);
}

export function setNearOffCookie() {
  setCookie(NEAR_OFF_COOKIE, "1");
}

export function clearNearOffCookie() {
  clearCookie(NEAR_OFF_COOKIE);
}
