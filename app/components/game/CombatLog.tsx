// app/components/game/CombatLog.tsx
// Scrolling log of combat events (damage, deaths).

"use client";

import { useEffect, useRef } from "react";
import type { CombatEvent } from "@/app/hooks/useGameState";
import type { DamagePayload, DeathPayload } from "@/app/types/game";

interface CombatLogProps {
    events: CombatEvent[];
    playerId: string;
}

export default function CombatLog({ events, playerId }: CombatLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events.length]);

    if (events.length === 0) return null;

    return (
        <div className="combat-log">
            <div className="combat-log__header">Combat Log</div>
            <div className="combat-log__scroll" ref={scrollRef}>
                {events.map((evt) => (
                    <div
                        key={evt.id}
                        className={`combat-log__entry combat-log__entry--${evt.type}`}
                    >
                        {evt.type === "damage" && formatDamage(evt.payload as DamagePayload, playerId)}
                        {evt.type === "death" && formatDeath(evt.payload as DeathPayload, playerId)}
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatDamage(d: DamagePayload, playerId: string): string {
    const src = d.source_id === playerId ? "You" : d.source_id;
    const tgt = d.target_id === playerId ? "you" : d.target_id;
    return `${src} hit ${tgt} for ${d.amount} (${d.remaining_health} HP left)`;
}

function formatDeath(d: DeathPayload, playerId: string): string {
    const victim = d.entity_id === playerId ? "You" : d.entity_id;
    const killer = d.killer_id === playerId ? "you" : d.killer_id;
    return `${victim} was slain by ${killer}`;
}