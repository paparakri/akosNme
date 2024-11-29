import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix for default markers in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker with hover effect and club details
const CustomMarker = ({ position, popup, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) return;

    const marker = markerRef.current;
    if (isActive || isHovered) {
      marker.openPopup();
    } else {
      marker.closePopup();
    }
  }, [isActive, isHovered]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: onClick
      }}
    >
      <Popup>
        <div className="min-w-[200px] p-2">
          <h3 className="text-lg font-semibold">{popup.title}</h3>
          {popup.rating && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span>{popup.rating}</span>
              <span className="text-gray-500">
                ({popup.reviewCount} reviews)
              </span>
            </div>
          )}
          {popup.address && (
            <p className="mt-1 text-sm text-gray-600">{popup.address}</p>
          )}
          <button
            onClick={onClick}
            className="mt-2 w-full rounded bg-orange-500 px-3 py-1 text-sm text-white transition-colors hover:bg-orange-600"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

// Component to handle map center updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

// Main Map component
const Map = ({
  center = [37.97914, 23.72754], // Default to Athens
  zoom = 13,
  markers = [],
  selectedMarkerId = null,
  onMarkerClick,
  className = ''
}) => {
  const [map, setMap] = useState(null);
  const [activeMarkerId, setActiveMarkerId] = useState(selectedMarkerId);

  useEffect(() => {
    setActiveMarkerId(selectedMarkerId);
  }, [selectedMarkerId]);

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-lg ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            return L.divIcon({
              html: `<div class="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                ${cluster.getChildCount()}
              </div>`,
              className: 'custom-marker-cluster',
              iconSize: L.point(40, 40)
            });
          }}
        >
          {markers.map((marker) => (
            <CustomMarker
              key={marker.id}
              position={marker.position}
              popup={{
                title: marker.title,
                rating: marker.rating,
                reviewCount: marker.reviewCount,
                address: marker.address
              }}
              isActive={marker.id === activeMarkerId}
              onClick={() => {
                setActiveMarkerId(marker.id);
                onMarkerClick?.(marker.id);
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default Map;