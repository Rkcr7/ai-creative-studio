import { GoogleGenAI } from "@google/genai";
import { AspectRatio, BrandProfile, ImageSize, CreativeMode } from "../types";

// Helper: Wait function for backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Get Image Dimensions to detect Aspect Ratio
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(objectUrl);
    };
    img.onerror = (e) => {
        reject(e);
        URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
};

// Helper to convert File or Base64 Data URI to Gemini Part
const toGeminiPart = async (fileOrUrl: File | string) => {
  if (fileOrUrl instanceof File) {
     return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Handle both data:URL formats just in case
        const base64String = result.includes(',') ? result.split(',')[1] : result;
        resolve({
          inlineData: {
            data: base64String,
            mimeType: fileOrUrl.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    });
  } else if (typeof fileOrUrl === 'string') {
     // Assume Base64 Data URI: data:image/png;base64,ABC...
     const match = fileOrUrl.match(/^data:(.*?);base64,(.*)$/);
     if (match) {
        return {
           inlineData: {
              mimeType: match[1],
              data: match[2]
           }
        };
     }
  }
  throw new Error("Invalid image data");
};

/**
 * GENERATE CREATIVE DIRECTLY (Multimodal)
 * Uses gemini-3-pro-image-preview (Nano Banana Pro) to digest all visual and text context 
 * and generate the final asset in one go.
 */
export const generateComprehensiveCreative = async (
  profile: BrandProfile,
  productImages: File[], // In Edit Mode, this contains the Source Image (1)
  inspirationImages: File[], // In Edit Mode, this contains References (up to 3)
  userPrompt: string,
  productDetails: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize,
  variationIndex: number,
  mode: CreativeMode,
  includeGuidelines: boolean = true,
  includeLogo: boolean = false,
  onStatusUpdate?: (status: string) => void,
  signal?: AbortSignal
): Promise<{ url: string; prompt: string }> => {
  
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : ''; 
  const ai = new GoogleGenAI({ apiKey });

  // Use the image generation model that supports multimodal inputs
  const model = "gemini-3-pro-image-preview";

  // Build the multimodal request
  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];

  // 1. System/Context Prompt Configuration
  let contextPrompt = "";

  if (mode === CreativeMode.EDIT_ASSET) {
    // --- MODE 3: EDIT ASSET ---
    // Simplified prompt to ensure image output
    contextPrompt = `
      TASK: You are an advanced AI Image Editor.
      INSTRUCTION: Understand User prompt and its intent then Apply the specific Edits to the provided SOURCE IMAGE.
      USER PROMPT: "${userPrompt}"
      
      RULES:
      1. Return ONLY the modified image. Do not output text.
      2. Keep the original aspect ratio if possible.
      3. Maintain high quality & details .Apply the edits requested by the user.
      4. If provided, use reference images for style,composition, replacement or addition depending upon user prompt.
    
      ${(includeGuidelines && profile.guidelines) ? `5. Brand Context: ${profile.name} (${profile.guidelines})` : `5. Brand Identity: ${profile.name}`}
    `;

  } else if (mode === CreativeMode.AD_CREATIVE) {
    // --- MODE 1: AD CREATIVE STRATEGY ---
    contextPrompt = `
      ROLE: World-Class Meta Ad Creative Strategist & Senior Art Director & Designer.
    OBJECTIVE: Create a "Stop-the-Scroll" high-performance ad creative that drives high CTR and conversions.
      
      --- CRITICAL RULES (MUST FOLLOW) ---
      1. PRODUCT INTEGRITY IS SACRED: Preserve the exact appearance of the provided product (Color, Shape, Label, Details etc). Do NOT hallucinate new features . You can play with different visual angles, compositions etc.
      2. BRAND ALIGNMENT: Strictly adhere to: "${profile.name}" Guidelines: "${profile.guidelines}".
      3. LOGO PLACEMENT: Integrate the provided BRAND LOGO naturally but visibly . If user specifically ask not use logo then dont add it
      4. ASPECT RATIO: Compose specifically for ${aspectRatio}. Ensure the focal point is within the safe zone.

      --- CAMPAIGN CONTEXT ---
      CAMPAIGN GOAL/HOOK/visual strategy [Important]: "${userPrompt}"
      PRODUCT DETAILS: "${productDetails || 'Refer to product images'}"
      VARIATION: #${variationIndex}

      - INSPIRATION: If inspiration images are provided, mimic their lighting, mood, composition, style etc do not create the same just get inspiration rest follow the user prompt/campaign goal direction. Try to create some variation inspired by it. Ignore this if no ref image is provided
    `;
  } else {
    // --- MODE 2: ASSET GENERATION / VISUAL COMPOSITIONS ---
    contextPrompt = `
      ROLE: Expert Visual Artist & Product Photographer.
      OBJECTIVE: Generate a high-quality visual asset based on the description.
      Assets can be anything: photography,shots,graphics,logos,stickers,infographics,Visual art etc
      --- CRITICAL RULES ---
      1. PRODUCT INTEGRITY: Preserve the product's look. (Color, Shape, Label, Details, etc). Do NOT hallucinate new features . You can play with different visual angles or compositions.
      2. STYLE: Adapt to the prompt (Photography vs. Graphics/Collage , compositions , overlays , stickers etc).
      3. BRAND ALIGNMENT: ${includeGuidelines && profile.guidelines ? `Follow "${profile.name}" guidelines: "${profile.guidelines}".` : `Maintain consistent identity for "${profile.name}".`}.  If user specifically ask not use logo then dont add it.
      4. ASPECT RATIO: Compose for ${aspectRatio}.

      - INSPIRATION: If inspiration images are provided, mimic their lighting, mood, composition, style etc do not create the same just get inspiration rest follow the user prompt direction. Try to create some variation inspired by it. Ignore this if no ref image is provided


      --- VISUAL PROMPT ---
      DESCRIPTION: "${userPrompt}"
      DETAILS: "${productDetails}"
      VARIATION: #${variationIndex}
    `;
  }

  parts.push({ text: contextPrompt });

  // 2. Add Brand Logo
  // Logic: Always send logo for AD_CREATIVE. For others, only send if explicitly checked.
  const shouldAddLogo = mode === CreativeMode.AD_CREATIVE || includeLogo;

  if (shouldAddLogo) {
      if (profile.logo) {
        parts.push({ text: "REFERENCE [BRAND LOGO]:" });
        parts.push(await toGeminiPart(profile.logo));
      } else if (profile.logoPreview) {
        parts.push({ text: "REFERENCE [BRAND LOGO]:" });
        parts.push(await toGeminiPart(profile.logoPreview));
      }
  }

  // 3. Add Images
  if (mode === CreativeMode.EDIT_ASSET) {
      if (productImages.length > 0) {
        parts.push({ text: "SOURCE IMAGE (Apply edits to this):" });
        parts.push(await toGeminiPart(productImages[0]));
      }
      if (inspirationImages.length > 0) {
        parts.push({ text: "REFERENCE STYLE:" });
        for (const img of inspirationImages) {
          parts.push(await toGeminiPart(img));
        }
      }
  } else {
      // Standard Generation Modes
      if (productImages.length > 0) {
        parts.push({ text: "REFERENCE [PRODUCT IMAGES]:" });
        for (const img of productImages) {
          parts.push(await toGeminiPart(img));
        }
      }
      if (inspirationImages.length > 0) {
        parts.push({ text: "REFERENCE [STYLE INSPIRATION]:" });
        for (const img of inspirationImages) {
          parts.push(await toGeminiPart(img));
        }
      }
  }

  // Build Configuration
  const imageConfig: any = {
     imageSize: imageSize
  };

  // --- ASPECT RATIO LOGIC ---
  // Fix: If Original is selected, we MUST calculate the closest supported ratio and send it.
  // Otherwise, Gemini defaults to 1:1.
  if (aspectRatio !== AspectRatio.ORIGINAL) {
     imageConfig.aspectRatio = aspectRatio;
  } else if (mode === CreativeMode.EDIT_ASSET && productImages.length > 0) {
      try {
        if (onStatusUpdate) onStatusUpdate("Analyzing image dimensions...");
        const dimensions = await getImageDimensions(productImages[0]);
        const ratio = dimensions.width / dimensions.height;
        
        // Define supported ratios and their numeric values
        const supported = [
            { val: 1/1, str: "1:1" },
            { val: 2/3, str: "2:3" },
            { val: 3/2, str: "3:2" },
            { val: 3/4, str: "3:4" },
            { val: 4/3, str: "4:3" },
            { val: 4/5, str: "4:5" },
            { val: 5/4, str: "5:4" },
            { val: 9/16, str: "9:16" },
            { val: 16/9, str: "16:9" },
            { val: 21/9, str: "21:9" },
        ];
        
        // Find closest supported ratio
        const closest = supported.reduce((prev, curr) => {
            return (Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev);
        });

        console.log(`[Edit Mode] Detected ratio: ${ratio.toFixed(2)}. Snapping to closest supported: ${closest.str}`);
        imageConfig.aspectRatio = closest.str;

        // NEW: Update status to confirm analysis is done and generation is starting
        if (onStatusUpdate) onStatusUpdate("Applying edits...");

      } catch (e) {
        console.warn("Could not detect image dimensions, defaulting to model behavior (usually 1:1).", e);
        // Ensure UI doesn't get stuck on "Analyzing..."
        if (onStatusUpdate) onStatusUpdate("Applying edits...");
      }
  }

  // --- RETRY LOGIC FOR 503/OVERLOAD ---
  let attempts = 0;
  const maxAttempts = 3;
  const TIMEOUT_MS = 80000; // 80 seconds hard timeout

  while (attempts < maxAttempts) {
    if (signal?.aborted) {
      throw new Error("Cancelled by user");
    }

    try {
      
      // Wrap the API call in a race with a timeout
      const generatePromise = ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          imageConfig,
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("Request timed out (80s).")), TIMEOUT_MS);
        if (signal) {
          signal.addEventListener('abort', () => {
             clearTimeout(timer);
             reject(new Error("Cancelled by user"));
          });
        }
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      if (signal?.aborted) {
         throw new Error("Cancelled by user");
      }

      // Iterate through parts to find the image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return {
            url: `data:image/png;base64,${part.inlineData.data}`,
            prompt: userPrompt
          };
        }
        // If we got text but no image, catch it to show the error
        if (part.text) {
           console.warn("Model returned text instead of image:", part.text);
           // Throwing this text allows the UI to show "I cannot create this..." messages
           throw new Error(`Model Refusal: ${part.text.substring(0, 100)}...`); 
        }
      }
      
      // Check for finishReason if no content
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
          throw new Error(`Generation stopped: ${finishReason}`);
      }

      throw new Error("No image data returned from Gemini.");

    } catch (error: any) {
      if (signal?.aborted || error.message === "Cancelled by user") {
         throw new Error("Cancelled by user");
      }

      attempts++;
      
      // --- ROBUST ERROR PARSING ---
      let errorMsg = error.message || JSON.stringify(error);
      
      // Try to parse JSON error message if it comes as a stringified JSON
      if (typeof errorMsg === 'string' && errorMsg.trim().startsWith('{')) {
         try {
            const parsed = JSON.parse(errorMsg);
            if (parsed.error) {
               errorMsg = JSON.stringify(parsed.error);
               if (parsed.error.code === 503) errorMsg += " 503 Service Unavailable";
               if (parsed.error.status === "UNAVAILABLE") errorMsg += " UNAVAILABLE";
            }
         } catch (e) {
            // Ignore parsing error, use original string
         }
      }

      console.warn(`Attempt ${attempts} failed:`, errorMsg);

      // Don't retry on safety refusals or specific model text responses
      if (errorMsg.includes("Model Refusal") || errorMsg.includes("SAFETY")) {
         throw error;
      }

      const isOverloaded = errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('overloaded') || errorMsg.includes('429');

      if ((isOverloaded || errorMsg.includes('timed out')) && attempts < maxAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000 + Math.random() * 500;
        const msg = `Model is overloaded. Retrying (${attempts + 1}/${maxAttempts})...`;
        
        console.log(msg);
        if (onStatusUpdate) onStatusUpdate(msg);
        
        await wait(delay);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to generate image after multiple attempts.");
};