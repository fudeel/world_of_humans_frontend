// app/components/game/QuestEntryCard.tsx
// Displays a single quest entry with objectives and action buttons.

"use client";

import type { QuestEntryData } from "@/app/types/game";

interface QuestEntryCardProps {
    entry: QuestEntryData;
    onAbandon: (questId: string) => void;
    onTurnIn: (questId: string) => void;
}

export default function QuestEntryCard({
                                           entry,
                                           onAbandon,
                                           onTurnIn,
                                       }: QuestEntryCardProps) {
    const isCompleted = entry.status === "completed";
    const isTurnedIn = entry.status === "turned_in";

    return (
        <div className={`quest-card ${isCompleted ? "quest-card--completed" : ""}`}>
            <div className="quest-card__header">
                <span className="quest-card__title">{entry.title}</span>
                {isCompleted && (
                    <span className="quest-card__badge quest-card__badge--done">
                        COMPLETE
                    </span>
                )}
                {isTurnedIn && (
                    <span className="quest-card__badge quest-card__badge--turned-in">
                        DONE
                    </span>
                )}
            </div>

            <div className="quest-card__objectives">
                {entry.objectives.map((obj) => (
                    <div
                        key={obj.objective_id}
                        className={`quest-card__obj ${obj.is_complete ? "quest-card__obj--done" : ""}`}
                    >
                        <span className="quest-card__obj-check">
                            {obj.is_complete ? "✓" : "○"}
                        </span>
                        <span className="quest-card__obj-text">
                            {obj.description}
                        </span>
                        <span className="quest-card__obj-count">
                            {obj.current_count}/{obj.required_count}
                        </span>
                    </div>
                ))}
            </div>

            <div className="quest-card__reward">
                Reward: {entry.reward.copper > 0 ? `${entry.reward.copper}c` : ""}
                {entry.reward.experience > 0 ? ` ${entry.reward.experience} XP` : ""}
                {entry.reward.item_ids.length > 0 ? ` + ${entry.reward.item_ids.length} item(s)` : ""}
            </div>

            {!isTurnedIn && (
                <div className="quest-card__actions">
                    {isCompleted && (
                        <button
                            className="quest-card__btn quest-card__btn--turn-in"
                            onClick={() => onTurnIn(entry.quest_id)}
                        >
                            Turn In
                        </button>
                    )}
                    <button
                        className="quest-card__btn quest-card__btn--abandon"
                        onClick={() => onAbandon(entry.quest_id)}
                    >
                        Abandon
                    </button>
                </div>
            )}
        </div>
    );
}