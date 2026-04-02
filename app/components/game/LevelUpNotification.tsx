// app/components/game/LevelUpNotification.tsx
// Animated golden notification shown when the player levels up.

"use client";

import { useEffect, useState } from "react";

interface LevelUpNotificationProps {
    newLevel: number | null;
    onDismiss: () => void;
}

/**
 * Displays a prominent level-up banner that auto-dismisses
 * after 3 seconds.
 */
export default function LevelUpNotification({
                                                newLevel,
                                                onDismiss,
                                            }: LevelUpNotificationProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (newLevel === null) return;
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [newLevel, onDismiss]);

    if (!visible || newLevel === null) return null;

    return (
        <div className="level-up-notification">
            <div className="level-up-notification__glow" />
            <div className="level-up-notification__text">Level Up!</div>
            <div className="level-up-notification__level">Level {newLevel}</div>
        </div>
    );
}