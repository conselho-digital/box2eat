/** Directions link for the courier to follow after pickup — prefers exact
 *  coordinates when the order has them, falling back to Google's own
 *  geocoding of the formatted address for older orders that don't. */
export function buildGoogleMapsDirectionsUrl(
  destination: { lat: number; lng: number } | { address: string },
) {
  const query =
    "lat" in destination ? `${destination.lat},${destination.lng}` : destination.address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
