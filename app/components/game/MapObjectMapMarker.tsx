// app/components/game/MapObjectMapMarker.tsx
// Renders a single map object (item, node, NPC, interactable)
// on the Leaflet map as a CircleMarker with a tooltip.

"use client";

import type { LatLngTuple, PointTuple } from "leaflet";
import { CircleMarker, Tooltip } from "react-leaflet";
import type { MapObjectData, MapObjectTypeName } from "@/app/types/game";
import { worldToGeo } from "@/app/lib/coordinates";

interface MapObjectMapMarkerProps {
    object: MapObjectData;
    selected: boolean;
    inRange: boolean;
    onClick: () => void;
}

const TYPE_COLORS: Record<MapObjectTypeName, string> = {
    item: "#f59e0b",
    resource_node: "#22c55e",
    npc: "#3b82f6",
    interactable: "#a855f7",
};

const TYPE_LABELS: Record<MapObjectTypeName, string> = {
    item: "\u2694",
    resource_node: "\u2618",
    npc: "\uD83D\uDDE3",
    interactable: "\u2699",
};

const TOOLTIP_OFFSET: PointTuple = [0, -8];

export default function MapObjectMapMarker({
                                               object,
                                               selected,
                                               inRange,
                                               onClick,
                                           }: MapObjectMapMarkerProps) {
    if (!object.active) return null;

    const center: LatLngTuple = worldToGeo(object.position.x, object.position.y);
    const color = TYPE_COLORS[object.object_type];

    return (
        <CircleMarker
            center={center}
            radius={selected ? 9 : 7}
            pathOptions={{
                color: selected ? "#facc15" : inRange ? "#fff" : "#000",
                weight: selected ? 3 : inRange ? 2 : 1.5,
                fillColor: color,
                fillOpacity: 0.85,
                dashArray: inRange && !selected ? "4 3" : undefined,
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
                permanent={selected}
                className="map-object-tooltip"
            >
                <span>
                    {TYPE_LABELS[object.object_type]} {object.name}
                </span>
                <span style={{ display: "block", fontSize: "0.75em", opacity: 0.6 }}>
                    {object.interaction_type}
                    {inRange ? " · in range" : ""}
                </span>
            </Tooltip>
        </CircleMarker>
    );
}