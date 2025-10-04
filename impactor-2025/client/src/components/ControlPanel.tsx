import React, { useState } from 'react';
import { ImpactParameters, DeflectionParameters, NeoData, PHYSICS_CONSTANTS } from '@/types';
import { neoApi } from '@/utils/api';
import { calculateImpactResults, calculateDeflectionResults } from '@/lib/physics';

interface ControlPanelProps {
  impactParams: ImpactParameters;
  deflectionParams: DeflectionParameters;
  onImpactParamsChange: (params: ImpactParameters) => void;
  onDeflectionParamsChange: (params: DeflectionParameters) => void;
  onResultsChange: (results: any) => void;
  onDeflectionResultsChange: (results: any) => void;
  onLocationChange: (lat: number, lng: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  impactParams,
  deflectionParams,
  onImpactParamsChange,
  onDeflectionParamsChange,
  onResultsChange,
  onDeflectionResultsChange,
  onLocationChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [asteroidId, setAsteroidId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle impact parameter changes
  const handleImpactParamChange = (field: keyof ImpactParameters, value: number) => {
    const newParams = { ...impactParams, [field]: value };
    onImpactParamsChange(newParams);
    
    // Recalculate results
    const results = calculateImpactResults(newParams);
    onResultsChange(results);
  };

  // Handle deflection parameter changes
  const handleDeflectionParamChange = (field: keyof DeflectionParameters, value: number) => {
    const newParams = { ...deflectionParams, [field]: value };
    onDeflectionParamsChange(newParams);
    
    // Recalculate deflection results
    const results = calculateDeflectionResults(newParams);
    onDeflectionResultsChange(results);
  };

  // Fetch asteroid data from NASA
  const handleFetchAsteroid = async () => {
    if (!asteroidId.trim()) {
      setError('Please enter an asteroid ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const asteroidData = await neoApi.getById(asteroidId);
      
      // Extract relevant data
      const diameter = asteroidData.estimated_diameter.meters.estimated_diameter_min;
      const velocity = parseFloat(
        asteroidData.close_approach_data[0]?.relative_velocity.kilometers_per_second || '11'
      );
      
      // Create new impact parameters
      const newParams: ImpactParameters = {
        diameter: diameter || 100, // Default 100m if not available
        velocity: velocity || 11, // Default 11 km/s
        entryAngle: impactParams.entryAngle, // Keep current angle
        density: PHYSICS_CONSTANTS.DEFAULT_DENSITY,
        impactLat: impactParams.impactLat, // Keep current location
        impactLon: impactParams.impactLon,
      };

      onImpactParamsChange(newParams);
      
      // Calculate results
      const results = calculateImpactResults(newParams);
      onResultsChange(results);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch asteroid data');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to default values
  const handleReset = () => {
    const defaultParams: ImpactParameters = {
      diameter: 100,
      velocity: 11,
      entryAngle: 45,
      density: PHYSICS_CONSTANTS.DEFAULT_DENSITY,
      impactLat: 40.7128,
      impactLon: -74.0060,
    };
    
    onImpactParamsChange(defaultParams);
    onLocationChange(defaultParams.impactLat, defaultParams.impactLon);
    
    const results = calculateImpactResults(defaultParams);
    onResultsChange(results);
    
    setAsteroidId('');
    setError(null);
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-blue-400 mb-2">Impact Simulator</h2>
          <p className="text-sm text-gray-400">Configure asteroid parameters</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Asteroid ID Input */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white">NASA Asteroid Data</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter asteroid ID (e.g., 2000433)"
              value={asteroidId}
              onChange={(e) => setAsteroidId(e.target.value)}
              className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={handleFetchAsteroid}
              disabled={isLoading || !asteroidId.trim()}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  Fetch
                </>
              ) : (
                'Fetch'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Get asteroid data from NASA's NEO database
          </p>
        </div>

        {/* Impact Parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Impact Parameters</h3>
          
          {/* Diameter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Diameter (m)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={impactParams.diameter}
              onChange={(e) => handleImpactParamChange('diameter', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Asteroid diameter in meters
            </p>
          </div>

          {/* Velocity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Velocity (km/s)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={impactParams.velocity}
              onChange={(e) => handleImpactParamChange('velocity', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Impact velocity in kilometers per second
            </p>
          </div>

          {/* Entry Angle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Entry Angle (°)
            </label>
            <input
              type="number"
              min="0"
              max="90"
              step="1"
              value={impactParams.entryAngle}
              onChange={(e) => handleImpactParamChange('entryAngle', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Angle of entry (0° = grazing, 90° = direct)
            </p>
          </div>

          {/* Density */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Density (kg/m³)
            </label>
            <input
              type="number"
              min="1000"
              max="8000"
              step="100"
              value={impactParams.density}
              onChange={(e) => handleImpactParamChange('density', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Asteroid material density
            </p>
          </div>

          {/* Impact Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                min="-90"
                max="90"
                step="0.0001"
                value={impactParams.impactLat}
                onChange={(e) => handleImpactParamChange('impactLat', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                min="-180"
                max="180"
                step="0.0001"
                value={impactParams.impactLon}
                onChange={(e) => handleImpactParamChange('impactLon', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Impact location coordinates
          </p>
        </div>

        {/* Deflection Parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Deflection Mission</h3>
          
          {/* Delta-V */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Δv (m/s)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={deflectionParams.deltaV}
              onChange={(e) => handleDeflectionParamChange('deltaV', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>{deflectionParams.deltaV} m/s</span>
              <span>100</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Velocity change imparted to asteroid
            </p>
          </div>

          {/* Time to Impact */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Time to Impact (days)
            </label>
            <input
              type="range"
              min="1"
              max="365"
              step="1"
              value={deflectionParams.timeToImpact}
              onChange={(e) => handleDeflectionParamChange('timeToImpact', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>{deflectionParams.timeToImpact} days</span>
              <span>365</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Time available for deflection mission
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="w-full btn-secondary py-2"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
