// app/components/game/PlayerSellSlot.tsx
// Renders a single player inventory slot inside the vendor sell panel.
// Clicking the slot sells one unit to the vendor.

"use client";

import { useState } from "react";
import type { InventorySlotData, ItemTypeName } from "@/app/types/game";

interface PlayerSellSlotProps {
    slot: InventorySlotData | null;
    index: number;
    onSell: (slotIndex: number) => void;
}

const TYPE_ICONS: Record<ItemTypeName, string> = {
    weapon: "⚔",
    armor: "🛡",
    consumable: "🧪",
    quest_item: "📜",
    junk: "•",
};

const TYPE_COLORS: Record<ItemTypeName, string> = {
    weapon: "#a855f7",
    armor: "#3b82f6",
    consumable: "#22c55e",
    quest_item: "#eab308",
    junk: "#6b7280",
};

export default function PlayerSellSlot({ slot, index, onSell }: PlayerSellSlotProps) {
    const [hovered, setHovered] = useState(false);

    if (!slot) {
        return <div className="inv-slot inv-slot--empty" />;
    }

    const { item, quantity } = slot;
    const borderColor = TYPE_COLORS[item.item_type] ?? "#6b7280";
    const canSell = item.sell_value > 0;

    return (
        <div
            className={`inv-slot inv-slot--occupied ${canSell ? "inv-slot--sellable" : ""}`}
            style={{ borderColor, cursor: canSell ? "pointer" : "not-allowed" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => canSell && onSell(index)}
        >
            <span className="inv-slot__icon">
                {TYPE_ICONS[item.item_type] ?? "•"}
            </span>
            {quantity > 1 && (
                <span className="inv-slot__qty">{quantity}</span>
            )}

            {hovered && (
                <div className="inv-slot__tooltip">
                    <div className="inv-slot__tooltip-name" style={{ color: borderColor }}>
                        {item.name}
                    </div>
                    <div className="inv-slot__tooltip-type">
                        {item.item_type} {item.slot !== "none" ? `· ${item.slot}` : ""}
                    </div>
                    {item.description && (
                        <div className="inv-slot__tooltip-desc">{item.description}</div>
                    )}
                    {Object.entries(item.stat_bonuses).length > 0 && (
                        <div className="inv-slot__tooltip-stats">
                            {Object.entries(item.stat_bonuses).map(([stat, val]) => (
                                <span key={stat} className="inv-slot__tooltip-stat">+{val} {stat}</span>
                            ))}
                        </div>
                    )}
                    <div className="inv-slot__tooltip-sell">
                        {canSell ? `Click to sell: ${item.sell_value}c` : "Cannot be sold"}
                    </div>
                </div>
            )}
        </div>
    );
}