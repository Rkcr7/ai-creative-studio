import React from 'react';
import ProfileManager from './ProfileManager';
import Button from './Button';
import { BrandProfile } from '../types';
import { LOGO_URL } from '../constants';

interface SidebarProps {
  profiles: BrandProfile[];
  isLoadingProfiles: boolean;
  selectedProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: BrandProfile) => void;
  onDeleteProfile: (id: string) => void;
  hasApiKey: boolean;
  handleSelectKey: () => void;
  dbConnected: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  profiles,
  isLoadingProfiles,
  selectedProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  hasApiKey,
  handleSelectKey,
  dbConnected,
  setIsSettingsOpen,
  onSignOut
}) => {
  return (
    <aside className="w-80 bg-zinc-950 border-r border-zinc-800/80 flex flex-col p-5 overflow-hidden shadow-2xl z-20">
      <div className="mb-6 flex items-center justify-between px-1">
         <div className="flex items-center gap-3">
             <div className="h-8 flex items-center shrink-0">
                <img src={LOGO_URL} alt="Logo" className="h-full w-auto object-contain" />
             </div>
             <div className="min-w-0">
               <h1 className="text-base font-bold text-white tracking-tight leading-none truncate" title="AI Creative Studio">AI Creative Studio</h1>
               <span className="text-xs text-zinc-500 font-medium tracking-wide">AI CREATIVE STUDIO</span>
             </div>
         </div>
      </div>

      {isLoadingProfiles ? (
           <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
               <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span className="text-xs">Syncing Profiles...</span>
           </div>
      ) : (
          <ProfileManager 
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={onSelectProfile}
            onSaveProfile={onSaveProfile}
            onDeleteProfile={onDeleteProfile}
          />
      )}

      <div className="mt-auto pt-4 border-t border-zinc-800 space-y-4">
        {!hasApiKey && (
           <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
              <p className="text-xs text-indigo-200 mb-2 font-medium">✨ Pro Features Locked</p>
              <Button onClick={handleSelectKey} className="w-full text-xs py-2 bg-indigo-600 hover:bg-indigo-500">Enable Gemini Pro</Button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block text-center text-[10px] text-zinc-500 mt-2 hover:text-indigo-400 transition-colors">Requires Paid GCP Project</a>
           </div>
        )}
        
        <button 
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 text-xs py-2 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
