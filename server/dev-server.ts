/**
 * Local Development Server for AI Creative Studio
 * 
 * This server provides:
 * - Local file storage mimicking Supabase Storage bucket
 * - REST API for CRUD operations on brand profiles and assets
 * - Auto-creates brand folders in creatives/ directory
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Load environment variables
import 'dotenv/config';

const app = express();

// Get database path (resolve relative path to absolute)
const dbPath = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const absoluteDbPath = dbPath.startsWith('file:./') 
  ? `file:${path.resolve(process.cwd(), dbPath.replace('file:./', ''))}`
  : dbPath;

// Initialize Prisma with libsql adapter
const adapter = new PrismaLibSql({ url: absoluteDbPath });
const prisma = new PrismaClient({ adapter });

const PORT = process.env.LOCAL_SERVER_PORT || 3001;
const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './storage/creatives';

// Ensure storage directory exists
const storagePath = path.resolve(process.cwd(), STORAGE_PATH);
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from storage
app.use('/storage/creatives', express.static(storagePath));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const brandId = req.params.brandId || 'unknown';
    const brandPath = path.join(storagePath, brandId);
    
    // Auto-create brand folder if not exists
    if (!fs.existsSync(brandPath)) {
      fs.mkdirSync(brandPath, { recursive: true });
      console.log(`📁 Created folder for brand: ${brandId}`);
    }
    
    cb(null, brandPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${timestamp}_${random}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ============================================
// BRAND PROFILES API
// ============================================

// Get all profiles
app.get('/api/profiles', async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.brandProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(profiles.map(p => ({
      id: p.id,
      name: p.name,
      guidelines: p.guidelines,
      logo_preview: p.logoPreview
    })));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get single profile
app.get('/api/profiles/:id', async (req: Request, res: Response) => {
  try {
    const profile = await prisma.brandProfile.findUnique({
      where: { id: req.params.id }
    });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({
      id: profile.id,
      name: profile.name,
      guidelines: profile.guidelines,
      logo_preview: profile.logoPreview
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or Update profile (upsert)
app.post('/api/profiles', async (req: Request, res: Response) => {
  try {
    const { id, name, guidelines, logo_preview } = req.body;
    
    const profile = await prisma.brandProfile.upsert({
      where: { id: id || '' },
      update: {
        name,
        guidelines,
        logoPreview: logo_preview
      },
      create: {
        id,
        name,
        guidelines,
        logoPreview: logo_preview
      }
    });
    
    // Create brand folder in storage
    const brandPath = path.join(storagePath, profile.id);
    if (!fs.existsSync(brandPath)) {
      fs.mkdirSync(brandPath, { recursive: true });
      console.log(`📁 Created folder for brand: ${profile.id}`);
    }
    
    res.json({
      id: profile.id,
      name: profile.name,
      guidelines: profile.guidelines,
      logo_preview: profile.logoPreview
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Delete profile
app.delete('/api/profiles/:id', async (req: Request, res: Response) => {
  try {
    // Delete from database (cascade will delete assets)
    await prisma.brandProfile.delete({
      where: { id: req.params.id }
    });
    
    // Optionally delete brand folder (commented out for safety)
    // const brandPath = path.join(storagePath, req.params.id);
    // if (fs.existsSync(brandPath)) {
    //   fs.rmSync(brandPath, { recursive: true });
    // }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// ============================================
// ASSETS (GALLERY) API
// ============================================

// Get assets for a profile
app.get('/api/assets/:profileId', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const assets = await prisma.generatedAsset.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      skip: page * pageSize,
      take: pageSize
    });
    
    res.json(assets.map(a => ({
      id: a.id,
      url: a.url,
      prompt_used: a.promptUsed,
      aspect_ratio: a.aspectRatio
    })));
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Upload new asset (file upload)
app.post('/api/assets/:brandId/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { prompt_used, aspect_ratio } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Construct the URL for the uploaded file
    const fileUrl = `http://localhost:${PORT}/storage/creatives/${brandId}/${req.file.filename}`;
    
    // Save to database
    const asset = await prisma.generatedAsset.create({
      data: {
        profileId: brandId,
        url: fileUrl,
        promptUsed: prompt_used || '',
        aspectRatio: aspect_ratio || '1:1'
      }
    });
    
    res.json({
      id: asset.id,
      url: asset.url,
      prompt_used: asset.promptUsed,
      aspect_ratio: asset.aspectRatio
    });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Save asset from base64 data URL
app.post('/api/assets/:brandId/save', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { imageBase64, prompt_used, aspect_ratio } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Ensure brand folder exists
    const brandPath = path.join(storagePath, brandId);
    if (!fs.existsSync(brandPath)) {
      fs.mkdirSync(brandPath, { recursive: true });
      console.log(`📁 Created folder for brand: ${brandId}`);
    }
    
    // Extract base64 data
    const matches = imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }
    
    const ext = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    const filename = `${timestamp}_${random}.${ext}`;
    const filePath = path.join(brandPath, filename);
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    
    // Construct URL
    const fileUrl = `http://localhost:${PORT}/storage/creatives/${brandId}/${filename}`;
    
    // Save to database
    const asset = await prisma.generatedAsset.create({
      data: {
        profileId: brandId,
        url: fileUrl,
        promptUsed: prompt_used || '',
        aspectRatio: aspect_ratio || '1:1'
      }
    });
    
    console.log(`💾 Saved asset: ${filename} for brand ${brandId}`);
    
    res.json({
      id: asset.id,
      url: asset.url,
      prompt_used: asset.promptUsed,
      aspect_ratio: asset.aspectRatio
    });
  } catch (error) {
    console.error('Error saving asset:', error);
    res.status(500).json({ error: 'Failed to save asset' });
  }
});

// Delete asset
app.delete('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    // Get the asset to find the file path
    const asset = await prisma.generatedAsset.findUnique({
      where: { id: req.params.id }
    });
    
    if (asset) {
      // Delete file from storage
      try {
        const urlPath = new URL(asset.url).pathname;
        const filePath = path.join(process.cwd(), urlPath.replace('/storage/', 'storage/'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted file: ${filePath}`);
        }
      } catch (e) {
        console.warn('Could not delete file:', e);
      }
      
      // Delete from database
      await prisma.generatedAsset.delete({
        where: { id: req.params.id }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    mode: 'development',
    storage: storagePath,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🎨 AI Creative Studio - Local Development Server       ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                  ║
║  Storage path:      ${storagePath.substring(0, 35).padEnd(35)}║
║  Database:          SQLite (dev.db)                        ║
╠════════════════════════════════════════════════════════════╣
║  API Endpoints:                                            ║
║  - GET    /api/profiles                                    ║
║  - POST   /api/profiles                                    ║
║  - DELETE /api/profiles/:id                                ║
║  - GET    /api/assets/:profileId                           ║
║  - POST   /api/assets/:brandId/save                        ║
║  - DELETE /api/assets/:id                                  ║
║  - GET    /api/health                                      ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
