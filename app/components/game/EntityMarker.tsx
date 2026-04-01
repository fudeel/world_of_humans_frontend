// app/components/game/EntityMapMarker.tsx
// Renders a single living entity on the Leaflet map as a CircleMarker.

"use client";

import { CircleMarker, Popup, Tooltip } from "react-leaflet";
import type { WorldEntity } from "@/app/types/game";
import { worldToGeo } from "@/app/lib/coordinates";

interface EntityMapMarkerProps {
    entity: WorldEntity;
    selected: boolean;
    onClick: () => void;
}

const MOB_STATE_COLORS: Record<string, string> = {
    idle: "#6b7280",
    patrol: "#3b82f6",
    chase: "#f59e0b",
    attack: "#ef4444",
    return_to_spawn: "#8b5cf6",
    dead: "#374151",
};

export default function EntityMapMarker({
                                            entity,
                                            selected,
                                            onClick,
                                        }: EntityMapMarkerProps) {
    if (!entity.is_alive && !entity.is_self) return null;

    const [lat, lng] = worldToGeo(entity.position.x, entity.position.y);
    const isMob = !!entity.mob_name;
    const displayName = entity.mob_name ?? entity.name;

    let color: string;
    if (entity.is_self) {
        color = "#22c55e";
    } else if (entity.is_player) {
        color = entity.faction === "Horde" ? "#dc2626" : "#2563eb";
    } else if (entity.mob_state) {
        color = MOB_STATE_COLORS[entity.mob_state] ?? "#6b7280";
    } else {
        color = "#6b7280";
    }

    const radius = entity.is_self ? 10 : isMob ? 7 : 8;
    const hpPct = entity.health.maximum > 0
        ? entity.health.current / entity.health.maximum
        : 0;

    return (
        <CircleMarker
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
                color: selected ? "#facc15" : "#000",
                weight: selected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: 0.9,
            }}
            eventHandlers={{
                click: (e) => {
                    e.originalEvent.stopPropagation();
                    if (!entity.is_self) onClick();
                },
            }}
        >
            <Tooltip
                direction="top"
                offset={[0, -10]}
                permanent={entity.is_self || selected}
                className="entity-tooltip"
            >
                <span style={{ fontWeight: entity.is_self ? 700 : 400 }}>
                    {entity.is_self ? "You" : displayName}
                </span>
                {isMob && (
                    <span style={{ opacity: 0.7, fontSize: "0.8em" }}>
                        {" "}Lv.{entity.mob_level ?? entity.level}
                        {entity.mob_state ? ` (${entity.mob_state})` : ""}
                    </span>
                )}
                {!entity.is_self && entity.is_alive && (
                    <span style={{ display: "block", fontSize: "0.75em", opacity: 0.6 }}>
                        HP {Math.round(hpPct * 100)}%
                    </span>
                )}
            </Tooltip>
        </CircleMarker>
    );
}