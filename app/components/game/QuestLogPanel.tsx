// app/components/game/QuestLogPanel.tsx
// Overlay panel displaying the player's accepted quests and progress.

"use client";

import type { QuestLogData } from "@/app/types/game";
import QuestEntryCard from "./QuestEntryCard";

interface QuestLogPanelProps {
    questLog: QuestLogData;
    onClose: () => void;
    onAbandon: (questId: string) => void;
    onTurnIn: (questId: string) => void;
}

export default function QuestLogPanel({
                                          questLog,
                                          onClose,
                                          onAbandon,
                                          onTurnIn,
                                      }: QuestLogPanelProps) {
    const active = questLog.entries.filter(
        (e) => e.status === "in_progress" || e.status === "completed"
    );
    const finished = questLog.entries.filter(
        (e) => e.status === "turned_in"
    );

    return (
        <div className="quest-log-panel">
            <div className="quest-log-panel__header">
                <span className="quest-log-panel__title">
                    📜 Quest Log ({active.length}/{questLog.max_quests})
                </span>
                <button className="quest-log-panel__close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="quest-log-panel__body">
                {active.length === 0 && finished.length === 0 && (
                    <div className="quest-log-panel__empty">
                        No quests. Talk to NPCs with a 📜 marker to find quests.
                    </div>
                )}

                {active.length > 0 && (
                    <div className="quest-log-panel__section">
                        <div className="quest-log-panel__section-label">Active</div>
                        {active.map((entry) => (
                            <QuestEntryCard
                                key={entry.quest_id}
                                entry={entry}
                                onAbandon={onAbandon}
                                onTurnIn={onTurnIn}
                            />
                        ))}
                    </div>
                )}

                {finished.length > 0 && (
                    <div className="quest-log-panel__section">
                        <div className="quest-log-panel__section-label">Completed</div>
                        {finished.map((entry) => (
                            <QuestEntryCard
                                key={entry.quest_id}
                                entry={entry}
                                onAbandon={onAbandon}
                                onTurnIn={onTurnIn}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}