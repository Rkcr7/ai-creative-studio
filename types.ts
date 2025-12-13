export interface BrandProfile {
  id: string;
  name: string;
  guidelines: string;
  logo: File | null;
  logoPreview?: string; // Data URL for display
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT_2_3 = "2:3",
  LANDSCAPE_3_2 = "3:2",
  PORTRAIT_3_4 = "3:4",
  LANDSCAPE_4_3 = "4:3",
  PORTRAIT_4_5 = "4:5",
  LANDSCAPE_5_4 = "5:4",
  MOBILE_FULL = "9:16",
  CINEMATIC = "16:9",
  ULTRAWIDE = "21:9",
  ORIGINAL = "original"
}

export enum ImageSize {
  SIZE_1K = "1K",
  SIZE_2K = "2K",
  SIZE_4K = "4K",
}

export enum CreativeMode {
  AD_CREATIVE = "ad_creative",
  ASSET_GENERATION = "asset_generation",
  EDIT_ASSET = "edit_asset"
}

export interface CreativeInput {
  inspirationImages: File[];
  productImages: File[];
  prompt: string;
  count: number;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  promptUsed: string;
  aspectRatio: AspectRatio;
}

export interface GenerationState {
  isAnalyzing: boolean;
  isGenerating: boolean;
  progress: number; // 0 to 100
  statusMessage: string;
}

// Global window extension for AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}