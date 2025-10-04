# Impactor 2025 🚀

A comprehensive asteroid impact simulator that integrates real NASA Near-Earth Object (NEO) data with advanced physics calculations and interactive 3D visualizations.

## Features

### 🌍 Real NASA Data Integration
- Fetch actual asteroid data from NASA's NEO API
- Browse asteroids with pagination
- Server-side caching for optimal performance
- 5-minute cache TTL for rate limit compliance

### 💥 Advanced Impact Physics
- Mass calculation from diameter and density
- Kinetic energy computation (½mv²)
- TNT equivalent conversion
- Crater diameter estimation using simplified scaling laws
- Shockwave radius approximation
- Real-time calculation updates

### 🗺️ Interactive Mapping
- Leaflet-based 2D map with multiple basemaps
- USGS terrain and hillshade layers
- OpenStreetMap fallback
- Click-to-set impact location
- Visual impact zones with radius circles

### 🌌 3D Orbit Visualization
- Three.js-powered 3D rendering
- Earth and asteroid models
- Trajectory visualization
- Atmospheric effects
- Real-time animation

### 🚀 Deflection Mission Calculator
- Delta-v slider (0-100 m/s)
- Time-to-impact control (1-365 days)
- Miss distance calculation
- Earth safety analysis
- Mission success/failure indicators

### 🎨 Modern UI/UX
- Responsive design with dark theme
- Tabbed interface (Map, Orbit, Results)
- Real-time parameter updates
- Loading states and error handling
- Tooltips and help text
- Type-safe TypeScript implementation

## Tech Stack

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Axios** for NASA API integration
- **In-memory caching** with TTL
- **CORS** support for development

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Leaflet** for 2D mapping
- **Three.js** for 3D visualization
- **Custom CSS** with modern design

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- NASA API key (free at [api.nasa.gov](https://api.nasa.gov/))

### Installation

1. **Clone and setup**
   ```bash
   cd impactor-2025
   npm run install:all
   ```

2. **Configure environment**
   ```bash
   cp server/env.example server/.env
   ```
   
   Edit `server/.env` and add your NASA API key:
   ```
   NASA_API_KEY=your_nasa_api_key_here
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both backend (port 3001) and frontend (port 5173) concurrently.

### Available Scripts

- `npm run dev` - Start both server and client in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend client
- `npm run build` - Build both server and client for production
- `npm run start` - Start the production server
- `npm run install:all` - Install dependencies for all packages

## Usage Guide

### 1. Fetch Real Asteroid Data
- Enter a NASA asteroid ID (e.g., `2000433` for Apophis)
- Click "Fetch" to load real diameter and velocity data
- Parameters are automatically populated

### 2. Custom Impact Simulation
- Adjust diameter (1-10,000m)
- Set velocity (1-100 km/s)
- Configure entry angle (0-90°)
- Set material density (1,000-8,000 kg/m³)
- Click on map to set impact location

### 3. View Results
- **Map Tab**: See impact location and shockwave radius
- **Orbit Tab**: 3D visualization of approach trajectory
- **Results Tab**: Detailed impact analysis and deflection calculations

### 4. Deflection Mission Planning
- Adjust delta-v (0-100 m/s)
- Set time to impact (1-365 days)
- Monitor miss distance vs Earth radius
- See mission success/failure status

## Physics Formulas

### Mass Calculation
```
m = (4/3) × π × (d/2)³ × ρ
```
Where: d = diameter (m), ρ = density (kg/m³)

### Kinetic Energy
```
KE = ½ × m × v²
```
Where: m = mass (kg), v = velocity (m/s)

### TNT Equivalent
```
TNT = Energy / (4.184 × 10¹⁵ J/Mt)
```

### Crater Diameter (Simplified)
```
D_crater = D_impactor × 20 × (v_vertical/11)^0.4
```

### Shockwave Radius
```
R_shock = (Energy_Mt)^0.33 × 1000 m
```

### Deflection Miss Distance
```
Miss = Δv × time
```

## API Endpoints

### Backend API (Port 3001)

- `GET /health` - Health check
- `GET /api/neo/:id` - Get asteroid by ID
- `GET /api/neo/browse?page=0&size=20` - Browse asteroids

### Example API Usage
```javascript
// Fetch asteroid data
const response = await fetch('http://localhost:3001/api/neo/2000433');
const data = await response.json();
```

## Project Structure

```
impactor-2025/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Physics calculations
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # API utilities
│   │   └── App.tsx        # Main app component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # NASA API service
│   │   ├── middleware/    # Error handling
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root package.json
└── README.md
```

## Development

### Adding New Features
1. Backend: Add routes in `server/src/routes/`
2. Frontend: Add components in `client/src/components/`
3. Physics: Extend `client/src/lib/physics.ts`
4. Types: Update `client/src/types/index.ts`

### Environment Variables
```bash
# Server (.env)
NASA_API_KEY=your_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Caching Strategy
- NASA API responses cached for 5 minutes
- In-memory storage with automatic cleanup
- Cache keys based on endpoint and parameters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **NASA** for providing the NEO API
- **OpenStreetMap** for map tiles
- **USGS** for terrain data
- **Three.js** and **Leaflet** communities

## Support

For issues or questions:
1. Check the [NASA API documentation](https://api.nasa.gov/)
2. Review the physics formulas in `src/lib/physics.ts`
3. Check browser console for errors
4. Ensure NASA API key is valid

---

**Built with ❤️ for asteroid impact simulation and planetary defense research**
