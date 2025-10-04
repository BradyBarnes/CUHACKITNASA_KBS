import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ImpactParameters, MapMarker } from '@/types';

// Fix for default markers in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  impactParams: ImpactParameters;
  markers: MapMarker[];
  onLocationChange?: (lat: number, lng: number) => void;
}

// Component to handle map events and updates
const MapEventHandler: React.FC<{
  onLocationChange?: (lat: number, lng: number) => void;
  impactParams: ImpactParameters;
}> = ({ onLocationChange, impactParams }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationChange?.(lat, lng);
    };

    map.on('click', handleClick);
    
    // Update map center when impact parameters change
    map.setView([impactParams.impactLat, impactParams.impactLon], map.getZoom());

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationChange, impactParams.impactLat, impactParams.impactLon]);

  return null;
};

// Layer control component
const LayerControl: React.FC<{
  onLayerChange: (layer: string) => void;
  activeLayer: string;
}> = ({ onLayerChange, activeLayer }) => {
  const layers = [
    { id: 'osm', name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { id: 'terrain', name: 'Terrain', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}' },
    { id: 'usgs', name: 'USGS Topo', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}' },
  ];

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-lg p-3">
      <h4 className="text-white text-sm font-medium mb-2">Map Layer</h4>
      <div className="space-y-1">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onLayerChange(layer.id)}
            className={`block w-full text-left px-3 py-1 text-xs rounded transition-colors ${
              activeLayer === layer.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            {layer.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const MapView: React.FC<MapViewProps> = ({ impactParams, markers, onLocationChange }) => {
  const [activeLayer, setActiveLayer] = useState('osm');
  const [showHillshade, setShowHillshade] = useState(false);

  const layers = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    usgs: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}',
  };

  const hillshadeUrl = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/tile/{z}/{y}/{x}';

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[impactParams.impactLat, impactParams.impactLon]}
        zoom={6}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        {/* Base map layer */}
        <TileLayer
          url={layers[activeLayer as keyof typeof layers]}
          attribution={
            activeLayer === 'osm' 
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              : activeLayer === 'usgs'
              ? '&copy; <a href="https://www.usgs.gov/">USGS</a>'
              : '&copy; <a href="https://www.esri.com/">Esri</a>'
          }
          maxZoom={19}
        />

        {/* Optional hillshade overlay */}
        {showHillshade && (
          <TileLayer
            url={hillshadeUrl}
            attribution='&copy; <a href="https://www.usgs.gov/">USGS</a>'
            opacity={0.3}
            maxZoom={15}
          />
        )}

        {/* Impact markers */}
        {markers.map((marker, index) => (
          <Circle
            key={index}
            center={[marker.lat, marker.lng]}
            radius={marker.radius || 1000}
            pathOptions={{
              color: marker.type === 'impact' ? '#ff6b6b' : '#4ade80',
              fillColor: marker.type === 'impact' ? '#ff6b6b' : '#4ade80',
              fillOpacity: 0.2,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{marker.label || 'Impact Zone'}</strong>
                <br />
                <span className="text-gray-600">
                  Radius: {marker.radius ? (marker.radius / 1000).toFixed(1) : '1.0'} km
                </span>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Event handler */}
        <MapEventHandler
          onLocationChange={onLocationChange}
          impactParams={impactParams}
        />
      </MapContainer>

      {/* Layer control */}
      <LayerControl onLayerChange={setActiveLayer} activeLayer={activeLayer} />

      {/* Hillshade toggle */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-lg p-3">
        <label className="flex items-center space-x-2 text-white text-sm">
          <input
            type="checkbox"
            checked={showHillshade}
            onChange={(e) => setShowHillshade(e.target.checked)}
            className="rounded"
          />
          <span>USGS Hillshade</span>
        </label>
      </div>

      {/* Click instruction */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Click map to set impact location</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
