import React, { useState } from 'react';
import { GeneratedAsset, BrandProfile, GenerationState } from '../types';
import Button from './Button';

interface GalleryProps {
  galleryItems: GeneratedAsset[];
  selectedProfile: BrandProfile;
  isProcessing: boolean;
  status: GenerationState;
  hasMoreAssets: boolean;
  isLoadingGallery: boolean;
  handleLoadMore: () => void;
  handleRefresh: () => void;
  handleDeleteAsset: (asset: GeneratedAsset) => void;
  onEditAsset: (asset: GeneratedAsset) => void;
}

const Gallery: React.FC<GalleryProps> = ({
  galleryItems,
  selectedProfile,
  isProcessing,
  status,
  hasMoreAssets,
  isLoadingGallery,
  handleLoadMore,
  handleRefresh,
  handleDeleteAsset,
  onEditAsset
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null);

  const onDeleteClick = (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    setDeletingId(asset.id);
    // Wait for animation
    setTimeout(() => {
        handleDeleteAsset(asset);
        setDeletingId(null);
    }, 300);
  };

  const onEditClick = (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    onEditAsset(asset);
  };

  const forceDownload = async (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Visual feedback could be added here, but browser download starts quickly usually
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai_creative_${asset.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      // Fallback for CORS issues
      window.open(asset.url, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col">
       <div className="mb-6 flex items-end justify-between">
          <div>
             <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-white tracking-tight">Gallery</h2>
                 <button 
                   onClick={handleRefresh}
                   disabled={isLoadingGallery}
                   className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                   title="Refresh Gallery"
                 >
                   <svg className={`w-5 h-5 ${isLoadingGallery ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 </button>
             </div>
             <p className="text-zinc-500 text-sm mt-1">Generated assets for {selectedProfile.name}</p>
          </div>
          {galleryItems.length > 0 && (
             <div className="text-xs font-mono bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-zinc-400">
               {galleryItems.length} items
             </div>
          )}
       </div>

       {/* Progress Bar */}
       {isProcessing && (
         <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-8 overflow-hidden border border-zinc-800/50">
           <div 
             className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
             style={{ width: `${status.progress}%` }}
           />
         </div>
       )}

       {/* Lightbox / Preview Modal */}
       {previewAsset && (
         <div 
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
            onClick={() => setPreviewAsset(null)}
         >
            <button 
                onClick={() => setPreviewAsset(null)}
                className="absolute top-4 right-4 z-50 text-zinc-400 hover:text-white bg-zinc-900/50 p-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div 
                className="flex-1 flex flex-col items-center justify-center w-full h-full min-h-0 gap-6"
                onClick={e => e.stopPropagation()}
            >
               <img 
                  src={previewAsset.url} 
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-zinc-800" 
                  alt="Full Preview" 
               />
               
               <div className="flex gap-4">
                 <Button onClick={(e) => { e.stopPropagation(); onEditAsset(previewAsset); setPreviewAsset(null); }} className="shrink-0 shadow-xl shadow-indigo-900/20 bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit This
                 </Button>

                 <Button onClick={(e) => forceDownload(e, previewAsset)} className="shrink-0 shadow-xl shadow-indigo-900/20">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Original
                 </Button>
               </div>
            </div>
         </div>
       )}

       {/* Masonry Gallery Grid */}
       {galleryItems.length > 0 ? (
         <div className="columns-1 md:columns-2 gap-6 pb-6 space-y-6">
            {galleryItems.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => setPreviewAsset(asset)}
                className={`group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg hover:shadow-indigo-900/20 transition-all duration-300 hover:border-indigo-500/30 break-inside-avoid cursor-pointer ${deletingId === asset.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                 <img 
                   src={asset.url} 
                   alt="Generated Ad" 
                   className="w-full h-auto object-cover"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    
                    <div className="self-end flex gap-2">
                        <button 
                          onClick={(e) => onEditClick(e, asset)}
                          className="bg-zinc-800/80 hover:bg-indigo-600 hover:text-white text-zinc-300 p-2 rounded-lg backdrop-blur-md transition-all border border-zinc-700 hover:border-indigo-500"
                          title="Edit this asset"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={(e) => onDeleteClick(e, asset)}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 p-2 rounded-lg backdrop-blur-md transition-all border border-red-500/30"
                          title="Delete Creative"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>

                    <div>
                        <button
                          onClick={(e) => forceDownload(e, asset)}
                          className="w-full bg-white hover:bg-zinc-200 text-zinc-900 text-center py-2 rounded-lg font-bold text-xs backdrop-blur-sm transition-colors shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
                        >
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
       ) : (
         !isProcessing && (
           <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800/50 rounded-3xl bg-zinc-900/20 min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-lg font-medium text-zinc-500">Your canvas is empty</p>
              <p className="text-sm mt-1 max-w-xs text-center opacity-60">Fill in the campaign details on the left to start generating professional creatives.</p>
           </div>
         )
       )}

       {hasMoreAssets && galleryItems.length > 0 && (
          <div className="pb-20 text-center mt-6">
              <Button 
                variant="secondary" 
                onClick={handleLoadMore} 
                isLoading={isLoadingGallery}
                className="mx-auto"
              >
                Load Previous Generations
              </Button>
          </div>
       )}
    </div>
  );
};

export default Gallery;
