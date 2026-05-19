import React, { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

/**
 * Skeleton Component
 * Displays a placeholder animation while content is loading
 */
const Skeleton: React.FC<SkeletonProps> = memo(({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer'
}) => {
  const baseClasses = 'bg-zinc-800 relative overflow-hidden';
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: '',
    none: ''
  };
  
  const style: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
      role="presentation"
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
});

Skeleton.displayName = 'Skeleton';

// Preset components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = memo(({ className = '' }) => (
  <div className={`bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 ${className}`}>
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonGallery: React.FC<{ count?: number }> = memo(({ count = 4 }) => (
  <div className="columns-1 md:columns-2 gap-6 space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="break-inside-avoid bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
        style={{ height: `${200 + Math.random() * 150}px` }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    ))}
  </div>
));

SkeletonGallery.displayName = 'SkeletonGallery';

export default Skeleton;
