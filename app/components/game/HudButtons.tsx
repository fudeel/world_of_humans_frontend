// app/components/game/HudButtons.tsx
// Bottom-center toolbar with clickable HUD action buttons.

"use client";

interface HudButtonsProps {
    onInventoryClick: () => void;
    onQuestsClick: () => void;
    inventoryUsed: number;
    inventoryCapacity: number;
    activeQuests: number;
}

export default function HudButtons({
                                       onInventoryClick,
                                       onQuestsClick,
                                       inventoryUsed,
                                       inventoryCapacity,
                                       activeQuests,
                                   }: HudButtonsProps) {
    return (
        <div className="hud-buttons">
            <button
                className="hud-buttons__btn"
                onClick={onInventoryClick}
                title="Open Inventory (B)"
            >
                <span className="hud-buttons__icon">🎒</span>
                <span className="hud-buttons__label">Bag</span>
                <span className="hud-buttons__badge">
                    {inventoryUsed}/{inventoryCapacity}
                </span>
            </button>

            <button
                className="hud-buttons__btn"
                onClick={onQuestsClick}
                title="Open Quest Log (L)"
            >
                <span className="hud-buttons__icon">📜</span>
                <span className="hud-buttons__label">Quests</span>
                {activeQuests > 0 && (
                    <span className="hud-buttons__badge hud-buttons__badge--active">
                        {activeQuests}
                    </span>
                )}
            </button>
        </div>
    );
}