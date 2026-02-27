'use client';
import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import "./map.css";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the marker icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const tripLocations = [
    { id: 'chennai', name: 'Chennai', position: { lat: 13.0827, lng: 80.2707 } },
    { id: 'madurai', name: 'Madurai', position: { lat: 9.9252, lng: 78.1198 } },
    { id: 'coimbatore', name: 'Coimbatore', position: { lat: 11.0168, lng: 76.9558 } },
    { id: 'kanyakumari', name: 'Kanyakumari', position: { lat: 8.0883, lng: 77.5385 } }
];

// Component to add routing control to the map
const RoutingMachine = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: tripLocations.map(loc => L.latLng(loc.position.lat, loc.position.lng)),
            routeWhileDragging: false,
            lineOptions: {
                styles: [{ color: 'blue', opacity: 0.7, weight: 4 }]
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map]);

    return null;
};

const Map = () => {
    return (
        // Use the class from your CSS or an inline style
        <div className="map-container-wrapper" style={{ height: "100%", width: "100%" }}>
            <MapContainer
                center={tripLocations[0].position}
                zoom={7}
                scrollWheelZoom={true}
                className="MapContainer"
                style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Routing machine for road-based pathways */}
                <RoutingMachine />
                {/* Map over all locations to create markers */}
                {tripLocations.map(location => (
                    <Marker
                        key={location.id}
                        position={location.position}>
                        <Popup>
                            <strong>{location.name}</strong>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;