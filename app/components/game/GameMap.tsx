// app/components/game/GameMap.tsx
// Real-world Leaflet map replacing the SVG grid.  Renders OpenStreetMap
// tiles with entities and map objects placed at geographic positions
// converted from the backend's world-coordinate system.
//
// IMPORTANT: This component must be loaded with next/dynamic ssr:false
// because Leaflet accesses the browser's `window` object.

"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { MapObjectData, WorldEntity } from "@/app/types/game";
import type { PlayerState } from "@/app/hooks/useGameState";
import { worldToGeo, geoToWorld, GEO_CENTER } from "@/app/lib/coordinates";
import MapFollower from "./MapFollower";
import MapObjectMapMarker from "@/app/components/game/MapObjectMapMarker";
import EntityMapMarker from "@/app/components/game/EntityMarker";

interface GameMapProps {
    player: PlayerState;
    entities: WorldEntity[];
    mapObjects: MapObjectData[];
    selectedId: string | null;
    selectedObjectId: string | null;
    onMove: (x: number, y: number) => void;
    onSelectEntity: (id: string | null) => void;
    onSelectObject: (id: string | null) => void;
}

/** Euclidean distance between two 2D points in world space. */
function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/** Handles click-on-map-to-move by converting lat/lng back to world coords. */
function MapClickHandler({
                             onMove,
                             onDeselect,
                             bounds,
                         }: {
    onMove: (x: number, y: number) => void;
    onDeselect: () => void;
    bounds: PlayerState["zoneBounds"];
}) {
    useMapEvents({
        click(e) {
            const { x, y } = geoToWorld(e.latlng.lat, e.latlng.lng);
            if (
                x >= bounds.min_x && x <= bounds.max_x &&
                y >= bounds.min_y && y <= bounds.max_y
            ) {
                onDeselect();
                onMove(x, y);
            }
        },
    });
    return null;
}

export default function GameMap({
                                    player,
                                    entities,
                                    mapObjects,
                                    selectedId,
                                    selectedObjectId,
                                    onMove,
                                    onSelectEntity,
                                    onSelectObject,
                                }: GameMapProps) {
    const [playerLat, playerLng] = worldToGeo(
        player.position.x,
        player.position.y,
    );

    return (
        <div className="game-map">
            <MapContainer
                center={[GEO_CENTER.lat, GEO_CENTER.lng]}
                zoom={17}
                zoomControl={false}
                attributionControl={false}
                style={{ width: "100%", height: "100%" }}
            >
                {/* Real-world map tiles */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                {/* Keep camera on player */}
                <MapFollower lat={playerLat} lng={playerLng} />

                {/* Click to move */}
                <MapClickHandler
                    onMove={onMove}
                    onDeselect={() => {
                        onSelectEntity(null);
                        onSelectObject(null);
                    }}
                    bounds={player.zoneBounds}
                />

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