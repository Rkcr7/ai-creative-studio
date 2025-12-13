# AI Creative Studio - Development Environment

This document explains how to set up and use the dual-environment (development/production) testing system.

## 🎯 Overview

The application supports two environments:

| Feature | Development Mode | Production Mode |
|---------|------------------|-----------------|
| **Database** | SQLite (Prisma) | Supabase PostgreSQL |
| **File Storage** | Local filesystem | Supabase Storage |
| **Authentication** | Mock/Bypass | Google OAuth via Supabase |
| **API Server** | Local Express server | Supabase REST API |

## 🚀 Quick Start

### Development Mode (Default)

```bash
# Install dependencies
npm install

# Start development (runs both server and client)
npm run dev
```

This will:
1. Start the local Express API server on port `3001`
2. Start the Vite dev server on port `3000`
3. Use SQLite database (`prisma/dev.db`)
4. Store files locally in `storage/creatives/`

### Production Mode

```bash
# Run Vite with production settings
npm run dev:prod
```

This will:
1. Use Supabase for database
2. Use Supabase Storage for files
3. Enable Google OAuth authentication

## 📁 Project Structure

```
AI creative studio/
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration files
│   └── dev.db          # SQLite database (auto-generated)
├── server/
│   ├── dev-server.ts   # Local development server
│   └── tsconfig.json   # Server TypeScript config
├── services/
│   ├── db.ts           # Main DB export (backward compatible)
│   └── db/
│       ├── index.ts    # Environment router
│       ├── local.ts    # Local adapter (Prisma + REST API)
│       ├── supabase.ts # Supabase adapter
│       └── types.ts    # Shared interfaces
├── storage/
│   └── creatives/      # Local file storage
│       └── {brand_id}/ # Brand-specific folders
├── .env                # Environment configuration
└── package.json
```

## ⚙️ Environment Configuration

Edit `.env` file:

```env
# Environment mode: 'development' or 'production'
APP_ENV=development

# Gemini API Key (always required)
GEMINI_API_KEY=your_api_key_here

# Local Development Settings
DATABASE_URL="file:./dev.db"
LOCAL_STORAGE_PATH=./storage/creatives
LOCAL_SERVER_PORT=3001

# Supabase (for production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start full dev environment (server + client) |
| `npm run dev:client` | Start only Vite client |
| `npm run dev:server` | Start only local API server |
| `npm run dev:prod` | Start client in production mode (uses Supabase) |
| `npm run build` | Build for development |
| `npm run build:prod` | Build for production |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run db:reset` | Reset database (delete all data) |

## 🗄️ Database Management

### View Database
```bash
npm run db:studio
```
Opens Prisma Studio at `http://localhost:5555`

### Create Migration
```bash
npm run db:migrate
```

### Reset Database
```bash
npm run db:reset
```

## 📂 Local File Storage

Files are stored in the following structure:

```
storage/
└── creatives/
    ├── {brand_id_1}/
    │   ├── 1702492800000_abc12.png
    │   └── 1702493000000_xyz34.png
    └── {brand_id_2}/
        └── 1702494000000_def56.png
```

Brand folders are auto-created when saving assets.

## 🔌 Local API Endpoints

The dev server provides these REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | Get all brand profiles |
| POST | `/api/profiles` | Create/update profile |
| DELETE | `/api/profiles/:id` | Delete profile |
| GET | `/api/assets/:profileId` | Get assets for profile |
| POST | `/api/assets/:brandId/save` | Save asset (base64) |
| DELETE | `/api/assets/:id` | Delete asset |
| GET | `/api/health` | Health check |

## 🔄 Switching Environments

### Method 1: Change .env file
```env
# For development
APP_ENV=development

# For production
APP_ENV=production
```

### Method 2: Use different npm scripts
```bash
# Development mode
npm run dev

# Production mode
npm run dev:prod
```

## 🐛 Troubleshooting

### Server not starting
Make sure the dev server is running:
```bash
npm run dev:server
```

### Database errors
Reset the database:
```bash
npm run db:reset
npm run db:migrate
```

### File upload issues
Check that `storage/creatives/` directory exists and is writable.

### CORS errors
The dev server has CORS enabled. Make sure you're accessing the app through `http://localhost:3000`.

## 🧪 Testing the Setup

1. Start the development environment:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Create a brand profile and generate some assets

4. Check the database:
   ```bash
   npm run db:studio
   ```

5. Check the storage folder for saved images:
   ```
   storage/creatives/{your-brand-id}/
   ```

## 📝 Notes

- The `BYPASS_AUTH` flag in `App.tsx` is set to `true` by default for development
- Set it to `false` when testing authentication flows
- Local development uses a mock session for authentication
- All generated assets in development are stored locally and won't sync to production
