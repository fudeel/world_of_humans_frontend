// app/components/game/LootDropMarker.tsx
// Renders a loot drop on the Leaflet map as a clickable marker.

"use client";

import type { LatLngTuple, PointTuple } from "leaflet";
import { CircleMarker, Tooltip } from "react-leaflet";
import type { LootDropData } from "@/app/types/game";
import { worldToGeo } from "@/app/lib/coordinates";

interface LootDropMarkerProps {
    drop: LootDropData;
    inRange: boolean;
    onClick: () => void;
}

const TOOLTIP_OFFSET: PointTuple = [0, -8];

export default function LootDropMarker({
                                           drop,
                                           inRange,
                                           onClick,
                                       }: LootDropMarkerProps) {
    if (!drop.active) return null;

    const center: LatLngTuple = worldToGeo(drop.position.x, drop.position.y);
    const itemCount = drop.items.length + (drop.money > 0 ? 1 : 0);

    return (
        <CircleMarker
            center={center}
            radius={8}
            pathOptions={{
                color: inRange ? "#facc15" : "#f59e0b",
                weight: inRange ? 3 : 2,
                fillColor: "#f59e0b",
                fillOpacity: 0.9,
                dashArray: inRange ? undefined : "4 3",
            }}
            eventHandlers={{
                click: (e) => {
                    e.originalEvent.stopPropagation();
                    onClick();
                },
            }}
        >
            <Tooltip
                direction="top"
                offset={TOOLTIP_OFFSET}
                className="map-object-tooltip"
            >
                <span>💀 Loot ({itemCount} items)</span>
                {!inRange && (
                    <span style={{ display: "block", fontSize: "0.75em", opacity: 0.6 }}>
                        Move closer to loot
                    </span>
                )}
            </Tooltip>
        </CircleMarker>
    );
}