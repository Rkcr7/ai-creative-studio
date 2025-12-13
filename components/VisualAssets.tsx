import React from 'react';
import ImageUploader from './ImageUploader';
import { MAX_INSPIRATION_IMAGES, MAX_PRODUCT_IMAGES } from '../constants';
import { CreativeMode } from '../types';

interface VisualAssetsProps {
  mode: CreativeMode;
  productImages: File[];
  setProductImages: (files: File[]) => void;
  inspirationImages: File[];
  setInspirationImages: (files: File[]) => void;
  // Edit Mode Specifics
  editSourceImage: File[];
  setEditSourceImage: (files: File[]) => void;
  editRefImages: File[];
  setEditRefImages: (files: File[]) => void;
}

const VisualAssets: React.FC<VisualAssetsProps> = ({
  mode,
  productImages, setProductImages,
  inspirationImages, setInspirationImages,
  editSourceImage, setEditSourceImage,
  editRefImages, setEditRefImages
}) => {
  
  if (mode === CreativeMode.EDIT_ASSET) {
      return (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6 mt-6">
           <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
             <h3 className="text-base font-semibold text-zinc-100">Editing Assets</h3>
           </div>
           
           <ImageUploader 
             label="Source Image (Required)"
             helperText="Upload the 1 image you want to edit."
             files={editSourceImage}
             onChange={setEditSourceImage}
             maxFiles={1}
           />

           <div className="w-full h-px bg-zinc-800/50"></div>

           <ImageUploader 
             label="Reference Images (Optional)"
             helperText="Add up to 3 images to guide the edit style."
             files={editRefImages}
             onChange={setEditRefImages}
             maxFiles={3}
           />
        </div>
      );
  }

  // Standard Mode
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6 mt-6">
       <div className="flex items-center gap-2 mb-2">
         <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
         </div>
         <h3 className="text-base font-semibold text-zinc-100">Visual Assets</h3>
       </div>
       
       <ImageUploader 
         label="Product Images"
         helperText={`Upload up to ${MAX_PRODUCT_IMAGES} shots of your product.`}
         files={productImages}
         onChange={setProductImages}
         maxFiles={MAX_PRODUCT_IMAGES}
       />

       <div className="w-full h-px bg-zinc-800/50"></div>

       <ImageUploader 
         label="Style Inspiration (Optional)"
         helperText="Upload visuals to guide the AI's aesthetic style."
         files={inspirationImages}
         onChange={setInspirationImages}
         maxFiles={MAX_INSPIRATION_IMAGES}
       />
    </div>
  );
};

export default VisualAssets;