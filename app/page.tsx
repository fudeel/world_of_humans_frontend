// app/page.tsx
// Main entry point: connects to the Python game server via WebSocket,
// guides the player through character creation, then renders a real
// Leaflet map with entity interaction, loot, quests, and inventory.

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameState } from "@/app/hooks/useGameState";
import CharacterCreation from "@/app/components/character-creation/CharacterCreation";
import PlayerHud from "@/app/components/game/PlayerHud";
import TargetPanel from "@/app/components/game/TargetPanel";
import ObjectInteractionPanel from "@/app/components/game/ObjectInteractionPanel";
import CombatLog from "@/app/components/game/CombatLog";
import HudButtons from "@/app/components/game/HudButtons";
import InventoryPanel from "@/app/components/game/InventoryPanel";
import QuestLogPanel from "@/app/components/game/QuestLogPanel";
import QuestOfferPanel from "@/app/components/game/QuestOfferPanel";
import LootWindow from "@/app/components/game/LootWindow";
import NotificationToast from "@/app/components/game/NotificationToast";

const GameMap = dynamic(
    () => import("@/app/components/game/GameMap"),
    { ssr: false },
);

const MOVE_STEP = 8;
const MOVE_INTERVAL = 80;
const ATTACK_RANGE = 15;
const NPC_INTERACT_RANGE = 50;

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
        lootDrops,
        combatLog,
        inventory,
        currency,
        questLog,
        questOffer,
        activeLootDrop,
        error,
        notification,
        createCharacter,
        movePlayer,
        attackTarget,
        interactWith,
        interactNpc,
        acceptQuest,
        abandonQuest,
        turnInQuest,
        lootItem,
        lootMoney,
        openLootDrop,
        closeLootDrop,
        closeQuestOffer,
        clearError,
        clearNotification,
    } = useGameState();

    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [showInventory, setShowInventory] = useState(false);
    const [showQuestLog, setShowQuestLog] = useState(false);

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

    /* ── Arrow-key movement + hotkeys ─────────────────────────────── */

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

            // Hotkeys for panels
            if (key === "b" || key === "B") {
                setShowInventory((prev) => !prev);
                return;
            }
            if (key === "l" || key === "L") {
                setShowQuestLog((prev) => !prev);
                return;
            }
            if (key === "Escape") {
                setShowInventory(false);
                setShowQuestLog(false);
                closeLootDrop();
                closeQuestOffer();
                setSelectedEntityId(null);
                setSelectedObjectId(null);
                return;
            }

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
    }, [phase, processMovement, closeLootDrop, closeQuestOffer]);

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

        const isTargetInRange = selectedEntity
            ? dist(player.position, selectedEntity.position) <= ATTACK_RANGE
            : false;

        const isNpcInRange = selectedEntity
            ? dist(player.position, selectedEntity.position) <= NPC_INTERACT_RANGE
            : false;

        return (
            <div className="screen screen--playing">
                <GameMap
                    player={player}
                    entities={entities}
                    mapObjects={mapObjects}
                    lootDrops={lootDrops}
                    selectedId={selectedEntityId}
                    selectedObjectId={selectedObjectId}
                    onSelectEntity={setSelectedEntityId}
                    onSelectObject={setSelectedObjectId}
                    onClickLootDrop={openLootDrop}
                />

                <div className="hud-overlay">
                    {error && (
                        <div className="error-toast" onClick={clearError}>
                            {error} <span className="error-toast__dismiss">✕</span>
                        </div>
                    )}

                    {notification && (
                        <NotificationToast
                            message={notification}
                            onDismiss={clearNotification}
                        />
                    )}

                    <PlayerHud player={player} />

                    {selectedEntity && (
                        <TargetPanel
                            target={selectedEntity}
                            inRange={selectedEntity.is_quest_giver ? isNpcInRange : isTargetInRange}
                            onAttack={() => attackTarget(selectedEntity.entity_id)}
                            onInteractNpc={() => interactNpc(selectedEntity.entity_id)}
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

                    {/* Loot window */}
                    {activeLootDrop && (
                        <LootWindow
                            drop={activeLootDrop}
                            onLootItem={lootItem}
                            onLootMoney={lootMoney}
                            onClose={closeLootDrop}
                        />
                    )}

                    {/* Quest offer from NPC */}
                    {questOffer && (
                        <QuestOfferPanel
                            offer={questOffer}
                            onAccept={acceptQuest}
                            onClose={closeQuestOffer}
                        />
                    )}

                    {/* Inventory panel */}
                    {showInventory && inventory && currency && (
                        <InventoryPanel
                            inventory={inventory}
                            currency={currency}
                            onClose={() => setShowInventory(false)}
                        />
                    )}

                    {/* Quest log panel */}
                    {showQuestLog && questLog && (
                        <QuestLogPanel
                            questLog={questLog}
                            onClose={() => setShowQuestLog(false)}
                            onAbandon={abandonQuest}
                            onTurnIn={turnInQuest}
                        />
                    )}

                    <CombatLog events={combatLog} playerId={player.playerId} />

                    {/* HUD toolbar buttons */}
                    <HudButtons
                        onInventoryClick={() => setShowInventory((p) => !p)}
                        onQuestsClick={() => setShowQuestLog((p) => !p)}
                        inventoryUsed={inventory?.slots.filter((s) => s !== null).length ?? 0}
                        inventoryCapacity={inventory?.capacity ?? 8}
                        activeQuests={questLog?.entries.filter(
                            (e) => e.status === "in_progress" || e.status === "completed"
                        ).length ?? 0}
                    />

                    <div className="controls-hint">
                        WASD move · B bag · L quests · ESC close · Click mob/NPC/loot
                    </div>
                </div>
            </div>
        );
    }

    return null;
}