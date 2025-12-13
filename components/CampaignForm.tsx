import React from 'react';
import { AspectRatio, ImageSize, GenerationState, CreativeMode } from '../types';
import { ASPECT_RATIOS, IMAGE_SIZES, MAX_GENERATION_COUNT } from '../constants';
import Button from './Button';

interface CampaignFormProps {
  mode: CreativeMode;
  setMode: (m: CreativeMode) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  productDetails: string;
  setProductDetails: (v: string) => void;
  includeGuidelines: boolean;
  setIncludeGuidelines: (v: boolean) => void;
  includeLogo: boolean;
  setIncludeLogo: (v: boolean) => void;
  count: number;
  setCount: (v: number) => void;
  imageSize: ImageSize;
  setImageSize: (v: ImageSize) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (v: AspectRatio) => void;
  setEditingField: (field: 'prompt' | 'details') => void;
  handleGenerate: () => void;
  handleCancel?: () => void;
  isProcessing: boolean;
  status: GenerationState;
  hasProductImages: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  mode, setMode,
  prompt, setPrompt,
  productDetails, setProductDetails,
  includeGuidelines, setIncludeGuidelines,
  includeLogo, setIncludeLogo,
  count, setCount,
  imageSize, setImageSize,
  aspectRatio, setAspectRatio,
  setEditingField,
  handleGenerate,
  handleCancel,
  isProcessing,
  status,
  hasProductImages
}) => {
  
  // Wrapper for switching modes to handle defaults
  const handleModeChange = (newMode: CreativeMode) => {
    setMode(newMode);
    
    if (newMode === CreativeMode.EDIT_ASSET) {
        setAspectRatio(AspectRatio.ORIGINAL);
        setIncludeGuidelines(true); // Default to true
        setIncludeLogo(false); // Default to false
    } else {
        // IMPORTANT: When switching OUT of Edit mode, reset Aspect Ratio to a valid standard.
        // "Original" is invalid for ad generation logic and might cause errors.
        if (aspectRatio === AspectRatio.ORIGINAL) {
            setAspectRatio(AspectRatio.SQUARE);
        }
        setIncludeGuidelines(true); // Default to true
        if (newMode === CreativeMode.ASSET_GENERATION) {
             setIncludeLogo(false); // Default to false for Asset Gen
        }
    }
  };

  // Custom label helper
  const getPromptLabel = () => {
      switch(mode) {
          case CreativeMode.EDIT_ASSET: return "Editing Instructions";
          case CreativeMode.ASSET_GENERATION: return "Prompt / Composition Details";
          default: return "Campaign Goal & Copy Ideas";
      }
  };

  const getPromptPlaceholder = () => {
      switch(mode) {
          case CreativeMode.EDIT_ASSET: return "Describe specifically what to change (e.g. 'Remove the background', 'Add a neon glow', 'Make it look like a sketch'). This overrides brand guidelines.";
          case CreativeMode.ASSET_GENERATION: return "Describe the scene. You can ask for mixed media, text, or stickers (e.g., 'Product floating on pink background with 'SALE' sticker and sparkles' or 'Clean studio shot').";
          default: return "What are we promoting? What's the mood? Any specific text?";
      }
  };

  const getSubmitLabel = () => {
      switch(mode) {
          case CreativeMode.EDIT_ASSET: return "Generate Edits";
          case CreativeMode.ASSET_GENERATION: return "Generate Assets";
          default: return "Generate Ad Creatives";
      }
  };

  return (
    <div className="space-y-6">
      
      {/* Mode Switcher Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleModeChange(CreativeMode.AD_CREATIVE)}
          disabled={isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            mode === CreativeMode.AD_CREATIVE 
              ? 'bg-zinc-800 text-white shadow-md' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 disabled:opacity-50'
          }`}
        >
          <svg className={`w-4 h-4 ${mode === CreativeMode.AD_CREATIVE ? 'text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Ad Creative
        </button>
        <button
          onClick={() => handleModeChange(CreativeMode.ASSET_GENERATION)}
          disabled={isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            mode === CreativeMode.ASSET_GENERATION 
              ? 'bg-zinc-800 text-white shadow-md' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 disabled:opacity-50'
          }`}
        >
          <svg className={`w-4 h-4 ${mode === CreativeMode.ASSET_GENERATION ? 'text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Asset Gen
        </button>
        <button
          onClick={() => handleModeChange(CreativeMode.EDIT_ASSET)}
          disabled={isProcessing}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            mode === CreativeMode.EDIT_ASSET 
              ? 'bg-zinc-800 text-white shadow-md' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 disabled:opacity-50'
          }`}
        >
          <svg className={`w-4 h-4 ${mode === CreativeMode.EDIT_ASSET ? 'text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          Editor
        </button>
      </div>

      {/* Campaign Details Card */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl relative overflow-hidden transition-colors duration-500">
         {/* Subtle colored accent at the top based on mode */}
         <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${
             mode === CreativeMode.AD_CREATIVE ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 
             mode === CreativeMode.ASSET_GENERATION ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 
             'bg-gradient-to-r from-blue-500 to-cyan-600'
         }`}></div>

         <div className="flex items-center gap-2 mb-5">
           <div className={`p-1.5 rounded-lg ${
             mode === CreativeMode.AD_CREATIVE ? 'bg-indigo-500/20 text-indigo-400' : 
             mode === CreativeMode.ASSET_GENERATION ? 'bg-emerald-500/20 text-emerald-400' : 
             'bg-blue-500/20 text-blue-400'
           }`}>
             {mode === CreativeMode.AD_CREATIVE && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
             {mode === CreativeMode.ASSET_GENERATION && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
             {mode === CreativeMode.EDIT_ASSET && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
           </div>
           <h3 className="text-base font-semibold text-zinc-100">
             {mode === CreativeMode.AD_CREATIVE ? "Ad Strategy Brief" : (mode === CreativeMode.EDIT_ASSET ? "Edit Instructions" : "Visual Direction Brief")}
           </h3>
         </div>
         
         <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-400 ml-1">
                    {getPromptLabel()}
                  </label>

                  <div className="flex items-center gap-3">
                    {/* Include Guidelines Checkbox (Only for Asset Gen & Edit Mode) */}
                    {(mode === CreativeMode.ASSET_GENERATION || mode === CreativeMode.EDIT_ASSET) && (
                        <>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={includeGuidelines}
                                onChange={(e) => setIncludeGuidelines(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 transition-colors"
                            />
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold">
                                Use Brand Guidelines
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={includeLogo}
                                onChange={(e) => setIncludeLogo(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 transition-colors"
                            />
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold">
                                Include Brand Logo
                            </span>
                        </label>
                        </>
                    )}

                    <button 
                        onClick={() => setEditingField('prompt')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        Expand
                    </button>
                  </div>
              </div>
              <textarea 
                 className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-28 resize-none placeholder:text-zinc-600 transition-all"
                 placeholder={getPromptPlaceholder()}
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Product Details - HIDDEN IN EDIT MODE */}
            {mode !== CreativeMode.EDIT_ASSET && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-zinc-400 ml-1">Product Details (Optional)</label>
                      <button 
                        onClick={() => setEditingField('details')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        Expand
                      </button>
                  </div>
                  <textarea 
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-20 resize-none placeholder:text-zinc-600 transition-all"
                    placeholder="Key features, materials, pricing, or selling points..."
                    value={productDetails}
                    onChange={(e) => setProductDetails(e.target.value)}
                  />
                </div>
            )}

            <div className="grid grid-cols-2 gap-5 pt-2">
               <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1">Output Count</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min={1} 
                      max={MAX_GENERATION_COUNT} 
                      value={count}
                      onChange={(e) => setCount(Math.min(MAX_GENERATION_COUNT, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl pl-4 pr-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                    />
                    <div className="absolute right-3 top-2.5 text-xs text-zinc-500 pointer-events-none">assets</div>
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 ml-1">Resolution</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {IMAGE_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-medium text-zinc-400 ml-1">Aspect Ratio</label>
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                 {/* Only show 'Original' in Edit Mode */}
                 {mode === CreativeMode.EDIT_ASSET && (
                    <button
                        onClick={() => setAspectRatio(AspectRatio.ORIGINAL)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        aspectRatio === AspectRatio.ORIGINAL 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                    >
                        Original <span className="opacity-50 ml-1">(Auto)</span>
                    </button>
                 )}

                 {ASPECT_RATIOS.map(ratio => (
                   <button
                     key={ratio.value}
                     onClick={() => setAspectRatio(ratio.value as AspectRatio)}
                     className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
                       aspectRatio === ratio.value 
                         ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' 
                         : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
                     }`}
                     title={ratio.label}
                   >
                     {ratio.label.split(' ')[0]} <span className="opacity-50 ml-1">{ratio.value}</span>
                   </button>
                 ))}
               </div>
            </div>
         </div>
      </div>

      <div className="pt-2 sticky bottom-6 z-20 flex gap-2">
         {isProcessing ? (
            <>
               <div className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-lg font-medium text-sm sm:text-base text-white shadow-xl border transition-all duration-200 ${
                   mode === CreativeMode.AD_CREATIVE ? 'bg-indigo-600/80 border-indigo-500/50' : 
                   mode === CreativeMode.ASSET_GENERATION ? 'bg-emerald-600/80 border-emerald-500/50' :
                   'bg-blue-600/80 border-blue-500/50'
               }`}>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="truncate">{status.statusMessage || "Processing..."}</span>
               </div>
               
               {handleCancel && (
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-600 text-white border border-red-400 rounded-lg aspect-square h-auto flex items-center justify-center shadow-xl transition-colors w-14 shrink-0"
                    title="Stop Generation"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               )}
            </>
         ) : (
             <Button 
               className={`w-full py-4 text-base shadow-xl transform hover:-translate-y-0.5 ${
                 mode === CreativeMode.AD_CREATIVE ? 'shadow-indigo-900/40 hover:shadow-indigo-900/60' : 
                 mode === CreativeMode.ASSET_GENERATION ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 hover:border-emerald-400 shadow-emerald-900/40 hover:shadow-emerald-900/60' :
                 'bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 shadow-blue-900/40 hover:shadow-blue-900/60'
               }`}
               onClick={handleGenerate}
               disabled={!prompt || !hasProductImages}
             >
                {getSubmitLabel()}
             </Button>
         )}
      </div>
    </div>
  );
};

export default CampaignForm;