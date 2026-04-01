// app/components/game/LootWindow.tsx
// Popup window showing the contents of a loot drop.
// Player clicks individual items to pick them up.

"use client";

import type { LootDropData, ItemTypeName } from "@/app/types/game";

interface LootWindowProps {
    drop: LootDropData;
    onLootItem: (dropId: string, itemId: string) => void;
    onLootMoney: (dropId: string) => void;
    onClose: () => void;
}

const TYPE_COLORS: Record<ItemTypeName, string> = {
    weapon: "#a855f7",
    armor: "#3b82f6",
    consumable: "#22c55e",
    quest_item: "#eab308",
    junk: "#6b7280",
};

export default function LootWindow({
                                       drop,
                                       onLootItem,
                                       onLootMoney,
                                       onClose,
                                   }: LootWindowProps) {
    const isEmpty = drop.items.length === 0 && drop.money <= 0;

    return (
        <div className="loot-window">
            <div className="loot-window__header">
                <span className="loot-window__title">💀 Loot</span>
                <button className="loot-window__close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="loot-window__body">
                {isEmpty && (
                    <div className="loot-window__empty">Nothing to loot.</div>
                )}

                {drop.money > 0 && (
                    <button
                        className="loot-window__row loot-window__row--money"
                        onClick={() => onLootMoney(drop.drop_id)}
                    >
                        <span className="loot-window__row-icon">💰</span>
                        <span className="loot-window__row-name">
                            {drop.money} copper
                        </span>
                        <span className="loot-window__row-action">Take</span>
                    </button>
                )}

                {drop.items.map((item) => (
                    <button
                        key={item.item_id}
                        className="loot-window__row"
                        onClick={() => onLootItem(drop.drop_id, item.item_id)}
                    >
                        <span
                            className="loot-window__row-icon"
                            style={{ color: TYPE_COLORS[item.item_type] ?? "#6b7280" }}
                        >
                            {item.item_type === "weapon" ? "⚔" :
                                item.item_type === "armor" ? "🛡" :
                                    item.item_type === "consumable" ? "🧪" : "•"}
                        </span>
                        <span
                            className="loot-window__row-name"
                            style={{ color: TYPE_COLORS[item.item_type] ?? "#e5e7eb" }}
                        >
                            {item.name}
                        </span>
                        <span className="loot-window__row-action">Take</span>
                    </button>
                ))}
            </div>
        </div>
    );
}