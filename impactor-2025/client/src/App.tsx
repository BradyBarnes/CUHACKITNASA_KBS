import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import ControlPanel from './components/ControlPanel';
import MapView from './components/MapView';
import OrbitView from './components/OrbitView';
import ResultsView from './components/ResultsView';
import { 
  ImpactParameters, 
  DeflectionParameters, 
  ImpactResults, 
  DeflectionResults, 
  TabType, 
  MapMarker,
  PHYSICS_CONSTANTS 
} from './types';
import { calculateImpactResults, calculateDeflectionResults } from './lib/physics';

const App: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Impact parameters
  const [impactParams, setImpactParams] = useState<ImpactParameters>({
    diameter: 100,
    velocity: 11,
    entryAngle: 45,
    density: PHYSICS_CONSTANTS.DEFAULT_DENSITY,
    impactLat: 40.7128, // New York City
    impactLon: -74.0060,
  });

  // Deflection parameters
  const [deflectionParams, setDeflectionParams] = useState<DeflectionParameters>({
    deltaV: 1,
    timeToImpact: 30,
  });

  // Results
  const [impactResults, setImpactResults] = useState<ImpactResults | null>(
    calculateImpactResults(impactParams)
  );
  const [deflectionResults, setDeflectionResults] = useState<DeflectionResults | null>(
    calculateDeflectionResults(deflectionParams)
  );

  // Map markers
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  // Event handlers
  const handleImpactParamsChange = useCallback((newParams: ImpactParameters) => {
    setImpactParams(newParams);
    setError(null);
  }, []);

  const handleDeflectionParamsChange = useCallback((newParams: DeflectionParameters) => {
    setDeflectionParams(newParams);
  }, []);

  const handleResultsChange = useCallback((results: ImpactResults) => {
    setImpactResults(results);
  }, []);

  const handleDeflectionResultsChange = useCallback((results: DeflectionResults) => {
    setDeflectionResults(results);
  }, []);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    const newParams = { ...impactParams, impactLat: lat, impactLon: lng };
    setImpactParams(newParams);
    
    // Update map markers
    const newMarkers: MapMarker[] = [];
    
    if (impactResults) {
      newMarkers.push({
        lat,
        lng,
        type: 'impact',
        radius: impactResults.shockwaveRadius,
        label: 'Impact Zone',
      });
    }
    
    setMapMarkers(newMarkers);
  }, [impactParams, impactResults]);

  // Tab configuration
  const tabs = [
    { id: 'map' as TabType, label: 'Map', icon: '🗺️' },
    { id: 'orbit' as TabType, label: 'Orbit', icon: '🌍' },
    { id: 'results' as TabType, label: 'Results', icon: '📊' },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Impactor 2025
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Asteroid Impact Simulator with NASA NEO Data
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="text-green-400 text-sm font-medium">
                    {isLoading ? 'Loading...' : 'Ready'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1">
              <ControlPanel
                impactParams={impactParams}
                deflectionParams={deflectionParams}
                onImpactParamsChange={handleImpactParamsChange}
                onDeflectionParamsChange={handleDeflectionParamsChange}
                onResultsChange={handleResultsChange}
                onDeflectionResultsChange={handleDeflectionResultsChange}
                onLocationChange={handleLocationChange}
              />
            </div>

            {/* Right Panel - Visualization */}
            <div className="lg:col-span-2">
              <div className="h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="tabs mb-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                  {activeTab === 'map' && (
                    <MapView
                      impactParams={impactParams}
                      markers={mapMarkers}
                      onLocationChange={handleLocationChange}
                    />
                  )}
                  
                  {activeTab === 'orbit' && (
                    <OrbitView
                      impactParams={impactParams}
                    />
                  )}
                  
                  {activeTab === 'results' && (
                    <div className="h-full overflow-y-auto p-6">
                      <ResultsView
                        impactResults={impactResults}
                        deflectionResults={deflectionResults}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-8">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                <span>Powered by </span>
                <a 
                  href="https://api.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  NASA NEO API
                </a>
              </div>
              
              <div className="flex items-center space-x-4">
                <span>Built with React, Three.js & Leaflet</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
