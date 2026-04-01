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

export type MapObjectTypeName =
    | "item"
    | "resource_node"
    | "npc"
    | "interactable";

export type InteractionTypeName =
    | "loot"
    | "gather"
    | "talk"
    | "activate";

export type ItemTypeName = "weapon" | "armor" | "consumable" | "quest_item" | "junk";

export type ItemSlotName = "none" | "head" | "chest" | "legs" | "feet" | "hands" | "main_hand" | "off_hand";

export type QuestStatusName = "available" | "in_progress" | "completed" | "turned_in" | "failed";

/** A single item definition from the server. */
export interface ItemData {
    item_id: string;
    name: string;
    item_type: ItemTypeName;
    sell_value: number;
    slot: ItemSlotName;
    stat_bonuses: Record<string, number>;
    description: string;
    stackable: boolean;
    max_stack: number;
    level_req: number;
}

/** One occupied inventory slot. */
export interface InventorySlotData {
    item: ItemData;
    quantity: number;
}

/** Full inventory state from the server. */
export interface InventoryData {
    capacity: number;
    slots: (InventorySlotData | null)[];
}

/** Currency breakdown. */
export interface CurrencyData {
    total_copper: number;
    gold: number;
    silver: number;
    copper: number;
}

/** A single quest objective with progress. */
export interface QuestObjectiveProgress {
    objective_id: string;
    description: string;
    target_id: string;
    current_count: number;
    required_count: number;
    is_complete: boolean;
}

/** Quest reward info. */
export interface QuestRewardData {
    copper: number;
    experience: number;
    item_ids: string[];
}

/** A quest entry in the player's log. */
export interface QuestEntryData {
    quest_id: string;
    title: string;
    description: string;
    status: QuestStatusName;
    objectives: QuestObjectiveProgress[];
    reward: QuestRewardData;
}

/** Full quest log state from the server. */
export interface QuestLogData {
    max_quests: number;
    entries: QuestEntryData[];
}

/** Quest definition offered by an NPC. */
export interface QuestOfferData {
    quest_id: string;
    title: string;
    description: string;
    giver_entity_id: string;
    level_req: number;
    objectives: {
        objective_id: string;
        description: string;
        target_id: string;
        required_count: number;
    }[];
    reward: QuestRewardData;
    repeatable: boolean;
}

/** A loot drop on the ground. */
export interface LootDropData {
    drop_id: string;
    mob_id: string;
    position: { x: number; y: number };
    items: ItemData[];
    money: number;
    active: boolean;
}

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
    inventory: InventoryData;
    currency: CurrencyData;
    quest_log: QuestLogData;
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
    is_quest_giver?: boolean;
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
    loot_drops: LootDropData[];
    player_position: { x: number; y: number } | null;
    player_health: ResourceState | null;
    currency: CurrencyData;
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
    loot_drop?: LootDropData | null;
}

/** Spawn event from the server. */
export interface SpawnPayload {
    entity_id: string;
    name: string;
    x: number;
    y: number;
    zone_id: string;
}

/** Loot result from picking up an item or money. */
export interface LootResultPayload {
    success: boolean;
    reason?: string;
    item?: ItemData;
    money_looted?: number;
    inventory?: InventoryData;
    currency?: CurrencyData;
    drop?: LootDropData | null;
}

/** Quest offered by an NPC. */
export interface QuestOfferedPayload {
    npc_id: string;
    quests: QuestOfferData[];
}

/** Quest accepted response. */
export interface QuestAcceptedPayload {
    quest: QuestEntryData;
    quest_log: QuestLogData;
}

/** Quest turned in response. */
export interface QuestTurnedInPayload {
    quest_id: string;
    reward: QuestRewardData;
    quest_log: QuestLogData;
    inventory: InventoryData;
    currency: CurrencyData;
}

/** Generic WebSocket message envelope. */
export interface WSMessage<T = Record<string, unknown>> {
    type: string;
    payload: T;
}