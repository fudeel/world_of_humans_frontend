// app/components/game/CurrencyDisplay.tsx
// Inline display of gold, silver, and copper values.

"use client";

import type { CurrencyData } from "@/app/types/game";

interface CurrencyDisplayProps {
    currency: CurrencyData;
}

export default function CurrencyDisplay({ currency }: CurrencyDisplayProps) {
    return (
        <span className="currency-display">
            {currency.gold > 0 && (
                <span className="currency-display__gold">
                    {currency.gold}g{" "}
                </span>
            )}
            {(currency.gold > 0 || currency.silver > 0) && (
                <span className="currency-display__silver">
                    {currency.silver}s{" "}
                </span>
            )}
            <span className="currency-display__copper">
                {currency.copper}c
            </span>
        </span>
    );
}