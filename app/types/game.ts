// app/types/game.ts
// TypeScript types mirroring the Python game models exactly.

export type Faction = "Alliance" | "Horde";

export type RaceName =
    | "Human"
    | "Dwarf"
    | "Night Elf"
    | "Gnome"
    | "Orc"
    | "Tauren"
    | "Troll"
    | "Undead";

export type ClassName =
    | "Hunter"
    | "Mage"
    | "Druid"
    | "Paladin"
    | "Priest"
    | "Rogue"
    | "Shaman"
    | "Warlock"
    | "Warrior";

export type RoleName = "Tank" | "Healer" | "Melee DPS" | "Ranged DPS";

export type ArmorTypeName =
    | "Cloth"
    | "Leather"
    | "Mail"
    | "Plate"
    | "Shield";

export type ResourceTypeName = "Health" | "Mana" | "Rage" | "Energy";

export type MobStateName =
    | "idle"
    | "patrol"
    | "chase"
    | "attack"
    | "return_to_spawn"
    | "dead";

/** Classification of placeable objects on the world map. */
export type MapObjectTypeName =
    | "item"
    | "resource_node"
    | "npc"
    | "interactable";

/** How a player engages with a map object. */
export type InteractionTypeName =
    | "loot"
    | "gather"
    | "talk"
    | "activate";

/** A class available during character creation. */
export interface ClassInfo {
    type: ClassName;
    description: string;
    roles: RoleName[];
    armor_types: ArmorTypeName[];
    weapon_types: string[];
    talent_trees: [string, string, string];
    resource_types: ResourceTypeName[];
}

/** A race with its available classes. */
export interface RaceInfo {
    name: RaceName;
    classes: ClassInfo[];
}

/** Zone boundary rectangle. */
export interface ZoneBounds {
    min_x: number;
    min_y: number;
    max_x: number;
    max_y: number;
}

/** Zone metadata from the server. */
export interface ZoneInfo {
    zone_id: string;
    name: string;
    bounds: ZoneBounds;
}

/** Full class data payload from the server. */
export interface ClassDataPayload {
    factions: Record<Faction, RaceInfo[]>;
    zones: ZoneInfo[];
}

/** Resource pool state. */
export interface ResourceState {
    current: number;
    maximum: number;
}

/** Character creation response. */
export interface CharacterCreatedPayload {
    player_id: string;
    name: string;
    race: RaceName;
    class: ClassName;
    faction: Faction;
    level: number;
    health: ResourceState;
    resources: Record<string, ResourceState>;
    position: { x: number; y: number };
    zone_id: string;
    zone_name: string;
    zone_bounds: ZoneBounds;
}

/** A single entity in the world state snapshot. */
export interface WorldEntity {
    entity_id: string;
    name: string;
    level: number;
    health: ResourceState;
    position: { x: number; y: number };
    is_player: boolean;
    is_self: boolean;
    is_alive: boolean;
    race?: RaceName;
    class?: ClassName;
    faction?: Faction;
    mob_name?: string;
    mob_state?: MobStateName;
    mob_level?: number;
}

/** A non-mob object placed on the world map by the server. */
export interface MapObjectData {
    object_id: string;
    name: string;
    object_type: MapObjectTypeName;
    interaction_type: InteractionTypeName;
    position: { x: number; y: number };
    zone_id: string;
    interaction_range: number;
    active: boolean;
    metadata: Record<string, unknown>;
}

/** Periodic world state broadcast. */
export interface WorldStatePayload {
    zone_id: string;
    entities: WorldEntity[];
    map_objects: MapObjectData[];
    player_position: { x: number; y: number } | null;
    player_health: ResourceState | null;
}

/** Server response to an interaction attempt. */
export interface InteractResultPayload {
    success: boolean;
    object?: MapObjectData;
    reason?: string;
}

/** Damage event from the server. */
export interface DamagePayload {
    target_id: string;
    source_id: string;
    amount: number;
    remaining_health: number;
}

/** Death event from the server. */
export interface DeathPayload {
    entity_id: string;
    killer_id: string;
    x: number;
    y: number;
}

/** Spawn event from the server. */
export interface SpawnPayload {
    entity_id: string;
    name: string;
    x: number;
    y: number;
    zone_id: string;
}

/** Generic WebSocket message envelope. */
export interface WSMessage<T = Record<string, unknown>> {
    type: string;
    payload: T;
}