'use client';
import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Popup, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './map.css';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, X, Clock, MapPin, Navigation, Route } from 'lucide-react';

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type Waypoint = {
  id?: string;
  lat: number;
  lng: number;
  name: string;
};

interface TripMapClientProps {
  waypoints: Waypoint[];
  embedded?: boolean;
  onWaypointsChange?: (newWaypoints: Waypoint[]) => void;
}

type TripLocation = {
    id: string;
    name: string;
    position: { lat: number; lng: number };
};

const OSRM_BASE = 'https://router.project-osrm.org';

type MatrixData = {
    durations: number[][];  // seconds, NxN
    distances: number[][];  // meters, NxN
};

type RouteGeometry = [number, number][]; // [lat, lng][]

type LegInfo = {
    from: string;
    to: string;
    distance: number; // meters
    time: number;     // seconds
};

// Fetch NxN distance/duration matrix in a single API call
async function fetchMatrix(locations: TripLocation[]): Promise<MatrixData | null> {
    if (locations.length < 2) return null;
    const coords = locations.map(l => `${l.position.lng},${l.position.lat}`).join(';');
    const url = `${OSRM_BASE}/table/v1/driving/${coords}?annotations=distance,duration`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code !== 'Ok') return null;
        return { durations: data.durations, distances: data.distances };
    } catch {
        return null;
    }
}

// Fetch actual road geometry for consecutive waypoints
async function fetchRouteGeometry(locations: TripLocation[]): Promise<RouteGeometry[]> {
    if (locations.length < 2) return [];
    const coords = locations.map(l => `${l.position.lng},${l.position.lat}`).join(';');
    const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes?.[0]) return [];
        const route = data.routes[0];
        // Split the full geometry into per-leg segments
        const legs = route.legs;
        const allCoords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number] // GeoJSON is [lng,lat], Leaflet needs [lat,lng]
        );

        // Distribute coordinates across legs based on leg step counts
        if (legs.length === 1) return [allCoords];

        // Use waypoint indices to split — approximate by proportion of distance
        const totalDist = legs.reduce((sum: number, leg: any) => sum + leg.distance, 0);
        const segments: RouteGeometry[] = [];
        let startIdx = 0;

        for (let i = 0; i < legs.length; i++) {
            const proportion = legs[i].distance / totalDist;
            const pointCount = Math.max(2, Math.round(proportion * allCoords.length));
            const endIdx = i === legs.length - 1 ? allCoords.length : Math.min(startIdx + pointCount, allCoords.length);
            segments.push(allCoords.slice(startIdx, endIdx));
            startIdx = Math.max(startIdx, endIdx - 1); // overlap by 1 for continuity
        }
        return segments;
    } catch {
        return [];
    }
}

function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
}

function formatDistance(meters: number): string {
    return `${(meters / 1000).toFixed(1)} km`;
}

const routeColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const TripMapClient = ({ waypoints, embedded, onWaypointsChange }: TripMapClientProps) => {
    const initialLocationsFromProps = (): TripLocation[] => (waypoints || []).map((wp, index) => ({
      id: wp.id || `${wp.name}-${index}`, // Use name and index for a unique id if id is not provided
      name: wp.name,
      position: { lat: wp.lat, lng: wp.lng },
    }));

    const [locations, setLocations] = useState<TripLocation[]>(initialLocationsFromProps());

    // Keep it synced if parent updates the waypoints completely (e.g. from the locations page or hydration)
    useEffect(() => {
         const newLocs = initialLocationsFromProps();
         const currentIds = locations.map(l => l.id).join(',');
         const newIds = newLocs.map(l => l.id).join(',');
         if (currentIds !== newIds) {
              setLocations(newLocs);
         }
    }, [waypoints]);
    const [matrix, setMatrix] = useState<MatrixData | null>(null);
    const [routeSegments, setRouteSegments] = useState<RouteGeometry[]>([]);
    const [loading, setLoading] = useState(false);
    const fetchRef = useRef(0); // debounce / cancel stale requests

    // Fetch matrix + route geometry whenever locations change
    useEffect(() => {
        if (locations.length < 2) {
            setMatrix(null);
            setRouteSegments([]);
            return;
        }

        const id = ++fetchRef.current;
        setLoading(true);

        Promise.all([fetchMatrix(locations), fetchRouteGeometry(locations)]).then(
            ([matrixResult, geometries]) => {
                if (fetchRef.current !== id) return; // stale
                setMatrix(matrixResult);
                setRouteSegments(geometries);
                setLoading(false);
            }
        );
    }, [locations]);

    // Build leg info from matrix (consecutive stops: 0→1, 1→2, ...)
    const legs: LegInfo[] = [];
    let totalDistance = 0;
    let totalTime = 0;
    if (matrix && locations.length >= 2) {
        for (let i = 0; i < locations.length - 1; i++) {
            const d = matrix.distances[i][i + 1];
            const t = matrix.durations[i][i + 1];
            legs.push({ from: locations[i].name, to: locations[i + 1].name, distance: d, time: t });
            totalDistance += d;
            totalTime += t;
        }
    }

    // Full NxN matrix for display
    const matrixNames = locations.map(l => l.name);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(locations);
        const [reordered] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reordered);
        setLocations(items);
        if (onWaypointsChange) {
            onWaypointsChange(items.map(i => ({ id: i.id, lat: i.position.lat, lng: i.position.lng, name: i.name })));
        }
    };

    const removeLocation = (id: string) => {
        const newLocs = locations.filter(loc => loc.id !== id);
        setLocations(newLocs);
        if (onWaypointsChange) {
            onWaypointsChange(newLocs.map(i => ({ id: i.id, lat: i.position.lat, lng: i.position.lng, name: i.name })));
        }
    };

    return (
        <div className={`trip-map-page ${embedded ? 'embedded' : ''}`}>
            {/* Left Sidebar */}
            <aside className="trip-sidebar">
                <div className="sidebar-header">
                    <Navigation size={20} />
                    <h2>Trip Planner</h2>
                </div>

                <div className="sidebar-subheader">
                    <MapPin size={16} />
                    <span>{locations.length} destination{locations.length !== 1 ? 's' : ''}</span>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="destinations">
                        {(provided) => (
                            <ul
                                className="destination-list"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {locations.map((loc, index) => (
                                    <Draggable key={loc.id} draggableId={loc.id} index={index}>
                                        {(provided, snapshot) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`destination-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                            >
                                                <div className="destination-left">
                                                    <span className="drag-handle" {...provided.dragHandleProps}>
                                                        <GripVertical size={16} />
                                                    </span>
                                                    <span className="destination-index">{index + 1}</span>
                                                    <span className="destination-name">{loc.name}</span>
                                                </div>
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => removeLocation(loc.id)}
                                                    title={`Remove ${loc.name}`}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>

                {locations.length === 0 && (
                    <p className="empty-message">No destinations selected.</p>
                )}

                {/* ── Travel Summary ── */}
                <div className="travel-summary-section">
                    <div className="summary-title">
                        <Route size={18} />
                        <span>Travel Summary</span>
                        {loading && <span className="loading-dot">●</span>}
                    </div>

                    {legs.length > 0 ? (
                        <>
                            {/* Per-leg breakdown */}
                            <div className="leg-list">
                                {legs.map((leg, i) => (
                                    <div key={i} className="leg-card">
                                        <div className="leg-card-header">
                                            <span className="leg-color-dot" style={{ background: routeColors[i % routeColors.length] }} />
                                            <span className="leg-card-label">{leg.from} → {leg.to}</span>
                                        </div>
                                        <div className="leg-card-stats">
                                            <span>{formatDistance(leg.distance)}</span>
                                            <span className="leg-card-sep">•</span>
                                            <span><Clock size={12} /> {formatTime(leg.time)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="summary-totals">
                                <div className="summary-total-card">
                                    <span className="total-label">Total Distance</span>
                                    <span className="total-value">{formatDistance(totalDistance)}</span>
                                </div>
                                <div className="summary-total-card">
                                    <span className="total-label">Total Time</span>
                                    <span className="total-value">{formatTime(totalTime)}</span>
                                </div>
                            </div>

                            {/* NxN Distance Matrix */}
                            {matrix && locations.length >= 2 && (
                                <div className="matrix-section">
                                    <div className="matrix-title">Distance &amp; Time Matrix</div>
                                    <div className="matrix-scroll">
                                        <table className="matrix-table">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    {matrixNames.map((name, i) => (
                                                        <th key={i} title={name}>{name.slice(0, 4)}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {matrixNames.map((rowName, r) => (
                                                    <tr key={r}>
                                                        <td className="matrix-row-label" title={rowName}>{rowName.slice(0, 4)}</td>
                                                        {matrixNames.map((_, c) => (
                                                            <td key={c} className={r === c ? 'matrix-diag' : ''}>
                                                                {r === c ? '—' : (
                                                                    <div className="matrix-cell-inner">
                                                                        <span className="matrix-dist">{formatDistance(matrix.distances[r][c])}</span>
                                                                        <span className="matrix-time">{formatTime(matrix.durations[r][c])}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="summary-placeholder">
                            {locations.length < 2
                                ? 'Add at least 2 destinations to see route info.'
                                : loading ? 'Fetching route data…' : 'No route data available.'}
                        </p>
                    )}
                </div>
            </aside>

            {/* Map */}
            <div className="map-area">
                <MapContainer
                    center={locations.length > 0 ? locations[0].position : { lat: 20.5937, lng: 78.9629 }}
                    zoom={locations.length > 0 ? 7 : 5}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Road-following colored route lines */}
                    {routeSegments.map((seg, i) => (
                        <Polyline
                            key={`route-${i}-${locations.map(l => l.id).join(',')}`}
                            positions={seg}
                            pathOptions={{ color: routeColors[i % routeColors.length], weight: 5, opacity: 0.85 }}
                        />
                    ))}
                    {locations.map((location) => (
                        <Marker key={location.id} position={location.position}>
                            <Popup>
                                <strong>{location.name}</strong>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default TripMapClient;
