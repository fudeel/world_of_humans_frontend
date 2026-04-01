// app/components/game/TargetPanel.tsx
// Displays information about the currently selected/targeted entity.
// Shows attack for hostile mobs, and interact for quest givers.

"use client";

import type { WorldEntity } from "@/app/types/game";

interface TargetPanelProps {
    target: WorldEntity;
    inRange: boolean;
    onAttack: () => void;
    onInteractNpc: () => void;
    onDeselect: () => void;
}

export default function TargetPanel({
                                        target,
                                        inRange,
                                        onAttack,
                                        onInteractNpc,
                                        onDeselect,
                                    }: TargetPanelProps) {
    const hpPct =
        target.health.maximum > 0
            ? (target.health.current / target.health.maximum) * 100
            : 0;

    const displayName = target.mob_name ?? target.name;
    const isMob = !!target.mob_name;
    const isQuestGiver = !!target.is_quest_giver;

    return (
        <div className="target-panel">
            <div className="target-panel__header">
                <span className="target-panel__name">
                    {isQuestGiver && "📜 "}
                    {displayName}
                </span>
                <button className="target-panel__close" onClick={onDeselect}>
                    ✕
                </button>
            </div>

            <div className="target-panel__level">
                Level {target.mob_level ?? target.level}
                {target.mob_state && (
                    <span className="target-panel__state"> — {target.mob_state}</span>
                )}
                {isQuestGiver && (
                    <span className="target-panel__state"> — Quest Giver</span>
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

            {isMob && target.is_alive && isQuestGiver && (
                inRange ? (
                    <button className="target-panel__interact-btn" onClick={onInteractNpc}>
                        📜 Talk
                    </button>
                ) : (
                    <div className="target-panel__out-of-range">
                        Move closer to talk
                    </div>
                )
            )}

            {isMob && target.is_alive && !isQuestGiver && (
                inRange ? (
                    <button className="target-panel__attack-btn" onClick={onAttack}>
                        ⚔ Attack
                    </button>
                ) : (
                    <div className="target-panel__out-of-range">
                        Move closer to attack
                    </div>
                )
            )}
        </div>
    );
}