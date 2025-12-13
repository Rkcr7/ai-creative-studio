import React, { useState } from 'react';
import { BrandProfile } from '../types';
import Button from './Button';
import ImageUploader from './ImageUploader';
import TextEditorDialog from './TextEditorDialog';

interface ProfileManagerProps {
  profiles: BrandProfile[];
  selectedProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: BrandProfile) => void;
  onDeleteProfile: (id: string) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGuidelinesDialogOpen, setIsGuidelinesDialogOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [logos, setLogos] = useState<File[]>([]);
  const [existingLogoPreview, setExistingLogoPreview] = useState<string | undefined>(undefined);

  const startNew = () => {
    setName('');
    setGuidelines('');
    setLogos([]);
    setExistingLogoPreview(undefined);
    setEditingId(null);
    setIsEditing(true);
  };

  const startEdit = (profile: BrandProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setName(profile.name);
    setGuidelines(profile.guidelines);
    setLogos([]); // Files cannot be restored, but we show the preview
    setExistingLogoPreview(profile.logoPreview);
    setEditingId(profile.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSave = async () => {
    if (!name || !guidelines) return;
    
    let logoDataUrl = existingLogoPreview;
    
    // If a new logo file was uploaded, convert it
    if (logos[0]) {
      try {
        logoDataUrl = await fileToBase64(logos[0]);
      } catch (e) {
        console.error("Error converting logo to base64", e);
      }
    }

    const newProfile: BrandProfile = {
      id: editingId || Date.now().toString(),
      name,
      guidelines,
      logo: logos[0] || null,
      logoPreview: logoDataUrl
    };

    onSaveProfile(newProfile);
    resetForm();
  };

  if (isEditing) {
    return (
      <>
      <TextEditorDialog 
        isOpen={isGuidelinesDialogOpen}
        onClose={() => setIsGuidelinesDialogOpen(false)}
        title="Brand Guidelines"
        initialValue={guidelines}
        onSave={setGuidelines}
        placeholder="Describe detailed color palette, tone of voice, typography rules, do's and don'ts..."
      />
      
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl space-y-5 animate-fadeIn">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
           {editingId ? 'Edit Brand Profile' : 'New Brand Profile'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Brand Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="e.g. Acme Fitness"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-zinc-300">Brand Guidelines</label>
                <button 
                  onClick={() => setIsGuidelinesDialogOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                   Expand Editor
                </button>
            </div>
            <textarea 
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm"
              placeholder="Describe color palette, tone, fonts, and key rules..."
            />
          </div>

          <div>
             {existingLogoPreview && logos.length === 0 && (
                <div className="mb-2">
                   <p className="text-xs text-zinc-500 mb-1">Current Logo:</p>
                   <img src={existingLogoPreview} alt="Current Logo" className="w-12 h-12 rounded border border-zinc-700 object-contain bg-zinc-900" />
                </div>
             )}
            <ImageUploader 
                label={existingLogoPreview ? "Update Logo (Optional)" : "Brand Logo"} 
                files={logos} 
                onChange={setLogos} 
                maxFiles={1} 
                helperText="High-res PNG recommended."
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={!name || !guidelines} className="flex-1">
            {editingId ? 'Update Profile' : 'Create Profile'}
          </Button>
          <Button variant="ghost" onClick={resetForm}>Cancel</Button>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Your Brands</h2>
        <button 
          onClick={startNew}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md transition-colors border border-zinc-700"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {profiles.length === 0 && (
          <div className="text-zinc-500 text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
             <p className="text-sm">No profiles yet.</p>
             <p className="text-xs mt-1">Create one to get started.</p>
          </div>
        )}
        
        {profiles.map(profile => (
          <div 
            key={profile.id}
            onClick={() => onSelectProfile(profile.id)}
            className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedProfileId === profile.id 
                ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' 
                : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-800 shrink-0">
                {profile.logoPreview ? (
                  <img src={profile.logoPreview} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-500 font-bold text-xs">{profile.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-medium text-sm truncate ${selectedProfileId === profile.id ? 'text-indigo-200' : 'text-zinc-200'}`}>
                  {profile.name}
                </h4>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{profile.guidelines}</p>
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 backdrop-blur rounded-lg p-1 border border-zinc-700/50">
              <button 
                onClick={(e) => startEdit(profile, e)}
                className="text-zinc-400 hover:text-indigo-400 p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                title="Edit"
              >
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}
                className="text-zinc-400 hover:text-red-400 p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileManager;