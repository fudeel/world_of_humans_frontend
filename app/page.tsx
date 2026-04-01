// app/page.tsx
// Main entry point: connects to the Python game server via WebSocket,
// guides the player through character creation, then renders a real
// Leaflet map with entity interaction and arrow-key movement.

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameState } from "@/app/hooks/useGameState";
import CharacterCreation from "@/app/components/character-creation/CharacterCreation";
import PlayerHud from "@/app/components/game/PlayerHud";
import TargetPanel from "@/app/components/game/TargetPanel";
import ObjectInteractionPanel from "@/app/components/game/ObjectInteractionPanel";
import CombatLog from "@/app/components/game/CombatLog";

// Leaflet accesses `window` — must be loaded client-side only.
const GameMap = dynamic(
    () => import("@/app/components/game/GameMap"),
    { ssr: false },
);

/** World units the player moves per arrow-key tick (~8 meters). */
const MOVE_STEP = 8;

/** Milliseconds between repeated movement while holding a key. */
const MOVE_INTERVAL = 80;

/** Euclidean distance between two 2D points. */
function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export default function Home() {
    const {
        phase,
        connected,
        classData,
        player,
        entities,
        mapObjects,
        combatLog,
        error,
        createCharacter,
        movePlayer,
        attackTarget,
        interactWith,
        clearError,
    } = useGameState();

    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const selectedEntity = entities.find(
        (e) => e.entity_id === selectedEntityId && e.is_alive
    );

    const selectedObject = mapObjects.find(
        (o) => o.object_id === selectedObjectId && o.active
    );

    useEffect(() => {
        if (selectedEntityId && !selectedEntity) {
            setSelectedEntityId(null);
        }
    }, [selectedEntityId, selectedEntity]);

    useEffect(() => {
        if (selectedObjectId && !selectedObject) {
            setSelectedObjectId(null);
        }
    }, [selectedObjectId, selectedObject]);

    /* ── Arrow-key movement ───────────────────────────────────────── */

    const keysRef = useRef<Set<string>>(new Set());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const playerRef = useRef(player);
    playerRef.current = player;

    const processMovement = useCallback(() => {
        const p = playerRef.current;
        if (!p) return;

        const keys = keysRef.current;
        let dx = 0;
        let dy = 0;

        // Left/Right → longitude (x), Up/Down → latitude (y)
        // Up increases y (moves north on map), Down decreases y (moves south)
        if (keys.has("ArrowLeft") || keys.has("a")) dx -= MOVE_STEP;
        if (keys.has("ArrowRight") || keys.has("d")) dx += MOVE_STEP;
        if (keys.has("ArrowUp") || keys.has("w")) dy += MOVE_STEP;
        if (keys.has("ArrowDown") || keys.has("s")) dy -= MOVE_STEP;

        if (dx === 0 && dy === 0) return;

        const newX = Math.max(
            p.zoneBounds.min_x,
            Math.min(p.zoneBounds.max_x, p.position.x + dx)
        );
        const newY = Math.max(
            p.zoneBounds.min_y,
            Math.min(p.zoneBounds.max_y, p.position.y + dy)
        );

        movePlayer(newX, newY);
    }, [movePlayer]);

    useEffect(() => {
        if (phase !== "playing") return;

        const onKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                    "w", "a", "s", "d"].includes(key)
            ) {
                e.preventDefault();
                if (!keysRef.current.has(key)) {
                    keysRef.current.add(key);
                    processMovement();
                    if (!intervalRef.current) {
                        intervalRef.current = setInterval(processMovement, MOVE_INTERVAL);
                    }
                }
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            keysRef.current.delete(e.key);
            if (keysRef.current.size === 0 && intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            keysRef.current.clear();
        };
    }, [phase, processMovement]);

    /* ── Connecting ──────────────────────────────────────────────── */
    if (phase === "connecting") {
        return (
            <div className="screen screen--connecting">
                <div className="connect-box">
                    <div className="connect-box__spinner" />
                    <h1 className="connect-box__title">World of Humans</h1>
                    <p className="connect-box__status">
                        {connected
                            ? "Loading game data..."
                            : "Connecting to server..."}
                    </p>
                    <p className="connect-box__hint">
                        Make sure the Python server is running:
                        <code>python -m game.ws_main</code>
                    </p>
                </div>
            </div>
        );
    }

    /* ── Character Creation ──────────────────────────────────────── */
    if (phase === "character_creation" && classData) {
        return (
            <div className="screen screen--creation">
                {error && (
                    <div className="error-toast" onClick={clearError}>
                        {error} <span className="error-toast__dismiss">✕</span>
                    </div>
                )}
                <CharacterCreation
                    classData={classData}
                    onCreateCharacter={createCharacter}
                />
            </div>
        );
    }

    /* ── Playing ─────────────────────────────────────────────────── */
    if (phase === "playing" && player) {
        const isObjectInRange = selectedObject
            ? dist(player.position, selectedObject.position) <= selectedObject.interaction_range
            : false;

        return (
            <div className="screen screen--playing">
                {error && (
                    <div className="error-toast" onClick={clearError}>
                        {error} <span className="error-toast__dismiss">✕</span>
                    </div>
                )}

                <GameMap
                    player={player}
                    entities={entities}
                    mapObjects={mapObjects}
                    selectedId={selectedEntityId}
                    selectedObjectId={selectedObjectId}
                    onMove={movePlayer}
                    onSelectEntity={setSelectedEntityId}
                    onSelectObject={setSelectedObjectId}
                />

                <PlayerHud player={player} />

                {selectedEntity && (
                    <TargetPanel
                        target={selectedEntity}
                        onAttack={() => attackTarget(selectedEntity.entity_id)}
                        onDeselect={() => setSelectedEntityId(null)}
                    />
                )}

                {selectedObject && (
                    <ObjectInteractionPanel
                        object={selectedObject}
                        inRange={isObjectInRange}
                        onInteract={interactWith}
                        onDeselect={() => setSelectedObjectId(null)}
                    />
                )}

                <CombatLog events={combatLog} playerId={player.playerId} />

                <div className="controls-hint">
                    Arrow keys / WASD to move · Click mob to select · Click object to interact · Click map to move
                </div>
            </div>
        );
    }

    return null;
}