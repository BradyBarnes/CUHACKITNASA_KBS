import React from 'react';
import { ImpactResults, DeflectionResults } from '@/types';
import { formatLargeNumber, formatScientific, unitConversions } from '@/lib/physics';

interface ResultsViewProps {
  impactResults: ImpactResults | null;
  deflectionResults: DeflectionResults | null;
  className?: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
  impactResults, 
  deflectionResults, 
  className = '' 
}) => {
  if (!impactResults) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-medium text-gray-400 mb-2">No Impact Calculated</h3>
          <p className="text-sm text-gray-500">
            Configure impact parameters to see results
          </p>
        </div>
      </div>
    );
  }

  const {
    mass,
    kineticEnergy,
    tntEquivalent,
    craterDiameter,
    shockwaveRadius,
  } = impactResults;

  // Format numbers for display
  const formatEnergy = (energy: number) => {
    if (energy >= 1e15) {
      return formatScientific(energy, 2) + ' J';
    }
    return formatLargeNumber(energy, 0) + ' J';
  };

  const formatTnt = (tnt: number) => {
    if (tnt >= 1) {
      return formatLargeNumber(tnt, 2) + ' Mt TNT';
    } else if (tnt >= 0.001) {
      return (tnt * 1000).toFixed(1) + ' kt TNT';
    } else {
      return (tnt * 1000000).toFixed(0) + ' t TNT';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Impact Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-400 flex items-center">
            💥 Impact Analysis
          </h3>
          <div className="text-xs text-gray-400">
            Calculated in real-time
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mass */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Mass</div>
            <div className="text-2xl font-bold text-white">
              {formatLargeNumber(mass, 1)} kg
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {unitConversions.kilogramsToTons(mass).toFixed(0)} tons
            </div>
          </div>

          {/* Kinetic Energy */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Kinetic Energy</div>
            <div className="text-2xl font-bold text-yellow-400">
              {formatEnergy(kineticEnergy)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatScientific(kineticEnergy, 2)} J
            </div>
          </div>

          {/* TNT Equivalent */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">TNT Equivalent</div>
            <div className="text-2xl font-bold text-orange-400">
              {formatTnt(tntEquivalent)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Explosive yield
            </div>
          </div>

          {/* Crater Diameter */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Crater Diameter</div>
            <div className="text-2xl font-bold text-red-400">
              {formatLargeNumber(craterDiameter, 1)} m
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {unitConversions.metersToKilometers(craterDiameter).toFixed(2)} km
            </div>
          </div>
        </div>

        {/* Shockwave Radius */}
        <div className="mt-4 bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Shockwave Radius</div>
          <div className="text-xl font-bold text-purple-400">
            {formatLargeNumber(shockwaveRadius, 1)} m
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {unitConversions.metersToKilometers(shockwaveRadius).toFixed(2)} km radius
          </div>
        </div>
      </div>

      {/* Deflection Results */}
      {deflectionResults && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-400 flex items-center">
              🚀 Deflection Mission
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              deflectionResults.isSaved 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {deflectionResults.isSaved ? 'EARTH SAVED' : 'IMPACT INEVITABLE'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Miss Distance */}
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Miss Distance</div>
              <div className="text-2xl font-bold text-blue-400">
                {formatLargeNumber(deflectionResults.missDistance, 1)} m
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {unitConversions.metersToKilometers(deflectionResults.missDistance).toFixed(2)} km
              </div>
            </div>

            {/* Earth Radius */}
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Earth Radius</div>
              <div className="text-2xl font-bold text-gray-400">
                {formatLargeNumber(deflectionResults.earthRadius, 0)} m
              </div>
              <div className="text-xs text-gray-500 mt-1">
                6,371 km
              </div>
            </div>

            {/* Safety Margin */}
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Safety Margin</div>
              <div className={`text-2xl font-bold ${
                deflectionResults.isSaved ? 'text-green-400' : 'text-red-400'
              }`}>
                {deflectionResults.isSaved ? '+' : '-'}
                {formatLargeNumber(
                  Math.abs(deflectionResults.missDistance - deflectionResults.earthRadius), 
                  1
                )} m
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {deflectionResults.isSaved ? 'Clear miss' : 'Still impacts'}
              </div>
            </div>
          </div>

          {/* Deflection Analysis */}
          <div className="mt-4 p-4 bg-black/20 rounded-lg">
            <h4 className="text-md font-medium text-white mb-2">Mission Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Required Δv:</span>
                <span className="text-white">
                  {(deflectionResults.earthRadius / deflectionResults.missDistance).toFixed(2)}x current
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mission Status:</span>
                <span className={deflectionResults.isSaved ? 'text-green-400' : 'text-red-400'}>
                  {deflectionResults.isSaved ? 'Success' : 'Failure'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recommendation:</span>
                <span className="text-white">
                  {deflectionResults.isSaved 
                    ? 'Proceed with mission' 
                    : 'Increase Δv or extend timeline'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Scale Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">
          📊 Impact Scale Comparison
        </h3>
        
        <div className="space-y-3">
          {/* Historical Comparisons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="font-medium text-white mb-1">Tunguska Event (1908)</div>
              <div className="text-gray-400">~10-15 Mt TNT</div>
              <div className="text-xs text-gray-500">Flattened 2,000 km² of forest</div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3">
              <div className="font-medium text-white mb-1">Chicxulub Impact (65M BC)</div>
              <div className="text-gray-400">~100,000 Mt TNT</div>
              <div className="text-xs text-gray-500">Extinction event</div>
            </div>
          </div>

          {/* Current Impact Scale */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-500/30">
            <div className="font-medium text-white mb-1">Current Simulation</div>
            <div className="text-lg font-bold text-red-400">{formatTnt(tntEquivalent)}</div>
            <div className="text-xs text-gray-300 mt-1">
              {tntEquivalent > 1000 ? 'Global catastrophe' :
               tntEquivalent > 100 ? 'Regional devastation' :
               tntEquivalent > 10 ? 'Major city destruction' :
               tntEquivalent > 1 ? 'Significant local damage' :
               'Limited local impact'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
