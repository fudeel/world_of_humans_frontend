// app/components/game/MapFollower.tsx
// Keeps the Leaflet map centered on the player's current position.
// Uses the useMap() hook from react-leaflet to imperatively pan.

"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapFollowerProps {
    lat: number;
    lng: number;
}

export default function MapFollower({ lat, lng }: MapFollowerProps) {
    const map = useMap();

    useEffect(() => {
        map.setView([lat, lng], map.getZoom(), { animate: true, duration: 0.15 });
    }, [map, lat, lng]);

    return null;
}