// app/lib/coordinates.ts
// Converts between backend world coordinates (0–500) and geographic
// lat/lng coordinates centered on the configured test location.
//
// The backend operates in abstract world units.  This module is the
// single source of truth for mapping those units onto a real-world
// geographic area so that the Leaflet map renders correctly.

/** Geographic center of the game zone (Pomezia, south of Rome). */
export const GEO_CENTER = {
    lat: 41.726208367547535,
    lng: 12.60978601619944,
} as const;

/** World-unit dimensions of the zone (must match backend zone bounds). */
const WORLD_SIZE = 500;

/**
 * Approximate meters the zone spans in each direction from center.
 * 250 m each way → 500 m total, matching the 500 world-unit zone.
 */
const HALF_SPAN_METERS = 250;

/**
 * Pre-computed degree spans based on the center latitude.
 *
 * 1° latitude  ≈ 110 540 m
 * 1° longitude ≈ 111 320 × cos(lat) m  ≈ 83 050 m at 41.726°
 */
const LAT_SPAN = (HALF_SPAN_METERS * 2) / 110540;   // ≈ 0.00453°
const LNG_SPAN = (HALF_SPAN_METERS * 2) / 83050;    // ≈ 0.00602°

/** Geographic bounds of the game zone. */
export const GEO_BOUNDS = {
    minLat: GEO_CENTER.lat - LAT_SPAN / 2,
    maxLat: GEO_CENTER.lat + LAT_SPAN / 2,
    minLng: GEO_CENTER.lng - LNG_SPAN / 2,
    maxLng: GEO_CENTER.lng + LNG_SPAN / 2,
} as const;

/**
 * Convert a backend world position to a geographic ``[lat, lng]`` tuple.
 *
 * World (0, 0) → south-west corner of the zone.
 * World (500, 500) → north-east corner.
 */
export function worldToGeo(x: number, y: number): [number, number] {
    const lng = GEO_BOUNDS.minLng + (x / WORLD_SIZE) * LNG_SPAN;
    const lat = GEO_BOUNDS.minLat + (y / WORLD_SIZE) * LAT_SPAN;
    return [lat, lng];
}

/**
 * Convert a geographic position back to backend world coordinates.
 *
 * Used when the player clicks on the Leaflet map to issue a move command.
 */
export function geoToWorld(lat: number, lng: number): { x: number; y: number } {
    const x = ((lng - GEO_BOUNDS.minLng) / LNG_SPAN) * WORLD_SIZE;
    const y = ((lat - GEO_BOUNDS.minLat) / LAT_SPAN) * WORLD_SIZE;
    return { x, y };
}

/**
 * Convert a backend distance (world units) to approximate meters.
 *
 * 500 world units ≈ 500 meters, so the ratio is roughly 1:1.
 */
export function worldDistToMeters(d: number): number {
    return d * (HALF_SPAN_METERS * 2) / WORLD_SIZE;
}