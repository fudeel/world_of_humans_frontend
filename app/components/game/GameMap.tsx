// app/components/game/GameMap.tsx
// Real-world Leaflet map rendering OpenStreetMap tiles with game
// entities and map objects placed at geographic positions.
//
// IMPORTANT: Load with next/dynamic({ ssr: false }) because
// Leaflet accesses `window`.

"use client";

import { useEffect } from "react";
import type { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { MapObjectData, WorldEntity } from "@/app/types/game";
import type { PlayerState } from "@/app/hooks/useGameState";
import { worldToGeo, GEO_CENTER } from "@/app/lib/coordinates";
import MapFollower from "./MapFollower";
import MapObjectMapMarker from "./MapObjectMapMarker";
import EntityMapMarker from "@/app/components/game/EntityMarker";

interface GameMapProps {
    player: PlayerState;
    entities: WorldEntity[];
    mapObjects: MapObjectData[];
    selectedId: string | null;
    selectedObjectId: string | null;
    onSelectEntity: (id: string | null) => void;
    onSelectObject: (id: string | null) => void;
}

/** Euclidean distance between two 2D points in world space. */
function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Forces Leaflet to recalculate container dimensions after mount.
 */
function MapResizer() {
    const map = useMap();

    useEffect(() => {
        const timers = [50, 150, 400, 1000].map((ms) =>
            setTimeout(() => map.invalidateSize(), ms),
        );
        const container = map.getContainer();
        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });
        observer.observe(container);

        return () => {
            timers.forEach(clearTimeout);
            observer.disconnect();
        };
    }, [map]);

    return null;
}

const MAP_CENTER: LatLngTuple = [GEO_CENTER.lat, GEO_CENTER.lng];

export default function GameMap({
                                    player,
                                    entities,
                                    mapObjects,
                                    selectedId,
                                    selectedObjectId,
                                    onSelectEntity,
                                    onSelectObject,
                                }: GameMapProps) {
    const playerGeo = worldToGeo(player.position.x, player.position.y);

    return (
        <div className="game-map">
            <MapContainer
                center={MAP_CENTER}
                zoom={17}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                keyboard={false}
                style={{ width: "100vw", height: "100vh" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapResizer />
                <MapFollower lat={playerGeo[0]} lng={playerGeo[1]} />

                {/* Map objects (items, nodes, NPCs, chests) */}
                {mapObjects.map((obj) => (
                    <MapObjectMapMarker
                        key={obj.object_id}
                        object={obj}
                        selected={selectedObjectId === obj.object_id}
                        inRange={dist(player.position, obj.position) <= obj.interaction_range}
                        onClick={() => {
                            onSelectEntity(null);
                            onSelectObject(
                                selectedObjectId === obj.object_id ? null : obj.object_id,
                            );
                        }}
                    />
                ))}

                {/* Living entities (player, mobs, other players) */}
                {entities.map((entity) => (
                    <EntityMapMarker
                        key={entity.entity_id}
                        entity={entity}
                        selected={selectedId === entity.entity_id}
                        onClick={() => {
                            onSelectObject(null);
                            onSelectEntity(
                                selectedId === entity.entity_id ? null : entity.entity_id,
                            );
                        }}
                    />
                ))}
            </MapContainer>
        </div>
    );
}