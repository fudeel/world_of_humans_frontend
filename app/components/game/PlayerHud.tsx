// app/components/game/PlayerHud.tsx
// Heads-up display showing the player's character info, resources,
// and experience progress.

"use client";

import type { ExperienceData } from "@/app/types/game";
import type { PlayerState } from "@/app/hooks/useGameState";
import ExperienceBar from "@/app/components/game/ExperienceBar";

interface PlayerHudProps {
    player: PlayerState;
    experience: ExperienceData | null;
}

const RESOURCE_COLORS: Record<string, string> = {
    Mana: "#3b82f6",
    Rage: "#ef4444",
    Energy: "#eab308",
};

export default function PlayerHud({ player, experience }: PlayerHudProps) {
    const hpPct =
        player.health.maximum > 0
            ? (player.health.current / player.health.maximum) * 100
            : 0;

    return (
        <div className="player-hud">
            <div className="player-hud__identity">
                <span
                    className="player-hud__faction-dot"
                    style={{
                        background:
                            player.faction === "Alliance" ? "#2563eb" : "#dc2626",
                    }}
                />
                <span className="player-hud__name">{player.name}</span>
                <span className="player-hud__meta">
                    Lv.{player.level} {player.race} {player.className}
                </span>
            </div>

            {/* Health bar */}
            <div className="player-hud__bar-row">
                <span className="player-hud__bar-label">HP</span>
                <div className="player-hud__bar-track">
                    <div
                        className="player-hud__bar-fill player-hud__bar-fill--hp"
                        style={{ width: `${hpPct}%` }}
                    />
                </div>
                <span className="player-hud__bar-value">
                    {player.health.current}/{player.health.maximum}
                </span>
            </div>

            {/* Secondary resources */}
            {Object.entries(player.resources).map(([key, pool]) => {
                const pct =
                    pool.maximum > 0
                        ? (pool.current / pool.maximum) * 100
                        : 0;
                return (
                    <div className="player-hud__bar-row" key={key}>
                        <span className="player-hud__bar-label">
                            {key.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="player-hud__bar-track">
                            <div
                                className="player-hud__bar-fill"
                                style={{
                                    width: `${pct}%`,
                                    background:
                                        RESOURCE_COLORS[key] ?? "#6b7280",
                                }}
                            />
                        </div>
                        <span className="player-hud__bar-value">
                            {pool.current}/{pool.maximum}
                        </span>
                    </div>
                );
            })}

            {/* Experience bar */}
            {experience && <ExperienceBar experience={experience} />}

            {/* Coordinates */}
            <div className="player-hud__coords">
                ({player.position.x.toFixed(0)}, {player.position.y.toFixed(0)})
                — {player.zoneName}
            </div>
        </div>
    );
}