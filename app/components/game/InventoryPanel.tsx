// app/components/game/InventoryPanel.tsx
// Overlay panel displaying the player's inventory grid and currency.

"use client";

import type { CurrencyData, InventoryData } from "@/app/types/game";
import CurrencyDisplay from "./CurrencyDisplay";
import InventorySlot from "./InventorySlotView";

interface InventoryPanelProps {
    inventory: InventoryData;
    currency: CurrencyData;
    onClose: () => void;
}

export default function InventoryPanel({
                                           inventory,
                                           currency,
                                           onClose,
                                       }: InventoryPanelProps) {
    const used = inventory.slots.filter((s) => s !== null).length;

    return (
        <div className="inventory-panel">
            <div className="inventory-panel__header">
                <span className="inventory-panel__title">
                    🎒 Inventory ({used}/{inventory.capacity})
                </span>
                <button className="inventory-panel__close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="inventory-panel__grid">
                {inventory.slots.map((slot, idx) => (
                    <InventorySlot key={idx} slot={slot} index={idx} />
                ))}
            </div>

            <div className="inventory-panel__footer">
                <CurrencyDisplay currency={currency} />
            </div>
        </div>
    );
}