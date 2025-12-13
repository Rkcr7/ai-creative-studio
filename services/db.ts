/**
 * Database Service for AI Creative Studio
 * 
 * This file provides backward compatibility by re-exporting from the new modular structure.
 * 
 * Environment Modes:
 * - APP_ENV=development -> Uses Local Prisma SQLite + Local File Storage
 * - APP_ENV=production  -> Uses Supabase Database + Supabase Storage
 * 
 * @see services/db/index.ts for the main router logic
 * @see services/db/local.ts for local development implementation
 * @see services/db/supabase.ts for production Supabase implementation
 */

// Re-export everything from the new modular structure
export { 
  db, 
  getDbConfig, 
  saveDbConfig,
  isLocalDev,
  isProduction,
  getCurrentEnv
} from './db/index';

// Re-export types
export type { DBAdapter, DBConfig } from './db/types';

// Default export for backward compatibility
export { db as default } from './db/index';
