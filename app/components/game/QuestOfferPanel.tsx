// app/components/game/QuestOfferPanel.tsx
// Modal panel showing quests offered by an NPC quest giver.

"use client";

import { useState } from "react";
import type { QuestOfferedPayload, QuestOfferData } from "@/app/types/game";

interface QuestOfferPanelProps {
    offer: QuestOfferedPayload;
    onAccept: (questId: string) => void;
    onClose: () => void;
}

export default function QuestOfferPanel({
                                            offer,
                                            onAccept,
                                            onClose,
                                        }: QuestOfferPanelProps) {
    const [selectedIdx, setSelectedIdx] = useState(0);

    if (offer.quests.length === 0) {
        return (
            <div className="quest-offer-panel">
                <div className="quest-offer-panel__header">
                    <span className="quest-offer-panel__title">NPC</span>
                    <button className="quest-offer-panel__close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="quest-offer-panel__empty">
                    No quests available right now.
                </div>
            </div>
        );
    }

    const quest: QuestOfferData = offer.quests[selectedIdx];

    return (
        <div className="quest-offer-panel">
            <div className="quest-offer-panel__header">
                <span className="quest-offer-panel__title">Quest Giver</span>
                <button className="quest-offer-panel__close" onClick={onClose}>
                    ✕
                </button>
            </div>

            {offer.quests.length > 1 && (
                <div className="quest-offer-panel__tabs">
                    {offer.quests.map((q, i) => (
                        <button
                            key={q.quest_id}
                            className={`quest-offer-panel__tab ${i === selectedIdx ? "quest-offer-panel__tab--active" : ""}`}
                            onClick={() => setSelectedIdx(i)}
                        >
                            {q.title}
                        </button>
                    ))}
                </div>
            )}

            <div className="quest-offer-panel__body">
                <h3 className="quest-offer-panel__quest-title">{quest.title}</h3>
                <p className="quest-offer-panel__desc">{quest.description}</p>

                <div className="quest-offer-panel__objectives">
                    <div className="quest-offer-panel__section-label">Objectives</div>
                    {quest.objectives.map((obj) => (
                        <div key={obj.objective_id} className="quest-offer-panel__obj">
                            ○ {obj.description} (0/{obj.required_count})
                        </div>
                    ))}
                </div>

                <div className="quest-offer-panel__rewards">
                    <div className="quest-offer-panel__section-label">Rewards</div>
                    {quest.reward.copper > 0 && (
                        <div className="quest-offer-panel__reward-line">
                            💰 {quest.reward.copper} copper
                        </div>
                    )}
                    {quest.reward.experience > 0 && (
                        <div className="quest-offer-panel__reward-line">
                            ✨ {quest.reward.experience} XP
                        </div>
                    )}
                    {quest.reward.item_ids.length > 0 && (
                        <div className="quest-offer-panel__reward-line">
                            🎁 {quest.reward.item_ids.length} item(s)
                        </div>
                    )}
                </div>
            </div>

            <div className="quest-offer-panel__actions">
                <button
                    className="quest-offer-panel__btn quest-offer-panel__btn--accept"
                    onClick={() => onAccept(quest.quest_id)}
                >
                    Accept
                </button>
                <button
                    className="quest-offer-panel__btn quest-offer-panel__btn--decline"
                    onClick={onClose}
                >
                    Decline
                </button>
            </div>
        </div>
    );
}