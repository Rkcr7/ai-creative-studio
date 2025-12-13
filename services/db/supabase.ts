/**
 * Supabase Database Adapter for AI Creative Studio
 * Production implementation using Supabase Database + Storage
 */

import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BrandProfile, GeneratedAsset, AspectRatio } from '../../types';
import { DBAdapter, DBConfig } from './types';

let supabase: SupabaseClient | null = null;
const LS_KEY_PROFILES = 'brand_profiles';
const LS_KEY_CONFIG = 'db_config';

// Credentials from Environment Variables
const DEFAULT_URL = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) ? process.env.SUPABASE_URL : '';
const DEFAULT_KEY = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) ? process.env.SUPABASE_ANON_KEY : '';

export const getDbConfig = (): DBConfig => {
  const saved = localStorage.getItem(LS_KEY_CONFIG);
  if (saved) {
    return JSON.parse(saved);
  }
  return { url: DEFAULT_URL, key: DEFAULT_KEY };
};

export const saveDbConfig = (url: string, key: string) => {
  if (!url || !key) {
    localStorage.removeItem(LS_KEY_CONFIG);
    initSupabase(DEFAULT_URL, DEFAULT_KEY);
  } else {
    localStorage.setItem(LS_KEY_CONFIG, JSON.stringify({ url, key }));
    initSupabase(url, key);
  }
};

export const initSupabase = (url: string, key: string) => {
  try {
    if (url && key) {
      supabase = createClient(url, key);
    }
  } catch (e) {
    console.error("Failed to init supabase", e);
    supabase = null;
  }
};

// Initialize on load
const config = getDbConfig();
if (config.url && config.key) {
  initSupabase(config.url, config.key);
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

/**
 * Supabase Database Adapter Implementation
 */
export const supabaseDb: DBAdapter = {
  // --- AUTH ---
  signInWithGoogle: async () => {
    if (!supabase) throw new Error("Database not connected");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async (): Promise<Session | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange: (callback: (session: Session | null) => void) => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return subscription;
  },

  // --- PROFILES ---
  getProfiles: async (): Promise<BrandProfile[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase fetch error:", error.message || error);
        return supabaseDb.getLocalProfiles();
      }
      
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        guidelines: row.guidelines,
        logo: null,
        logoPreview: row.logo_preview
      }));
    } else {
      return supabaseDb.getLocalProfiles();
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
    if (supabase) {
      const { error } = await supabase
        .from('brand_profiles')
        .upsert({
          id: profile.id,
          name: profile.name,
          guidelines: profile.guidelines,
          logo_preview: profile.logoPreview
        }, { onConflict: 'id' });
        
      if (error) {
         console.error("DB Save Profile Error:", error.message || error);
         throw error;
      }
    } else {
      const current = supabaseDb.getLocalProfiles();
      const existingIndex = current.findIndex((p: any) => p.id === profile.id);
      let updated = [];
      if (existingIndex >= 0) {
        updated = current.map((p: any) => p.id === profile.id ? profile : p);
      } else {
        updated = [...current, profile];
      }
      localStorage.setItem(LS_KEY_PROFILES, JSON.stringify(updated));
    }
  },

  deleteProfile: async (id: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('brand_profiles').delete().eq('id', id);
      if (error) throw error;
    } else {
      const current = supabaseDb.getLocalProfiles();
      const updated = current.filter((p: any) => p.id !== id);
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
    if (!supabase) return null;

    try {
      // 1. Upload Image to Storage Bucket 'creatives'
      const res = await fetch(imageBase64);
      const blob = await res.blob();
      
      const fileName = `${profile.id}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('creatives')
        .upload(fileName, blob, { contentType: 'image/png' });

      if (uploadError) {
         console.error("Storage Upload Error:", uploadError.message || JSON.stringify(uploadError));
         throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('creatives')
        .getPublicUrl(fileName);

      // 2. Insert Record into DB
      const newId = generateId();
      const assetPayload = {
          id: newId,
          profile_id: profile.id,
          url: publicUrl,
          prompt_used: prompt,
          aspect_ratio: aspectRatio
      };

      const { data, error: insertError } = await supabase
        .from('generated_assets')
        .insert(assetPayload)
        .select()
        .single();

      if (insertError) {
         // Fix for "Foreign Key Violation" (Code 23503)
         if (insertError.code === '23503') {
             console.warn("Profile missing in DB (FK Error). Attempting auto-sync...");
             
             await supabaseDb.saveProfile(profile);
             
             // Retry Insert
             const { data: retryData, error: retryError } = await supabase
                .from('generated_assets')
                .insert(assetPayload)
                .select()
                .single();

             if (retryError) {
                 console.error("Retry DB Insert Failed:", retryError);
                 throw retryError;
             }
             
             return {
                id: retryData.id,
                url: retryData.url,
                promptUsed: retryData.prompt_used,
                aspectRatio: retryData.aspect_ratio as AspectRatio
             };
         }

         console.error("DB Insert Asset Error:", insertError.message || JSON.stringify(insertError));
         throw insertError;
      }

      return {
        id: data.id,
        url: data.url,
        promptUsed: data.prompt_used,
        aspectRatio: data.aspect_ratio as AspectRatio
      };

    } catch (e) {
      console.error("Failed to save asset to Supabase", e);
      return null;
    }
  },

  getAssets: async (
    profileId: string, 
    page: number = 0, 
    pageSize: number = 10
  ): Promise<GeneratedAsset[]> => {
    if (!supabase) return [];

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('generated_assets')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching assets:", error.message || error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      url: row.url,
      promptUsed: row.prompt_used,
      aspectRatio: row.aspect_ratio as AspectRatio
    }));
  },

  deleteAsset: async (id: string, url: string): Promise<void> => {
    if (supabase) {
      // 1. Delete from DB
      const { error } = await supabase.from('generated_assets').delete().eq('id', id);
      if (error) {
         console.error("DB Delete Asset Error:", error.message || JSON.stringify(error));
         throw error;
      }

      // 2. Attempt to delete from Storage (clean up)
      try {
        const path = url.split('/creatives/')[1];
        if (path) {
          const { error: storageError } = await supabase.storage.from('creatives').remove([path]);
          if (storageError) {
             console.warn("Storage Delete Error:", storageError.message);
          }
        }
      } catch (e) {
        console.warn("Could not delete file from storage", e);
      }
    }
  },

  // --- UTILS ---
  isCloudEnabled: () => !!supabase
};

// Export config functions for use in settings
export { getDbConfig as getSupabaseConfig, saveDbConfig as saveSupabaseConfig };

export default supabaseDb;
