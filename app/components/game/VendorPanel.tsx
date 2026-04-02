// app/components/game/VendorPanel.tsx
// Full vendor interaction window showing vendor stock on the left
// and the player's sellable inventory on the right. Composes
// VendorItemSlot and PlayerSellSlot for granular reuse.

"use client";

import type { CurrencyData, InventoryData, VendorData } from "@/app/types/game";
import CurrencyDisplay from "./CurrencyDisplay";
import VendorItemSlot from "./VendorItemSlot";
import PlayerSellSlot from "./PlayerSellSlot";

interface VendorPanelProps {
    vendor: VendorData;
    inventory: InventoryData;
    currency: CurrencyData;
    onBuy: (vendorId: string, itemId: string) => void;
    onSell: (vendorId: string, slotIndex: number) => void;
    onClose: () => void;
}

export default function VendorPanel({
                                        vendor,
                                        inventory,
                                        currency,
                                        onBuy,
                                        onSell,
                                        onClose,
                                    }: VendorPanelProps) {
    return (
        <div className="vendor-panel">
            <div className="vendor-panel__header">
                <span className="vendor-panel__title">🏪 Vendor</span>
                <button className="vendor-panel__close" onClick={onClose}>✕</button>
            </div>

            <div className="vendor-panel__body">
                {/* Vendor stock (buy side) */}
                <div className="vendor-panel__stock">
                    <div className="vendor-panel__section-label">
                        Vendor Stock
                        <span className="vendor-panel__vendor-gold">
                            <CurrencyDisplay currency={vendor.currency} />
                        </span>
                    </div>
                    <div className="vendor-panel__stock-list">
                        {vendor.stock.length === 0 && (
                            <div className="vendor-panel__empty">No items for sale.</div>
                        )}
                        {vendor.stock.map((entry) => (
                            <VendorItemSlot
                                key={entry.item.item_id}
                                entry={entry}
                                canAfford={currency.total_copper >= entry.buy_price}
                                onBuy={(itemId) => onBuy(vendor.vendor_id, itemId)}
                            />
                        ))}
                    </div>
                </div>

                {/* Player inventory (sell side) */}
                <div className="vendor-panel__sell">
                    <div className="vendor-panel__section-label">
                        Your Items
                        <span className="vendor-panel__vendor-gold">
                            <CurrencyDisplay currency={currency} />
                        </span>
                    </div>
                    <div className="vendor-panel__sell-grid">
                        {inventory.slots.map((slot, idx) => (
                            <PlayerSellSlot
                                key={idx}
                                slot={slot}
                                index={idx}
                                onSell={(slotIndex) => onSell(vendor.vendor_id, slotIndex)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="vendor-panel__footer">
                Click a vendor item to buy · Click your item to sell
            </div>
        </div>
    );
}