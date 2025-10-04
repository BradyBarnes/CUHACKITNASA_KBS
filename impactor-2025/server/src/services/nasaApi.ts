import axios, { AxiosResponse } from 'axios';
import { neoCache } from './cache';
import { createError } from '../middleware/errorHandler';

export interface NeoData {
  id: string;
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
    miss_distance: {
      kilometers: string;
    };
    orbiting_body: string;
  }>;
  orbital_data?: {
    orbit_class?: string;
    mean_motion?: string;
    eccentricity?: string;
    semi_major_axis?: string;
    inclination?: string;
    longitude_of_ascending_node?: string;
    argument_of_periapsis?: string;
    mean_anomaly?: string;
  };
}

export interface BrowseResponse {
  page: {
    size: number;
    total_elements: number;
    total_pages: number;
    number: number;
  };
  near_earth_objects: NeoData[];
}

class NasaApiService {
  private baseUrl = 'https://api.nasa.gov/neo/rest/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NASA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  NASA_API_KEY not found in environment variables');
    }
  }

  private getCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(endpoint, params);
      const cached = neoCache.get(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit for ${endpoint}`);
        return cached;
      }

      // Make API request
      const url = `${this.baseUrl}${endpoint}`;
      const requestParams = {
        ...params,
        api_key: this.apiKey
      };

      console.log(`🚀 NASA API request: ${endpoint}`);
      const response: AxiosResponse<T> = await axios.get(url, {
        params: requestParams,
        timeout: 10000 // 10 second timeout
      });

      // Cache successful response
      neoCache.set(cacheKey, response.data);
      console.log(`💾 Cached response for ${endpoint}`);

      return response.data;
    } catch (error: any) {
      console.error(`❌ NASA API error for ${endpoint}:`, error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error_message || error.response.data?.message || 'NASA API error';
        
        if (status === 403) {
          throw createError('NASA API key is invalid or rate limited', 403);
        } else if (status === 404) {
          throw createError('Asteroid not found', 404);
        } else if (status === 429) {
          throw createError('NASA API rate limit exceeded', 429);
        } else {
          throw createError(`NASA API error: ${message}`, status);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw createError('NASA API request timeout', 408);
      } else {
        throw createError('Failed to connect to NASA API', 503);
      }
    }
  }

  async getNeoById(id: string): Promise<NeoData> {
    if (!id || typeof id !== 'string') {
      throw createError('Invalid asteroid ID', 400);
    }

    const data = await this.makeRequest<NeoData>(`/neo/${id}`);
    return data;
  }

  async browseNeos(page: number = 0, size: number = 20): Promise<BrowseResponse> {
    if (page < 0) page = 0;
    if (size < 1 || size > 1000) size = 20;

    const data = await this.makeRequest<BrowseResponse>('/neo/browse', {
      page,
      size
    });

    return data;
  }
}

export const nasaApiService = new NasaApiService();
