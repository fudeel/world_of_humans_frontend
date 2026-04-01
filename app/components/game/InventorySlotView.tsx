// app/components/game/InventorySlotView.tsx
// Renders a single inventory slot (occupied or empty) with tooltip.

"use client";

import { useState } from "react";
import type { InventorySlotData, ItemTypeName } from "@/app/types/game";

interface InventorySlotViewProps {
    slot: InventorySlotData | null;
    index: number;
}

const TYPE_COLORS: Record<ItemTypeName, string> = {
    weapon: "#a855f7",
    armor: "#3b82f6",
    consumable: "#22c55e",
    quest_item: "#eab308",
    junk: "#6b7280",
};

const TYPE_ICONS: Record<ItemTypeName, string> = {
    weapon: "⚔",
    armor: "🛡",
    consumable: "🧪",
    quest_item: "📜",
    junk: "•",
};

export default function InventorySlotView({ slot, index }: InventorySlotViewProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (!slot) {
        return <div className="inv-slot inv-slot--empty" />;
    }

    const { item, quantity } = slot;
    const borderColor = TYPE_COLORS[item.item_type] ?? "#6b7280";

    return (
        <div
            className="inv-slot inv-slot--occupied"
            style={{ borderColor }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span className="inv-slot__icon">
                {TYPE_ICONS[item.item_type] ?? "•"}
            </span>
            {quantity > 1 && (
                <span className="inv-slot__qty">{quantity}</span>
            )}

            {showTooltip && (
                <div className="inv-slot__tooltip">
                    <div
                        className="inv-slot__tooltip-name"
                        style={{ color: borderColor }}
                    >
                        {item.name}
                    </div>
                    <div className="inv-slot__tooltip-type">
                        {item.item_type} {item.slot !== "none" ? `· ${item.slot}` : ""}
                    </div>
                    {item.description && (
                        <div className="inv-slot__tooltip-desc">
                            {item.description}
                        </div>
                    )}
                    {Object.entries(item.stat_bonuses).length > 0 && (
                        <div className="inv-slot__tooltip-stats">
                            {Object.entries(item.stat_bonuses).map(([stat, val]) => (
                                <span key={stat} className="inv-slot__tooltip-stat">
                                    +{val} {stat}
                                </span>
                            ))}
                        </div>
                    )}
                    {item.sell_value > 0 && (
                        <div className="inv-slot__tooltip-sell">
                            Sell: {item.sell_value}c
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}