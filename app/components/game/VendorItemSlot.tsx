// app/components/game/VendorItemSlot.tsx
// Renders a single item row inside the vendor's stock list.
// Shows item icon, name, price, quantity, and a Buy button.

"use client";

import { useState } from "react";
import type { VendorStockEntryData, ItemTypeName } from "@/app/types/game";

interface VendorItemSlotProps {
    entry: VendorStockEntryData;
    canAfford: boolean;
    onBuy: (itemId: string) => void;
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

export default function VendorItemSlot({ entry, canAfford, onBuy }: VendorItemSlotProps) {
    const [hovered, setHovered] = useState(false);
    const { item, quantity, buy_price } = entry;
    const color = TYPE_COLORS[item.item_type] ?? "#6b7280";
    const icon = TYPE_ICONS[item.item_type] ?? "•";

    return (
        <div
            className="vendor-item-slot"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <span className="vendor-item-slot__icon" style={{ color }}>{icon}</span>
            <div className="vendor-item-slot__info">
                <span className="vendor-item-slot__name" style={{ color }}>{item.name}</span>
                <span className="vendor-item-slot__qty">
                    {quantity === -1 ? "∞" : `×${quantity}`}
                </span>
            </div>
            <span className="vendor-item-slot__price">{buy_price}c</span>
            <button
                className={`vendor-item-slot__buy ${!canAfford ? "vendor-item-slot__buy--disabled" : ""}`}
                disabled={!canAfford}
                onClick={() => onBuy(item.item_id)}
            >
                Buy
            </button>

            {hovered && (
                <div className="vendor-item-slot__tooltip">
                    <div className="inv-slot__tooltip-name" style={{ color }}>{item.name}</div>
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
                    <div className="inv-slot__tooltip-sell">Sell back: {item.sell_value}c</div>
                </div>
            )}
        </div>
    );
}