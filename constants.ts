import { AspectRatio, ImageSize } from "./types";

export const ASPECT_RATIOS = [
  { value: AspectRatio.SQUARE, label: "Square (1:1)" },
  { value: AspectRatio.PORTRAIT_2_3, label: "Portrait (2:3)" },
  { value: AspectRatio.LANDSCAPE_3_2, label: "Landscape (3:2)" },
  { value: AspectRatio.PORTRAIT_3_4, label: "Portrait (3:4)" },
  { value: AspectRatio.LANDSCAPE_4_3, label: "Landscape (4:3)" },
  { value: AspectRatio.PORTRAIT_4_5, label: "Social (4:5)" },
  { value: AspectRatio.LANDSCAPE_5_4, label: "Print (5:4)" },
  { value: AspectRatio.MOBILE_FULL, label: "Story (9:16)" },
  { value: AspectRatio.CINEMATIC, label: "Cinematic (16:9)" },
  { value: AspectRatio.ULTRAWIDE, label: "Ultrawide (21:9)" },
];

export const IMAGE_SIZES = [
  { value: ImageSize.SIZE_1K, label: "Standard (1K)" },
  { value: ImageSize.SIZE_2K, label: "High Res (2K)" },
  { value: ImageSize.SIZE_4K, label: "Ultra (4K)" },
];

export const MAX_INSPIRATION_IMAGES = 4;
export const MAX_PRODUCT_IMAGES = 8;
export const MAX_GENERATION_COUNT = 10;

export const LOGO_URL = "/logo.png";
