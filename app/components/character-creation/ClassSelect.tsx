// app/components/character-creation/ClassSelect.tsx
// Class selection filtered by the chosen race.

"use client";

import type { ClassInfo, ClassName, RaceName } from "@/app/types/game";

interface ClassSelectProps {
    race: RaceName;
    classes: ClassInfo[];
    onSelect: (className: ClassName) => void;
    onBack: () => void;
}

const CLASS_ICONS: Record<string, string> = {
    Hunter: "🏹",
    Mage: "🔮",
    Druid: "🌿",
    Paladin: "🛡️",
    Priest: "✨",
    Rogue: "🗡️",
    Shaman: "⚡",
    Warlock: "🔥",
    Warrior: "⚔️",
};

const ROLE_COLORS: Record<string, string> = {
    Tank: "#3b82f6",
    Healer: "#22c55e",
    "Melee DPS": "#ef4444",
    "Ranged DPS": "#f59e0b",
};

export default function ClassSelect({ race, classes, onSelect, onBack }: ClassSelectProps) {
    return (
        <div className="class-select">
            <button className="back-button" onClick={onBack}>
                ← Back to races
            </button>
            <h2 className="class-select__title">
                <span className="class-select__race-badge">{race}</span>
                Choose Your Class
            </h2>
            <div className="class-select__grid">
                {classes.map((cls) => (
                    <button
                        key={cls.type}
                        className="class-card"
                        onClick={() => onSelect(cls.type)}
                    >
                        <div className="class-card__header">
              <span className="class-card__icon">
                {CLASS_ICONS[cls.type] ?? "⚙️"}
              </span>
                            <span className="class-card__name">{cls.type}</span>
                        </div>
                        <p className="class-card__description">{cls.description}</p>
                        <div className="class-card__roles">
                            {cls.roles.map((role) => (
                                <span
                                    key={role}
                                    className="class-card__role-tag"
                                    style={{ background: ROLE_COLORS[role] ?? "#6b7280" }}
                                >
                  {role}
                </span>
                            ))}
                        </div>
                        <div className="class-card__talents">
                            {cls.talent_trees.join(" / ")}
                        </div>
                        <div className="class-card__resources">
                            {cls.resource_types
                                .filter((r) => r !== "Health")
                                .map((r) => (
                                    <span key={r} className="class-card__resource-tag">
                    {r}
                  </span>
                                ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}