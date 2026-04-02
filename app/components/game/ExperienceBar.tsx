// app/components/game/ExperienceBar.tsx
// Compact experience progress bar rendered inside the player HUD.

"use client";

import type { ExperienceData } from "@/app/types/game";

interface ExperienceBarProps {
    experience: ExperienceData;
}

/**
 * Renders a thin purple XP bar showing progress toward the next level.
 * Shows "MAX" when the character has reached the level cap.
 */
export default function ExperienceBar({ experience }: ExperienceBarProps) {
    const pct =
        experience.exp_to_next_level > 0
            ? (experience.current_exp / experience.exp_to_next_level) * 100
            : 100;

    return (
        <div className="experience-bar">
            <span className="experience-bar__label">XP</span>
            <div className="experience-bar__track">
                <div
                    className="experience-bar__fill"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <span className="experience-bar__value">
                {experience.is_max_level
                    ? "MAX"
                    : `${experience.current_exp}/${experience.exp_to_next_level}`}
            </span>
        </div>
    );
}