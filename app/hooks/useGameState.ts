// app/hooks/useGameState.ts
// Central game state hook bridging the WebSocket client to React.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import wsClient from "@/app/lib/ws-client";
import type {
    CharacterCreatedPayload,
    ClassDataPayload,
    CurrencyData,
    DamagePayload,
    DeathPayload,
    Faction,
    InteractResultPayload,
    InventoryData,
    LootDropData,
    LootResultPayload,
    MapObjectData,
    QuestAcceptedPayload,
    QuestEntryData,
    QuestLogData,
    QuestOfferedPayload,
    QuestTurnedInPayload,
    WSMessage,
    WorldEntity,
    WorldStatePayload,
    ZoneBounds,
} from "@/app/types/game";

/** Phases of the game lifecycle. */
export type GamePhase = "connecting" | "character_creation" | "playing";

export interface PlayerState {
    playerId: string;
    name: string;
    race: string;
    className: string;
    faction: Faction;
    level: number;
    health: { current: number; maximum: number };
    resources: Record<string, { current: number; maximum: number }>;
    position: { x: number; y: number };
    zoneId: string;
    zoneName: string;
    zoneBounds: ZoneBounds;
}

export interface CombatEvent {
    id: number;
    type: "damage" | "death";
    payload: DamagePayload | DeathPayload;
    timestamp: number;
}

export interface GameState {
    phase: GamePhase;
    connected: boolean;
    classData: ClassDataPayload | null;
    player: PlayerState | null;
    entities: WorldEntity[];
    mapObjects: MapObjectData[];
    lootDrops: LootDropData[];
    combatLog: CombatEvent[];
    inventory: InventoryData | null;
    currency: CurrencyData | null;
    questLog: QuestLogData | null;
    questOffer: QuestOfferedPayload | null;
    activeLootDrop: LootDropData | null;
    error: string | null;
    notification: string | null;
}

export function useGameState() {
    const [state, setState] = useState<GameState>({
        phase: "connecting",
        connected: false,
        classData: null,
        player: null,
        entities: [],
        mapObjects: [],
        lootDrops: [],
        combatLog: [],
        inventory: null,
        currency: null,
        questLog: null,
        questOffer: null,
        activeLootDrop: null,
        error: null,
        notification: null,
    });

    const eventIdRef = useRef(0);

    /** Handle all incoming WebSocket messages. */
    const handleMessage = useCallback((msg: WSMessage) => {
        switch (msg.type) {
            case "s_class_data": {
                const data = msg.payload as unknown as ClassDataPayload;
                setState((prev) => ({
                    ...prev,
                    phase: "character_creation",
                    classData: data,
                }));
                break;
            }

            case "s_character_created": {
                const data = msg.payload as unknown as CharacterCreatedPayload;
                setState((prev) => ({
                    ...prev,
                    phase: "playing",
                    player: {
                        playerId: data.player_id,
                        name: data.name,
                        race: data.race,
                        className: data.class,
                        faction: data.faction,
                        level: data.level,
                        health: data.health,
                        resources: data.resources,
                        position: data.position,
                        zoneId: data.zone_id,
                        zoneName: data.zone_name,
                        zoneBounds: data.zone_bounds,
                    },
                    inventory: data.inventory,
                    currency: data.currency,
                    questLog: data.quest_log,
                }));
                break;
            }

            case "s_world_state": {
                const data = msg.payload as unknown as WorldStatePayload;
                setState((prev) => {
                    const next: GameState = {
                        ...prev,
                        entities: data.entities,
                        mapObjects: data.map_objects ?? [],
                        lootDrops: data.loot_drops ?? [],
                    };
                    if (prev.player && data.player_position) {
                        next.player = {
                            ...prev.player,
                            position: data.player_position,
                            health: data.player_health ?? prev.player.health,
                        };
                    }
                    if (data.currency) {
                        next.currency = data.currency;
                    }
                    return next;
                });
                break;
            }

            case "s_damage_dealt": {
                const data = msg.payload as unknown as DamagePayload;
                setState((prev) => ({
                    ...prev,
                    combatLog: [
                        ...prev.combatLog.slice(-49),
                        {
                            id: ++eventIdRef.current,
                            type: "damage",
                            payload: data,
                            timestamp: Date.now(),
                        },
                    ],
                }));
                break;
            }

            case "s_entity_died": {
                const data = msg.payload as unknown as DeathPayload;
                setState((prev) => ({
                    ...prev,
                    combatLog: [
                        ...prev.combatLog.slice(-49),
                        {
                            id: ++eventIdRef.current,
                            type: "death",
                            payload: data,
                            timestamp: Date.now(),
                        },
                    ],
                }));
                break;
            }

            case "s_loot_result": {
                const data = msg.payload as unknown as LootResultPayload;
                setState((prev) => {
                    const next: GameState = { ...prev };
                    if (data.inventory) next.inventory = data.inventory;
                    if (data.currency) next.currency = data.currency;
                    if (data.drop) {
                        next.activeLootDrop = data.drop;
                    } else {
                        next.activeLootDrop = null;
                    }
                    if (!data.success && data.reason) {
                        next.error = data.reason;
                    }
                    if (data.success && data.item) {
                        next.notification = `Looted: ${data.item.name}`;
                    }
                    if (data.success && data.money_looted && data.money_looted > 0) {
                        next.notification = `Looted: ${data.money_looted} copper`;
                    }
                    return next;
                });
                break;
            }

            case "s_quest_offered": {
                const data = msg.payload as unknown as QuestOfferedPayload;
                setState((prev) => ({ ...prev, questOffer: data }));
                break;
            }

            case "s_quest_accepted": {
                const data = msg.payload as unknown as QuestAcceptedPayload;
                setState((prev) => ({
                    ...prev,
                    questLog: data.quest_log,
                    questOffer: null,
                    notification: `Quest accepted: ${data.quest.title}`,
                }));
                break;
            }

            case "s_quest_update": {
                const data = msg.payload as { quest_log: QuestLogData };
                setState((prev) => ({ ...prev, questLog: data.quest_log }));
                break;
            }

            case "s_quest_completed": {
                const data = msg.payload as { quest_id: string; quest_title: string };
                setState((prev) => ({
                    ...prev,
                    notification: `Quest complete: ${data.quest_title}!`,
                }));
                break;
            }

            case "s_quest_turned_in": {
                const data = msg.payload as unknown as QuestTurnedInPayload;
                setState((prev) => ({
                    ...prev,
                    questLog: data.quest_log,
                    inventory: data.inventory,
                    currency: data.currency,
                    notification: `Reward: ${data.reward.copper} copper`,
                }));
                break;
            }

            case "s_quest_log": {
                const data = msg.payload as { quest_log: QuestLogData };
                setState((prev) => ({ ...prev, questLog: data.quest_log }));
                break;
            }

            case "s_inventory_update": {
                const data = msg.payload as { inventory: InventoryData; currency: CurrencyData };
                setState((prev) => ({
                    ...prev,
                    inventory: data.inventory,
                    currency: data.currency,
                }));
                break;
            }

            case "s_interact_result": {
                const data = msg.payload as unknown as InteractResultPayload;
                if (!data.success && data.reason) {
                    setState((prev) => ({
                        ...prev,
                        error: data.reason ?? "Interaction failed.",
                    }));
                }
                break;
            }

            case "s_error": {
                const data = msg.payload as { message?: string };
                setState((prev) => ({
                    ...prev,
                    error: data.message ?? "Unknown error",
                }));
                break;
            }
        }
    }, []);

    /** Connect and request class data on mount. */
    useEffect(() => {
        wsClient.connect();
        const unsub = wsClient.subscribe(handleMessage);

        const checkConnection = setInterval(() => {
            setState((prev) => ({ ...prev, connected: wsClient.isConnected }));
            if (wsClient.isConnected) {
                wsClient.send("c_get_class_data");
                clearInterval(checkConnection);
            }
        }, 500);

        return () => {
            unsub();
            clearInterval(checkConnection);
        };
    }, [handleMessage]);

    const requestClassData = useCallback(() => {
        wsClient.send("c_get_class_data");
    }, []);

    const createCharacter = useCallback(
        (name: string, race: string, classType: string) => {
            wsClient.send("c_create_character", { name, race, class_type: classType });
        },
        []
    );

    const movePlayer = useCallback((x: number, y: number) => {
        wsClient.send("c_move", { x, y });
    }, []);

    const attackTarget = useCallback((targetId: string) => {
        wsClient.send("c_attack", { target_id: targetId });
    }, []);

    const interactWith = useCallback((objectId: string) => {
        wsClient.send("c_interact", { object_id: objectId });
    }, []);

    /** Interact with an NPC quest giver. */
    const interactNpc = useCallback((entityId: string) => {
        wsClient.send("c_interact_npc", { entity_id: entityId });
    }, []);

    /** Accept a quest by id. */
    const acceptQuest = useCallback((questId: string) => {
        wsClient.send("c_accept_quest", { quest_id: questId });
    }, []);

    /** Abandon a quest by id. */
    const abandonQuest = useCallback((questId: string) => {
        wsClient.send("c_abandon_quest", { quest_id: questId });
    }, []);

    /** Turn in a completed quest. */
    const turnInQuest = useCallback((questId: string) => {
        wsClient.send("c_turn_in_quest", { quest_id: questId });
    }, []);

    /** Pick up a specific item from a loot drop. */
    const lootItem = useCallback((dropId: string, itemId: string) => {
        wsClient.send("c_loot_item", { drop_id: dropId, item_id: itemId });
    }, []);

    /** Pick up money from a loot drop. */
    const lootMoney = useCallback((dropId: string) => {
        wsClient.send("c_loot_money", { drop_id: dropId });
    }, []);

    /** Open a loot drop window (client-side only). */
    const openLootDrop = useCallback((drop: LootDropData) => {
        setState((prev) => ({ ...prev, activeLootDrop: drop }));
    }, []);

    /** Close the loot window. */
    const closeLootDrop = useCallback(() => {
        setState((prev) => ({ ...prev, activeLootDrop: null }));
    }, []);

    /** Close the quest offer panel. */
    const closeQuestOffer = useCallback(() => {
        setState((prev) => ({ ...prev, questOffer: null }));
    }, []);

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    const clearNotification = useCallback(() => {
        setState((prev) => ({ ...prev, notification: null }));
    }, []);

    return {
        ...state,
        requestClassData,
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
    };
}