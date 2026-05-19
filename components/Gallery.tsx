import React, { useState, useCallback, memo } from 'react';
import { GeneratedAsset, BrandProfile, GenerationState } from '../types';
import Button from './Button';
import ProgressiveImage from './ProgressiveImage';
import { SkeletonGallery } from './Skeleton';

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

// Memoized gallery item component for performance
const GalleryItem = memo<{
  asset: GeneratedAsset;
  isDeleting: boolean;
  onPreview: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
}>(({ asset, isDeleting, onPreview, onEdit, onDelete, onDownload }) => (
  <div 
    onClick={onPreview}
    className={`group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg hover:shadow-indigo-900/20 transition-all duration-300 hover:border-indigo-500/30 break-inside-avoid cursor-pointer ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    role="button"
    tabIndex={0}
    aria-label={`View asset ${asset.id}`}
    onKeyDown={(e) => e.key === 'Enter' && onPreview()}
  >
    <ProgressiveImage
      src={asset.url}
      alt="Generated Creative"
      className="w-full aspect-auto"
    />
    
    {/* Overlay on hover/touch */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col justify-between p-3 sm:p-4">
      
      {/* Top actions */}
      <div className="self-end flex gap-2">
        <button 
          onClick={onEdit}
          className="bg-zinc-800/80 hover:bg-indigo-600 hover:text-white text-zinc-300 p-2 sm:p-2.5 rounded-lg backdrop-blur-md transition-all border border-zinc-700 hover:border-indigo-500 touch-manipulation"
          title="Edit this asset"
          aria-label="Edit asset"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button 
          onClick={onDelete}
          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 p-2 sm:p-2.5 rounded-lg backdrop-blur-md transition-all border border-red-500/30 touch-manipulation"
          title="Delete Creative"
          aria-label="Delete asset"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* Bottom download button */}
      <div>
        <button
          onClick={onDownload}
          className="w-full bg-white hover:bg-zinc-200 text-zinc-900 text-center py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm backdrop-blur-sm transition-colors shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide touch-manipulation active:scale-95"
          aria-label="Download asset"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download
        </button>
      </div>
    </div>
  </div>
));

GalleryItem.displayName = 'GalleryItem';

const Gallery: React.FC<GalleryProps> = memo(({
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

  const onDeleteClick = useCallback((e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    setDeletingId(asset.id);
    // Wait for animation then delete
    requestAnimationFrame(() => {
      setTimeout(() => {
        handleDeleteAsset(asset);
        setDeletingId(null);
      }, 280);
    });
  }, [handleDeleteAsset]);

  const onEditClick = useCallback((e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    onEditAsset(asset);
  }, [onEditAsset]);

  const forceDownload = useCallback(async (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    e.preventDefault();
    
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
      window.open(asset.url, '_blank');
    }
  }, []);

  const closePreview = useCallback(() => setPreviewAsset(null), []);

  // Handle keyboard navigation in preview
  const handlePreviewKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePreview();
    }
  }, [closePreview]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">Gallery</h2>
            <button 
              onClick={handleRefresh}
              disabled={isLoadingGallery}
              className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors shrink-0 touch-manipulation"
              title="Refresh Gallery"
              aria-label="Refresh gallery"
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoadingGallery ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 truncate">Generated assets for {selectedProfile.name}</p>
        </div>
        {galleryItems.length > 0 && (
          <div className="text-xs font-mono bg-zinc-900 px-2 sm:px-3 py-1 rounded-full border border-zinc-800 text-zinc-400 shrink-0">
            {galleryItems.length} items
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="w-full bg-zinc-900 rounded-full h-1.5 sm:h-2 mb-6 sm:mb-8 overflow-hidden border border-zinc-800/50">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${status.progress}%` }}
            role="progressbar"
            aria-valuenow={status.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewAsset && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn cursor-zoom-out"
          onClick={closePreview}
          onKeyDown={handlePreviewKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          tabIndex={-1}
        >
          <button 
            onClick={closePreview}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 text-zinc-400 hover:text-white bg-zinc-900/50 p-2 sm:p-2.5 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors touch-manipulation"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div 
            className="flex-1 flex flex-col items-center justify-center w-full h-full min-h-0 gap-4 sm:gap-6 py-10 sm:py-0"
            onClick={e => e.stopPropagation()}
          >
            <ProgressiveImage
              src={previewAsset.url}
              alt="Full Preview"
              className="max-h-[70vh] sm:max-h-full max-w-full rounded-lg shadow-2xl border border-zinc-800"
            />
            
            <div className="flex gap-3 sm:gap-4 flex-wrap justify-center px-4">
              <Button 
                onClick={(e) => { e.stopPropagation(); onEditAsset(previewAsset); setPreviewAsset(null); }} 
                className="shrink-0 shadow-xl shadow-indigo-900/20 bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-700 text-sm sm:text-base py-2.5 sm:py-3"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit This
              </Button>

              <Button 
                onClick={(e) => forceDownload(e, previewAsset)} 
                className="shrink-0 shadow-xl shadow-indigo-900/20 text-sm sm:text-base py-2.5 sm:py-3"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Original
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoadingGallery && galleryItems.length === 0 && (
        <SkeletonGallery count={4} />
      )}

      {/* Masonry Gallery Grid */}
      {galleryItems.length > 0 ? (
        <div className="columns-1 sm:columns-2 gap-4 sm:gap-6 pb-6 space-y-4 sm:space-y-6">
          {galleryItems.map((asset) => (
            <GalleryItem
              key={asset.id}
              asset={asset}
              isDeleting={deletingId === asset.id}
              onPreview={() => setPreviewAsset(asset)}
              onEdit={(e) => onEditClick(e, asset)}
              onDelete={(e) => onDeleteClick(e, asset)}
              onDownload={(e) => forceDownload(e, asset)}
            />
          ))}
        </div>
      ) : (
        !isProcessing && !isLoadingGallery && (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800/50 rounded-2xl sm:rounded-3xl bg-zinc-900/20 min-h-[300px] sm:min-h-[500px] p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-base sm:text-lg font-medium text-zinc-500">Your canvas is empty</p>
            <p className="text-xs sm:text-sm mt-1 max-w-xs text-center opacity-60">Fill in the campaign details to start generating professional creatives.</p>
          </div>
        )
      )}

      {/* Load More Button */}
      {hasMoreAssets && galleryItems.length > 0 && (
        <div className="pb-20 text-center mt-4 sm:mt-6">
          <Button 
            variant="secondary" 
            onClick={handleLoadMore} 
            isLoading={isLoadingGallery}
            className="mx-auto text-sm sm:text-base"
          >
            Load Previous Generations
          </Button>
        </div>
      )}
    </div>
  );
});

Gallery.displayName = 'Gallery';

export default Gallery;
