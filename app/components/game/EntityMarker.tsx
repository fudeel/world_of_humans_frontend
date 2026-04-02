// app/components/game/EntityMarker.tsx
// Renders a single living entity on the Leaflet map as a CircleMarker.
// Vendors show as gold, quest givers as blue, hostile mobs by state.

"use client";

import type { LatLngTuple, PointTuple } from "leaflet";
import { CircleMarker, Tooltip } from "react-leaflet";
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

const TOOLTIP_OFFSET: PointTuple = [0, -10];

export default function EntityMapMarker({
                                            entity,
                                            selected,
                                            onClick,
                                        }: EntityMapMarkerProps) {
    if (!entity.is_alive && !entity.is_self) return null;

    const center: LatLngTuple = worldToGeo(entity.position.x, entity.position.y);
    const isMob = !!entity.mob_name;
    const displayName = entity.mob_name ?? entity.name;
    const isVendor = !!entity.is_vendor;
    const isQuestGiver = !!entity.is_quest_giver;

    let color: string;
    if (entity.is_self) {
        color = "#22c55e";
    } else if (entity.is_player) {
        color = entity.faction === "Horde" ? "#dc2626" : "#2563eb";
    } else if (isVendor) {
        color = "#d4a843";
    } else if (isQuestGiver) {
        color = "#3b82f6";
    } else if (entity.mob_state) {
        color = MOB_STATE_COLORS[entity.mob_state] ?? "#6b7280";
    } else {
        color = "#6b7280";
    }

    const markerRadius = entity.is_self ? 10 : isMob ? 7 : 8;
    const hpPct = entity.health.maximum > 0
        ? entity.health.current / entity.health.maximum
        : 0;

    return (
        <CircleMarker
            center={center}
            radius={markerRadius}
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
                offset={TOOLTIP_OFFSET}
                permanent={entity.is_self || selected}
                className="entity-tooltip"
            >
                <span style={{ fontWeight: entity.is_self ? 700 : 400 }}>
                    {entity.is_self ? "You" : displayName}
                </span>
                {isMob && (
                    <span style={{ opacity: 0.7, fontSize: "0.8em" }}>
                        {" "}Lv.{entity.mob_level ?? entity.level}
                        {entity.mob_state ? ` · ${entity.mob_state}` : ""}
                    </span>
                )}
                {isVendor && (
                    <span style={{ display: "block", fontSize: "0.75em", color: "#d4a843" }}>
                        🏪 Vendor
                    </span>
                )}
                {isQuestGiver && !isVendor && (
                    <span style={{ display: "block", fontSize: "0.75em", color: "#60a5fa" }}>
                        📜 Quest Giver
                    </span>
                )}
                {!entity.is_self && hpPct < 1 && (
                    <span style={{ display: "block", fontSize: "0.75em", opacity: 0.5 }}>
                        HP: {Math.round(hpPct * 100)}%
                    </span>
                )}
            </Tooltip>
        </CircleMarker>
    );
}