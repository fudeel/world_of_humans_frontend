// app/components/game/GameWorld.tsx
// 2D SVG world renderer with click-to-move and entity selection.

"use client";

import { useCallback, useRef, useState } from "react";
import type { WorldEntity } from "@/app/types/game";
import type { PlayerState } from "@/app/hooks/useGameState";
import EntityMarker from "./EntityMarker";

interface GameWorldProps {
    player: PlayerState;
    entities: WorldEntity[];
    selectedId: string | null;
    onMove: (x: number, y: number) => void;
    onSelectEntity: (id: string | null) => void;
}

/** Pixels per world unit. */
const BASE_SCALE = 1.4;

export default function GameWorld({
                                      player,
                                      entities,
                                      selectedId,
                                      onMove,
                                      onSelectEntity,
                                  }: GameWorldProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [viewSize, setViewSize] = useState({ w: 900, h: 600 });

    const bounds = player.zoneBounds;
    const worldW = bounds.max_x - bounds.min_x;
    const worldH = bounds.max_y - bounds.min_y;

    const scale = BASE_SCALE;
    const mapW = worldW * scale;
    const mapH = worldH * scale;

    /** Camera offset so player is centred. */
    const camX = viewSize.w / 2 - player.position.x * scale;
    const camY = viewSize.h / 2 - player.position.y * scale;

    /** Convert screen click to world coordinates. */
    const handleClick = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const worldX = (sx - camX) / scale;
            const worldY = (sy - camY) / scale;

            if (
                worldX >= bounds.min_x &&
                worldX <= bounds.max_x &&
                worldY >= bounds.min_y &&
                worldY <= bounds.max_y
            ) {
                onSelectEntity(null);
                onMove(worldX, worldY);
            }
        },
        [camX, camY, scale, bounds, onMove, onSelectEntity]
    );

    /** Update viewbox on resize. */
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const obs = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setViewSize({
                    w: entry.contentRect.width,
                    h: entry.contentRect.height,
                });
            }
        });
        obs.observe(node);
        setViewSize({ w: node.clientWidth, h: node.clientHeight });
        return () => obs.disconnect();
    }, []);

    return (
        <div className="game-world" ref={containerRef}>
            <svg
                ref={svgRef}
                className="game-world__svg"
                width={viewSize.w}
                height={viewSize.h}
                onClick={handleClick}
            >
                <defs>
                    <pattern
                        id="grid"
                        width={100 * scale}
                        height={100 * scale}
                        patternUnits="userSpaceOnUse"
                        patternTransform={`translate(${camX} ${camY})`}
                    >
                        <rect
                            width={100 * scale}
                            height={100 * scale}
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth={1}
                        />
                    </pattern>
                </defs>

                {/* Background */}
                <rect width="100%" height="100%" fill="#0c1117" />
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Zone boundary */}
                <rect
                    x={bounds.min_x * scale + camX}
                    y={bounds.min_y * scale + camY}
                    width={worldW * scale}
                    height={worldH * scale}
                    fill="rgba(34,80,34,0.12)"
                    stroke="rgba(74,222,128,0.2)"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                />

                {/* Zone label */}
                <text
                    x={bounds.min_x * scale + camX + 10}
                    y={bounds.min_y * scale + camY + 18}
                    fill="rgba(74,222,128,0.35)"
                    fontSize={13}
                    fontFamily="monospace"
                >
                    {player.zoneName} [{bounds.min_x},{bounds.min_y} → {bounds.max_x},{bounds.max_y}]
                </text>

                {/* Chunk grid lines */}
                {Array.from({ length: Math.ceil(worldW / 100) + 1 }, (_, i) => (
                    <line
                        key={`vl-${i}`}
                        x1={(bounds.min_x + i * 100) * scale + camX}
                        y1={bounds.min_y * scale + camY}
                        x2={(bounds.min_x + i * 100) * scale + camX}
                        y2={bounds.max_y * scale + camY}
                        stroke="rgba(255,255,255,0.025)"
                        strokeWidth={0.5}
                    />
                ))}
                {Array.from({ length: Math.ceil(worldH / 100) + 1 }, (_, i) => (
                    <line
                        key={`hl-${i}`}
                        x1={bounds.min_x * scale + camX}
                        y1={(bounds.min_y + i * 100) * scale + camY}
                        x2={bounds.max_x * scale + camX}
                        y2={(bounds.min_y + i * 100) * scale + camY}
                        stroke="rgba(255,255,255,0.025)"
                        strokeWidth={0.5}
                    />
                ))}

                {/* Entities */}
                {entities.map((entity) => (
                    <EntityMarker
                        key={entity.entity_id}
                        entity={entity}
                        scale={scale}
                        offsetX={camX}
                        offsetY={camY}
                        selected={selectedId === entity.entity_id}
                        onClick={() => {
                            if (!entity.is_self) {
                                onSelectEntity(
                                    selectedId === entity.entity_id ? null : entity.entity_id
                                );
                            }
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}