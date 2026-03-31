// app/components/character-creation/FactionSelect.tsx
// Faction selection: Alliance or Horde.

"use client";

import type { Faction } from "@/app/types/game";

interface FactionSelectProps {
    onSelect: (faction: Faction) => void;
}

const FACTION_DATA: { name: Faction; color: string; sigil: string; motto: string }[] = [
    {
        name: "Alliance",
        color: "#1e40af",
        sigil: "🦁",
        motto: "For honor and glory",
    },
    {
        name: "Horde",
        color: "#991b1b",
        sigil: "🐺",
        motto: "Strength and honor",
    },
];

export default function FactionSelect({ onSelect }: FactionSelectProps) {
    return (
        <div className="faction-select">
            <h2 className="faction-select__title">Choose Your Faction</h2>
            <div className="faction-select__grid">
                {FACTION_DATA.map((f) => (
                    <button
                        key={f.name}
                        className="faction-card"
                        style={{ "--faction-color": f.color } as React.CSSProperties}
                        onClick={() => onSelect(f.name)}
                    >
                        <span className="faction-card__sigil">{f.sigil}</span>
                        <span className="faction-card__name">{f.name}</span>
                        <span className="faction-card__motto">{f.motto}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}