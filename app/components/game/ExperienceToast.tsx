// app/components/game/ExperienceToast.tsx
// Floating "+XP" notifications that appear briefly when experience is gained.

"use client";

import { useEffect, useState } from "react";

export interface ExpToastEntry {
    id: number;
    amount: number;
    source: string;
    timestamp: number;
}

interface ExperienceToastProps {
    toasts: ExpToastEntry[];
}

/**
 * Renders a stack of ephemeral XP-gain toasts.
 * Each toast fades out after 1.5 seconds.
 */
export default function ExperienceToast({ toasts }: ExperienceToastProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="experience-toast-container">
            {toasts.map((t) => (
                <ToastItem key={t.id} entry={t} />
            ))}
        </div>
    );
}

function ToastItem({ entry }: { entry: ExpToastEntry }) {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFading(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const label = entry.source === "quest" ? "Quest XP" : "Kill XP";

    return (
        <div
            className={`experience-toast ${fading ? "experience-toast--fading" : ""}`}
        >
            +{entry.amount} {label}
        </div>
    );
}