/**
 * Database Service Router for AI Creative Studio
 * 
 * Automatically selects the appropriate database adapter based on APP_ENV:
 * - 'development' -> Local adapter (Prisma SQLite + Local File Storage)
 * - 'production'  -> Supabase adapter (Supabase DB + Supabase Storage)
 */

import { localDb } from './local';
import { supabaseDb, getSupabaseConfig, saveSupabaseConfig } from './supabase';
import { DBAdapter } from './types';

// Determine environment
const getAppEnv = (): 'development' | 'production' => {
  if (typeof process !== 'undefined' && process.env?.APP_ENV) {
    return process.env.APP_ENV as 'development' | 'production';
  }
  // Default to development if not specified
  return 'development';
};

const APP_ENV = getAppEnv();

// Log current environment on load
console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎨 AI Creative Studio - Database Service                  ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${APP_ENV.toUpperCase().padEnd(43)}║
║  Adapter:     ${(APP_ENV === 'development' ? 'Local (Prisma + File Storage)' : 'Supabase (Cloud)').padEnd(43)}║
╚════════════════════════════════════════════════════════════╝
`);

/**
 * Select the appropriate database adapter based on environment
 */
const selectAdapter = (): DBAdapter => {
  if (APP_ENV === 'development') {
    console.log('[DB Router] Using LOCAL adapter (Prisma SQLite + Local Storage)');
    return localDb;
  } else {
    console.log('[DB Router] Using SUPABASE adapter (Cloud)');
    return supabaseDb;
  }
};

// Export the selected adapter as 'db'
export const db = selectAdapter();

// Re-export config functions for settings dialog
export const getDbConfig = getSupabaseConfig;
export const saveDbConfig = saveSupabaseConfig;

// Export environment info for components that need it
export const isLocalDev = () => APP_ENV === 'development';
export const isProduction = () => APP_ENV === 'production';
export const getCurrentEnv = () => APP_ENV;

// Export types
export type { DBAdapter, DBConfig } from './types';

// Default export for backward compatibility
export default db;
