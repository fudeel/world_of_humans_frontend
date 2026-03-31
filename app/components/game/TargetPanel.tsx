// app/components/game/TargetPanel.tsx
// Displays information about the currently selected/targeted entity.

"use client";

import type { WorldEntity } from "@/app/types/game";

interface TargetPanelProps {
    target: WorldEntity;
    onAttack: () => void;
    onDeselect: () => void;
}

export default function TargetPanel({ target, onAttack, onDeselect }: TargetPanelProps) {
    const hpPct =
        target.health.maximum > 0
            ? (target.health.current / target.health.maximum) * 100
            : 0;

    const displayName = target.mob_name ?? target.name;
    const isMob = !!target.mob_name;

    return (
        <div className="target-panel">
            <div className="target-panel__header">
                <span className="target-panel__name">{displayName}</span>
                <button className="target-panel__close" onClick={onDeselect}>
                    ✕
                </button>
            </div>

            <div className="target-panel__level">
                Level {target.mob_level ?? target.level}
                {target.mob_state && (
                    <span className="target-panel__state"> — {target.mob_state}</span>
                )}
            </div>

            <div className="target-panel__hp-row">
                <div className="target-panel__hp-track">
                    <div
                        className="target-panel__hp-fill"
                        style={{ width: `${hpPct}%` }}
                    />
                </div>
                <span className="target-panel__hp-text">
          {target.health.current}/{target.health.maximum}
        </span>
            </div>

            {isMob && target.is_alive && (
                <button className="target-panel__attack-btn" onClick={onAttack}>
                    ⚔ Attack
                </button>
            )}
        </div>
    );
}