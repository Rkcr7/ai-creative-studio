import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Determine app environment (default to development)
    const appEnv = env.APP_ENV || 'development';
    const localServerPort = env.LOCAL_SERVER_PORT || '3001';
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎨 AI Creative Studio - Vite Build                        ║
╠════════════════════════════════════════════════════════════╣
║  Mode:        ${mode.toUpperCase().padEnd(43)}║
║  APP_ENV:     ${appEnv.toUpperCase().padEnd(43)}║
║  Database:    ${(appEnv === 'development' ? 'Local SQLite (Prisma)' : 'Supabase Cloud').padEnd(43)}║
║  Storage:     ${(appEnv === 'development' ? 'Local File System' : 'Supabase Storage').padEnd(43)}║
╚════════════════════════════════════════════════════════════╝
    `);
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy API requests to local dev server in development
        proxy: appEnv === 'development' ? {
          '/api': {
            target: `http://localhost:${localServerPort}`,
            changeOrigin: true,
          },
          '/storage': {
            target: `http://localhost:${localServerPort}`,
            changeOrigin: true,
          }
        } : undefined
      },
      plugins: [react()],
      define: {
        // Gemini API Key
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        
        // Supabase credentials (for production)
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
        
        // Environment mode
        'process.env.APP_ENV': JSON.stringify(appEnv),
        
        // Local dev server settings
        'process.env.LOCAL_SERVER_PORT': JSON.stringify(localServerPort),
        'process.env.LOCAL_STORAGE_PATH': JSON.stringify(env.LOCAL_STORAGE_PATH || './storage/creatives'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
