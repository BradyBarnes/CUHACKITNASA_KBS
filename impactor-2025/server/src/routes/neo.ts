import { Router, Request, Response } from 'express';
import { nasaApiService } from '../services/nasaApi';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/neo/:id - Get specific asteroid by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw createError('Asteroid ID is required', 400);
    }

    console.log(`🔍 Fetching asteroid data for ID: ${id}`);
    const neoData = await nasaApiService.getNeoById(id);

    res.json({
      success: true,
      data: neoData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching asteroid by ID:', error.message);
    throw error; // Let error handler middleware deal with it
  }
});

// GET /api/neo/browse - Browse asteroids with pagination
router.get('/browse', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 20;

    console.log(`📋 Browsing asteroids - page: ${page}, size: ${size}`);
    const browseData = await nasaApiService.browseNeos(page, size);

    res.json({
      success: true,
      data: browseData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error browsing asteroids:', error.message);
    throw error; // Let error handler middleware deal with it
  }
});

export { router as neoRoutes };
