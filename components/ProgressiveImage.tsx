import React, { useState, useRef, useEffect, memo } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * ProgressiveImage Component
 * Shows a blurred low-quality preview while the full image loads,
 * then transitions smoothly to the full resolution image.
 */
const ProgressiveImage: React.FC<ProgressiveImageProps> = memo(({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  onLoad,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Create a tiny blurred version using canvas for placeholder
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');

  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
    setShowPlaceholder(true);
    
    // Generate tiny placeholder for blur effect
    const generatePlaceholder = async () => {
      try {
        // For base64 images, create a tiny version
        if (src.startsWith('data:')) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = src;
          
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Create a very small version (10px wide)
            const aspectRatio = img.height / img.width;
            canvas.width = 10;
            canvas.height = Math.round(10 * aspectRatio);
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setBlurDataUrl(canvas.toDataURL('image/jpeg', 0.1));
          };
        } else {
          // For URLs, just show a gradient placeholder
          setBlurDataUrl('');
        }
      } catch (e) {
        setBlurDataUrl('');
      }
    };
    
    generatePlaceholder();
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    // Delay hiding placeholder for smooth transition
    setTimeout(() => setShowPlaceholder(false), 300);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    setShowPlaceholder(false);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Placeholder / Skeleton */}
      {showPlaceholder && (
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'} ${placeholderClassName}`}
        >
          {blurDataUrl ? (
            // Blurred tiny image
            <img 
              src={blurDataUrl}
              alt=""
              className="w-full h-full object-cover filter blur-xl scale-110"
              aria-hidden="true"
            />
          ) : (
            // Animated gradient placeholder
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500">
          <div className="text-center p-4">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Main Image */}
      {!isError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

export default ProgressiveImage;
