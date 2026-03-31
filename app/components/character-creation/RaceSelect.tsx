// app/components/character-creation/RaceSelect.tsx
// Race selection filtered by faction.

"use client";

import type { Faction, RaceInfo, RaceName } from "@/app/types/game";

interface RaceSelectProps {
    faction: Faction;
    races: RaceInfo[];
    onSelect: (race: RaceName) => void;
    onBack: () => void;
}

const RACE_ICONS: Record<string, string> = {
    Human: "⚔️",
    Dwarf: "⛏️",
    "Night Elf": "🌙",
    Gnome: "🔧",
    Orc: "🪓",
    Tauren: "🐂",
    Troll: "🗡️",
    Undead: "💀",
};

export default function RaceSelect({ faction, races, onSelect, onBack }: RaceSelectProps) {
    return (
        <div className="race-select">
            <button className="back-button" onClick={onBack}>
                ← Back to factions
            </button>
            <h2 className="race-select__title">
        <span
            className="race-select__faction-badge"
            style={{
                background: faction === "Alliance" ? "#1e40af" : "#991b1b",
            }}
        >
          {faction}
        </span>
                Choose Your Race
            </h2>
            <div className="race-select__grid">
                {races.map((race) => (
                    <button
                        key={race.name}
                        className="race-card"
                        onClick={() => onSelect(race.name)}
                    >
            <span className="race-card__icon">
              {RACE_ICONS[race.name] ?? "🧙"}
            </span>
                        <span className="race-card__name">{race.name}</span>
                        <span className="race-card__class-count">
              {race.classes.length} class{race.classes.length !== 1 ? "es" : ""}
            </span>
                    </button>
                ))}
            </div>
        </div>
    );
}