// app/components/game/ObjectInteractionPanel.tsx
// Displays information about the currently selected map object
// and provides an interaction button when the player is in range.

"use client";

import type { MapObjectData, InteractionTypeName } from "@/app/types/game";

interface ObjectInteractionPanelProps {
    object: MapObjectData;
    inRange: boolean;
    onInteract: (objectId: string) => void;
    onDeselect: () => void;
}

/** Human-readable label for each interaction type. */
const INTERACTION_LABELS: Record<InteractionTypeName, string> = {
    loot: "Pick Up",
    gather: "Gather",
    talk: "Talk",
    activate: "Open",
};

/** Emoji icon per object type for the panel header. */
const TYPE_ICONS: Record<string, string> = {
    item: "\u2694",
    resource_node: "\u2618",
    npc: "\uD83D\uDDE3",
    interactable: "\u2699",
};

export default function ObjectInteractionPanel({
                                                   object,
                                                   inRange,
                                                   onInteract,
                                                   onDeselect,
                                               }: ObjectInteractionPanelProps) {
    const label = INTERACTION_LABELS[object.interaction_type];
    const icon = TYPE_ICONS[object.object_type] ?? "\u2022";

    return (
        <div className="object-panel">
            <div className="object-panel__header">
                <span className="object-panel__icon">{icon}</span>
                <span className="object-panel__name">{object.name}</span>
                <button className="object-panel__close" onClick={onDeselect}>
                    ✕
                </button>
            </div>

            <div className="object-panel__type">
                {object.object_type.replace("_", " ")}
            </div>

            <div className="object-panel__coords">
                ({object.position.x.toFixed(0)}, {object.position.y.toFixed(0)})
            </div>

            {object.metadata && Object.keys(object.metadata).length > 0 && (
                <div className="object-panel__meta">
                    {Object.entries(object.metadata).map(([key, val]) => (
                        <span key={key} className="object-panel__meta-tag">
                            {key.replace("_", " ")}: {String(val)}
                        </span>
                    ))}
                </div>
            )}

            {inRange ? (
                <button
                    className="object-panel__interact-btn"
                    onClick={() => onInteract(object.object_id)}
                >
                    {label}
                </button>
            ) : (
                <div className="object-panel__out-of-range">
                    Move closer to interact
                </div>
            )}
        </div>
    );
}