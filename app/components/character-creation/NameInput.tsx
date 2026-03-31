// app/components/character-creation/NameInput.tsx
// Final character creation step: name entry and confirmation.

"use client";

import { useState } from "react";
import type { ClassName, Faction, RaceName } from "@/app/types/game";

interface NameInputProps {
    faction: Faction;
    race: RaceName;
    className: ClassName;
    onConfirm: (name: string) => void;
    onBack: () => void;
}

export default function NameInput({
                                      faction,
                                      race,
                                      className,
                                      onConfirm,
                                      onBack,
                                  }: NameInputProps) {
    const [name, setName] = useState("");

    const isValid = name.trim().length >= 2 && name.trim().length <= 16;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            onConfirm(name.trim());
        }
    };

    return (
        <div className="name-input">
            <button className="back-button" onClick={onBack}>
                ← Back to classes
            </button>
            <h2 className="name-input__title">Name Your Character</h2>
            <div className="name-input__summary">
        <span
            className="name-input__faction-dot"
            style={{
                background: faction === "Alliance" ? "#1e40af" : "#991b1b",
            }}
        />
                <span>{race}</span>
                <span className="name-input__separator">·</span>
                <span>{className}</span>
            </div>
            <form className="name-input__form" onSubmit={handleSubmit}>
                <input
                    className="name-input__field"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name (2–16 characters)"
                    maxLength={16}
                    autoFocus
                />
                <button
                    className="name-input__submit"
                    type="submit"
                    disabled={!isValid}
                >
                    Enter World
                </button>
            </form>
        </div>
    );
}