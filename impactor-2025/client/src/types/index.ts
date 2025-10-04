// NASA NEO API Types
export interface NeoDiameter {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
}

export interface NeoEstimatedDiameter {
  meters: NeoDiameter;
  feet: NeoDiameter;
  kilometers: NeoDiameter;
  miles: NeoDiameter;
}

export interface NeoVelocity {
  kilometers_per_second: string;
  kilometers_per_hour: string;
  miles_per_hour: string;
}

export interface NeoDistance {
  astronomical: string;
  lunar: string;
  kilometers: string;
  miles: string;
}

export interface NeoCloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: NeoVelocity;
  miss_distance: NeoDistance;
  orbiting_body: string;
}

export interface NeoOrbitalData {
  orbit_id: string;
  orbit_determination_date: string;
  first_observation_date: string;
  last_observation_date: string;
  data_arc_in_days: number;
  observations_used: number;
  orbit_uncertainty: string;
  minimum_orbit_intersection: string;
  jupiter_tisserand_invariant: string;
  epoch_osculation: string;
  eccentricity: string;
  semi_major_axis: string;
  inclination: string;
  longitude_of_ascending_node: string;
  argument_of_periapsis: string;
  mean_anomaly: string;
  mean_motion: string;
  equinox: string;
  orbit_class: {
    orbit_class_type: string;
    orbit_class_description: string;
    orbit_class_range: string;
  };
}

export interface NeoData {
  links: {
    self: string;
  };
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: NeoEstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NeoCloseApproachData[];
  orbital_data: NeoOrbitalData;
  is_sentry_object: boolean;
}

export interface BrowseResponse {
  links: {
    next?: string;
    prev?: string;
    self: string;
  };
  page: {
    size: number;
    total_elements: number;
    total_pages: number;
    number: number;
  };
  near_earth_objects: NeoData[];
}

// Impact Simulation Types
export interface ImpactParameters {
  diameter: number; // meters
  velocity: number; // km/s
  entryAngle: number; // degrees
  density: number; // kg/m³
  impactLat: number; // latitude
  impactLon: number; // longitude
}

export interface ImpactResults {
  mass: number; // kg
  kineticEnergy: number; // J
  tntEquivalent: number; // Mt TNT
  craterDiameter: number; // meters
  shockwaveRadius: number; // meters
}

export interface DeflectionParameters {
  deltaV: number; // m/s
  timeToImpact: number; // days
}

export interface DeflectionResults {
  missDistance: number; // meters
  isSaved: boolean;
  earthRadius: number; // meters
}

// UI State Types
export type TabType = 'map' | 'orbit' | 'results';

export interface AppState {
  activeTab: TabType;
  isLoading: boolean;
  error: string | null;
  impactParams: ImpactParameters;
  impactResults: ImpactResults | null;
  deflectionParams: DeflectionParameters;
  deflectionResults: DeflectionResults | null;
  selectedAsteroid: NeoData | null;
}

// Map Types
export interface MapMarker {
  lat: number;
  lng: number;
  type: 'impact' | 'deflection';
  radius?: number;
  label?: string;
}

// Physics Constants
export const PHYSICS_CONSTANTS = {
  EARTH_RADIUS: 6371000, // meters
  TNT_ENERGY_DENSITY: 4.184e9, // J/kg
  DEFAULT_DENSITY: 3000, // kg/m³
  PI: Math.PI,
} as const;
