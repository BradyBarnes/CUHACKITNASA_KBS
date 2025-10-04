import { ImpactParameters, ImpactResults, DeflectionParameters, DeflectionResults, PHYSICS_CONSTANTS } from '@/types';

/**
 * Physics calculation utilities for asteroid impact simulation
 * All functions include clear documentation with units and formulas
 */

/**
 * Calculate mass from diameter and density
 * @param diameter - Diameter in meters
 * @param density - Density in kg/m³
 * @returns Mass in kg
 * Formula: m = (4/3) * π * (d/2)³ * ρ
 */
export function calculateMass(diameter: number, density: number): number {
  const radius = diameter / 2; // meters
  const volume = (4 / 3) * PHYSICS_CONSTANTS.PI * Math.pow(radius, 3); // m³
  return volume * density; // kg
}

/**
 * Calculate kinetic energy from mass and velocity
 * @param mass - Mass in kg
 * @param velocity - Velocity in km/s
 * @returns Kinetic energy in Joules
 * Formula: KE = ½ * m * v²
 */
export function calculateKineticEnergy(mass: number, velocity: number): number {
  const velocityMs = velocity * 1000; // Convert km/s to m/s
  return 0.5 * mass * Math.pow(velocityMs, 2); // J
}

/**
 * Convert energy to TNT equivalent
 * @param energy - Energy in Joules
 * @returns TNT equivalent in Megatons
 * Formula: TNT = Energy / (4.184 × 10¹⁵ J/Mt)
 */
export function calculateTntEquivalent(energy: number): number {
  const megatonJoules = 4.184e15; // Joules per Megaton of TNT
  return energy / megatonJoules; // Mt TNT
}

/**
 * Estimate crater diameter using simplified scaling law
 * @param diameter - Impact object diameter in meters
 * @param velocity - Impact velocity in km/s
 * @param entryAngle - Entry angle in degrees
 * @returns Estimated crater diameter in meters
 * Formula: Simplified pi-scaling approximation
 * Note: This is a simplified model for educational purposes
 */
export function estimateCraterDiameter(
  diameter: number,
  velocity: number,
  entryAngle: number
): number {
  // Convert angle to radians and calculate vertical component
  const angleRad = (entryAngle * PHYSICS_CONSTANTS.PI) / 180;
  const verticalVelocity = velocity * Math.sin(angleRad); // km/s

  // Simplified scaling: crater diameter scales with impactor diameter and velocity
  // This is a basic approximation - real crater formation is much more complex
  const scalingFactor = Math.pow(verticalVelocity / 11, 0.4); // 11 km/s reference velocity
  const craterDiameter = diameter * 20 * scalingFactor; // Basic scaling factor

  // Ensure minimum crater size
  return Math.max(craterDiameter, diameter * 5);
}

/**
 * Calculate shockwave radius approximation
 * @param energy - Impact energy in Joules
 * @returns Shockwave radius in meters
 * Formula: Simplified blast radius approximation
 */
export function calculateShockwaveRadius(energy: number): number {
  // Simplified blast radius calculation
  // Real shockwave propagation depends on atmospheric conditions, terrain, etc.
  const energyMegatons = calculateTntEquivalent(energy);
  
  // Approximate blast radius in meters for airburst
  // This is a simplified model based on nuclear weapon scaling laws
  const blastRadius = Math.pow(energyMegatons, 0.33) * 1000; // meters
  
  return Math.max(blastRadius, 100); // Minimum 100m radius
}

/**
 * Calculate complete impact results
 * @param params - Impact parameters
 * @returns Complete impact calculation results
 */
export function calculateImpactResults(params: ImpactParameters): ImpactResults {
  const mass = calculateMass(params.diameter, params.density);
  const kineticEnergy = calculateKineticEnergy(mass, params.velocity);
  const tntEquivalent = calculateTntEquivalent(kineticEnergy);
  const craterDiameter = estimateCraterDiameter(
    params.diameter,
    params.velocity,
    params.entryAngle
  );
  const shockwaveRadius = calculateShockwaveRadius(kineticEnergy);

  return {
    mass,
    kineticEnergy,
    tntEquivalent,
    craterDiameter,
    shockwaveRadius,
  };
}

/**
 * Calculate deflection miss distance
 * @param params - Deflection parameters
 * @returns Deflection calculation results
 * Formula: Miss distance = Δv × time
 */
export function calculateDeflectionResults(params: DeflectionParameters): DeflectionResults {
  // Convert time to seconds
  const timeSeconds = params.timeToImpact * 24 * 60 * 60; // days to seconds
  
  // Calculate miss distance in meters
  // This is a simplified calculation assuming constant acceleration
  const missDistance = params.deltaV * timeSeconds;
  
  // Earth radius for comparison
  const earthRadius = PHYSICS_CONSTANTS.EARTH_RADIUS;
  
  // Determine if Earth is "saved" (miss distance > Earth radius)
  const isSaved = missDistance > earthRadius;

  return {
    missDistance,
    isSaved,
    earthRadius,
  };
}

/**
 * Convert units for display
 */
export const unitConversions = {
  // Distance conversions
  metersToKilometers: (meters: number) => meters / 1000,
  metersToMiles: (meters: number) => meters * 0.000621371,
  
  // Energy conversions
  joulesToMegatons: (joules: number) => joules / (4.184e15),
  joulesToKilotons: (joules: number) => joules / (4.184e12),
  
  // Mass conversions
  kilogramsToTons: (kg: number) => kg / 1000,
  kilogramsToMegatons: (kg: number) => kg / 1e9,
  
  // Velocity conversions
  kmPerSecToMilesPerHour: (kmps: number) => kmps * 2236.94,
  kmPerSecToMilesPerSec: (kmps: number) => kmps * 0.621371,
} as const;

/**
 * Format large numbers for display
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`;
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  } else {
    return value.toFixed(decimals);
  }
}

/**
 * Format scientific notation for very large numbers
 */
export function formatScientific(value: number, decimals: number = 2): string {
  return value.toExponential(decimals);
}
