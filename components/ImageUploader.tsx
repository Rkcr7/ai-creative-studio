import React, { useEffect, useState } from 'react';

interface ImageUploaderProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  helperText?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  files, 
  onChange, 
  maxFiles = 1,
  helperText
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combinedFiles = [...files, ...newFiles].slice(0, maxFiles);
      onChange(combinedFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <span className="text-zinc-500 text-xs font-mono">{files.length}/{maxFiles}</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {previews.map((src, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 shadow-sm">
            <img src={src} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => removeFile(index)}
                className="bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 backdrop-blur-sm transition-transform hover:scale-110"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}

        {files.length < maxFiles && (
          <label className="aspect-square flex flex-col items-center justify-center border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-zinc-800/30 transition-all group">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-2 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
               <svg className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 group-hover:text-zinc-300">Add</span>
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
      {helperText && <p className="text-xs text-zinc-500 leading-relaxed">{helperText}</p>}
    </div>
  );
};

export default ImageUploader;