// app/components/game/EntityMarker.tsx
// Renders a single entity (player, mob, or other) on the 2D world map.

"use client";

import type { WorldEntity } from "@/app/types/game";

interface EntityMarkerProps {
    entity: WorldEntity;
    scale: number;
    offsetX: number;
    offsetY: number;
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

export default function EntityMarker({
                                         entity,
                                         scale,
                                         offsetX,
                                         offsetY,
                                         selected,
                                         onClick,
                                     }: EntityMarkerProps) {
    if (!entity.is_alive && !entity.is_self) return null;

    const screenX = entity.position.x * scale + offsetX;
    const screenY = entity.position.y * scale + offsetY;

    const isMob = !!entity.mob_name;
    const displayName = entity.mob_name ?? entity.name;

    let markerColor: string;
    if (entity.is_self) {
        markerColor = "#22c55e";
    } else if (entity.is_player) {
        markerColor = entity.faction === "Horde" ? "#dc2626" : "#2563eb";
    } else if (entity.mob_state) {
        markerColor = MOB_STATE_COLORS[entity.mob_state] ?? "#6b7280";
    } else {
        markerColor = "#6b7280";
    }

    const hpPct =
        entity.health.maximum > 0
            ? entity.health.current / entity.health.maximum
            : 0;

    const size = entity.is_self ? 14 : isMob ? 10 : 12;

    return (
        <g
            className="entity-marker"
            transform={`translate(${screenX}, ${screenY})`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{ cursor: isMob ? "pointer" : "default" }}
        >
            {/* Selection ring */}
            {selected && (
                <circle
                    r={size + 4}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth={2}
                    className="entity-marker__selection"
                />
            )}

            {/* Body */}
            {entity.is_self ? (
                <polygon
                    points={`0,${-size} ${size * 0.7},${size * 0.5} ${-size * 0.7},${size * 0.5}`}
                    fill={markerColor}
                    stroke="#000"
                    strokeWidth={1.5}
                />
            ) : (
                <circle
                    r={size / 2}
                    fill={markerColor}
                    stroke={selected ? "#facc15" : "#000"}
                    strokeWidth={1}
                />
            )}

            {/* Health bar */}
            {!entity.is_self && entity.is_alive && (
                <g transform={`translate(0, ${-size - 4})`}>
                    <rect
                        x={-14}
                        y={-3}
                        width={28}
                        height={4}
                        rx={1}
                        fill="#1f2937"
                        stroke="#000"
                        strokeWidth={0.5}
                    />
                    <rect
                        x={-14}
                        y={-3}
                        width={28 * hpPct}
                        height={4}
                        rx={1}
                        fill={hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#f59e0b" : "#ef4444"}
                    />
                </g>
            )}

            {/* Name label */}
            <text
                y={size + 12}
                textAnchor="middle"
                className="entity-marker__label"
                fill={entity.is_self ? "#86efac" : "#e5e7eb"}
                fontSize={entity.is_self ? 11 : 9}
                fontWeight={entity.is_self ? 700 : 400}
            >
                {entity.is_self ? "You" : displayName}
            </text>

            {/* Level */}
            {isMob && (
                <text
                    y={size + 22}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={8}
                >
                    Lv.{entity.mob_level ?? entity.level}
                    {entity.mob_state ? ` (${entity.mob_state})` : ""}
                </text>
            )}
        </g>
    );
}