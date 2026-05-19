import React, { useEffect, useState, useCallback, useRef, memo } from 'react';

interface ImageUploaderProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  helperText?: string;
}

/**
 * ImageUploader Component
 * Handles file uploads with preview, proper memory cleanup, and mobile optimization
 */
const ImageUploader: React.FC<ImageUploaderProps> = memo(({ 
  label, 
  files, 
  onChange, 
  maxFiles = 1,
  helperText
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const previewUrlsRef = useRef<string[]>([]);

  // Cleanup function to revoke all object URLs
  const cleanupPreviews = useCallback(() => {
    previewUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    previewUrlsRef.current = [];
  }, []);

  // Generate previews when files change
  useEffect(() => {
    // Cleanup old previews first
    cleanupPreviews();
    
    // Create new previews
    const newPreviews = files.map(file => {
      const url = URL.createObjectURL(file);
      previewUrlsRef.current.push(url);
      return url;
    });
    
    setPreviews(newPreviews);
    
    // Cleanup on unmount or when files change
    return () => {
      cleanupPreviews();
    };
  }, [files, cleanupPreviews]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combinedFiles = [...files, ...newFiles].slice(0, maxFiles);
      onChange(combinedFiles);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [files, maxFiles, onChange]);

  const removeFile = useCallback((index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onChange(newFiles);
  }, [files, onChange]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      const combinedFiles = [...files, ...droppedFiles].slice(0, maxFiles);
      onChange(combinedFiles);
    }
  }, [files, maxFiles, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="block text-xs sm:text-sm font-medium text-zinc-300">
          {label}
        </label>
        <span className="text-zinc-500 text-xs font-mono">{files.length}/{maxFiles}</span>
      </div>
      
      <div 
        className={`grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 ${isDragging ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900 rounded-xl' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {previews.map((src, index) => (
          <div 
            key={`${files[index]?.name}-${index}`} 
            className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 shadow-sm"
          >
            <img 
              src={src} 
              alt={`Preview ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => removeFile(index)}
                className="bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 sm:p-2 backdrop-blur-sm transition-transform hover:scale-110 touch-manipulation active:scale-95"
                aria-label={`Remove image ${index + 1}`}
                type="button"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}

        {files.length < maxFiles && (
          <label 
            className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all group touch-manipulation ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800/30'
            }`}
          >
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-colors ${
              isDragging 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'bg-zinc-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
            }`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 group-hover:text-zinc-300">
              {isDragging ? 'Drop' : 'Add'}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              multiple={maxFiles > 1}
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      
      {helperText && (
        <p className="text-[10px] sm:text-xs text-zinc-500 leading-relaxed">{helperText}</p>
      )}
    </div>
  );
});

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
