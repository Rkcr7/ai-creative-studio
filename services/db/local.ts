/**
 * Local Database Adapter for AI Creative Studio
 * Uses REST API to communicate with local dev server (Prisma + Local File Storage)
 */

import { BrandProfile, GeneratedAsset, AspectRatio } from '../../types';
import { DBAdapter } from './types';
import { Session } from '@supabase/supabase-js';

const LS_KEY_PROFILES = 'brand_profiles_local';

// Get the local server URL from environment or default
const getServerUrl = () => {
  const port = (typeof process !== 'undefined' && process.env?.LOCAL_SERVER_PORT) || '3001';
  return `http://localhost:${port}`;
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

/**
 * Local Database Adapter Implementation
 * Calls local dev server REST API for all operations
 */
export const localDb: DBAdapter = {
  // --- AUTH (Mock for local dev - bypass authentication) ---
  signInWithGoogle: async () => {
    console.log('[Local Dev] Auth bypassed - using mock session');
    return { provider: 'google', url: null };
  },

  signOut: async () => {
    console.log('[Local Dev] Sign out (mock)');
  },

  getSession: async (): Promise<Session | null> => {
    // Return a mock session for local development
    return {
      user: {
        id: 'local_dev_user',
        email: 'developer@local.dev',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString()
      },
      access_token: 'local_dev_token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      refresh_token: 'local_refresh_token'
    } as unknown as Session;
  },

  onAuthStateChange: (callback: (session: Session | null) => void) => {
    // For local dev, immediately call with mock session
    setTimeout(() => {
      localDb.getSession().then(callback);
    }, 100);
    
    return {
      unsubscribe: () => {
        console.log('[Local Dev] Auth subscription unsubscribed');
      }
    };
  },

  // --- PROFILES ---
  getProfiles: async (): Promise<BrandProfile[]> => {
    try {
      const response = await fetch(`${getServerUrl()}/api/profiles`);
      if (!response.ok) throw new Error('Failed to fetch profiles');
      
      const data = await response.json();
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        guidelines: row.guidelines,
        logo: null,
        logoPreview: row.logo_preview
      }));
    } catch (error) {
      console.error('[Local Dev] Error fetching profiles:', error);
      // Fallback to localStorage
      return localDb.getLocalProfiles();
    }
  },

  getLocalProfiles: (): BrandProfile[] => {
    const saved = localStorage.getItem(LS_KEY_PROFILES);
    if (saved) {
      return JSON.parse(saved).map((p: any) => ({ ...p, logo: null }));
    }
    return [];
  },

  saveProfile: async (profile: BrandProfile): Promise<void> => {
    try {
      const response = await fetch(`${getServerUrl()}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          name: profile.name,
          guidelines: profile.guidelines,
          logo_preview: profile.logoPreview
        })
      });
      
      if (!response.ok) throw new Error('Failed to save profile');
      
      console.log('[Local Dev] Profile saved:', profile.name);
    } catch (error) {
      console.error('[Local Dev] Error saving profile:', error);
      
      // Fallback: save to localStorage
      const current = localDb.getLocalProfiles();
      const existingIndex = current.findIndex(p => p.id === profile.id);
      let updated: BrandProfile[];
      
      if (existingIndex >= 0) {
        updated = current.map(p => p.id === profile.id ? profile : p);
      } else {
        updated = [...current, profile];
      }
      
      localStorage.setItem(LS_KEY_PROFILES, JSON.stringify(updated));
    }
  },

  deleteProfile: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${getServerUrl()}/api/profiles/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete profile');
      
      console.log('[Local Dev] Profile deleted:', id);
    } catch (error) {
      console.error('[Local Dev] Error deleting profile:', error);
      
      // Fallback: delete from localStorage
      const current = localDb.getLocalProfiles();
      const updated = current.filter(p => p.id !== id);
      localStorage.setItem(LS_KEY_PROFILES, JSON.stringify(updated));
    }
  },

  // --- ASSETS (GALLERY) ---
  saveAsset: async (
    profile: BrandProfile, 
    imageBase64: string, 
    prompt: string, 
    aspectRatio: string
  ): Promise<GeneratedAsset | null> => {
    try {
      const response = await fetch(`${getServerUrl()}/api/assets/${profile.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          prompt_used: prompt,
          aspect_ratio: aspectRatio
        })
      });
      
      if (!response.ok) throw new Error('Failed to save asset');
      
      const data = await response.json();
      
      console.log('[Local Dev] Asset saved:', data.id);
      
      return {
        id: data.id,
        url: data.url,
        promptUsed: data.prompt_used,
        aspectRatio: data.aspect_ratio as AspectRatio
      };
    } catch (error) {
      console.error('[Local Dev] Error saving asset:', error);
      return null;
    }
  },

  getAssets: async (
    profileId: string, 
    page: number = 0, 
    pageSize: number = 10
  ): Promise<GeneratedAsset[]> => {
    try {
      const response = await fetch(
        `${getServerUrl()}/api/assets/${profileId}?page=${page}&pageSize=${pageSize}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch assets');
      
      const data = await response.json();
      
      return data.map((row: any) => ({
        id: row.id,
        url: row.url,
        promptUsed: row.prompt_used,
        aspectRatio: row.aspect_ratio as AspectRatio
      }));
    } catch (error) {
      console.error('[Local Dev] Error fetching assets:', error);
      return [];
    }
  },

  deleteAsset: async (id: string, url: string): Promise<void> => {
    try {
      const response = await fetch(`${getServerUrl()}/api/assets/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete asset');
      
      console.log('[Local Dev] Asset deleted:', id);
    } catch (error) {
      console.error('[Local Dev] Error deleting asset:', error);
    }
  },

  // --- UTILS ---
  isCloudEnabled: () => {
    // In local mode, we're using local server instead of cloud
    // Return true to indicate storage is functional
    return true;
  }
};

export default localDb;
