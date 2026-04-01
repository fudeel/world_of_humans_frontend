// app/hooks/useGameState.ts
// Central game state hook bridging the WebSocket client to React.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import wsClient from "@/app/lib/ws-client";
import type {
    CharacterCreatedPayload,
    ClassDataPayload,
    DamagePayload,
    DeathPayload,
    Faction,
    InteractResultPayload,
    MapObjectData,
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
    combatLog: CombatEvent[];
    error: string | null;
}

export function useGameState() {
    const [state, setState] = useState<GameState>({
        phase: "connecting",
        connected: false,
        classData: null,
        player: null,
        entities: [],
        mapObjects: [],
        combatLog: [],
        error: null,
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
                }));
                break;
            }

            case "s_world_state": {
                const data = msg.payload as unknown as WorldStatePayload;
                setState((prev) => {
                    const next = {
                        ...prev,
                        entities: data.entities,
                        mapObjects: data.map_objects ?? [],
                    };
                    if (prev.player && data.player_position) {
                        next.player = {
                            ...prev.player,
                            position: data.player_position,
                            health: data.player_health ?? prev.player.health,
                        };
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

    /** Request class data (for reconnections). */
    const requestClassData = useCallback(() => {
        wsClient.send("c_get_class_data");
    }, []);

    /** Create a character and enter the world. */
    const createCharacter = useCallback(
        (name: string, race: string, classType: string) => {
            wsClient.send("c_create_character", { name, race, class_type: classType });
        },
        []
    );

    /** Move the player to a world position. */
    const movePlayer = useCallback((x: number, y: number) => {
        wsClient.send("c_move", { x, y });
    }, []);

    /** Attack a target entity. */
    const attackTarget = useCallback((targetId: string) => {
        wsClient.send("c_attack", { target_id: targetId });
    }, []);

    /** Interact with a map object. */
    const interactWith = useCallback((objectId: string) => {
        wsClient.send("c_interact", { object_id: objectId });
    }, []);

    /** Dismiss the current error. */
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        requestClassData,
        createCharacter,
        movePlayer,
        attackTarget,
        interactWith,
        clearError,
    };
}