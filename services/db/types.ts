/**
 * Shared Database Types for AI Creative Studio
 * Used by both local (Prisma) and production (Supabase) implementations
 */

import { BrandProfile, GeneratedAsset, AspectRatio } from '../../types';
import { Session } from '@supabase/supabase-js';

export interface DBAdapter {
  // Auth
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
  onAuthStateChange: (callback: (session: Session | null) => void) => any;
  
  // Profiles
  getProfiles: () => Promise<BrandProfile[]>;
  getLocalProfiles: () => BrandProfile[];
  saveProfile: (profile: BrandProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  
  // Assets
  saveAsset: (
    profile: BrandProfile, 
    imageBase64: string, 
    prompt: string, 
    aspectRatio: string
  ) => Promise<GeneratedAsset | null>;
  getAssets: (profileId: string, page?: number, pageSize?: number) => Promise<GeneratedAsset[]>;
  deleteAsset: (id: string, url: string) => Promise<void>;
  
  // Utils
  isCloudEnabled: () => boolean;
}

export interface DBConfig {
  url: string;
  key: string;
}
