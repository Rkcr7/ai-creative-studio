import React from 'react';
import { BrandProfile, GenerationState } from '../types';

interface HeaderProps {
  selectedProfile: BrandProfile | undefined;
  dbConnected: boolean;
  isProcessing: boolean;
}

const Header: React.FC<HeaderProps> = ({ selectedProfile, dbConnected, isProcessing }) => {
  return (
    <header className="h-16 border-b border-zinc-800/60 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-xl z-10 sticky top-0">
       <div className="flex items-center gap-4">
          {selectedProfile ? (
             <div className="flex items-center gap-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    {selectedProfile.logoPreview ? 
                        <img src={selectedProfile.logoPreview} className="w-full h-full object-cover" alt={selectedProfile.name}/> : 
                        <span className="text-xs font-bold">{selectedProfile.name.substring(0, 2).toUpperCase()}</span>
                    }
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">{selectedProfile.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                       <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`}></span>
                       {dbConnected ? 'Supabase Connected' : 'Local Session'}
                    </div>
                </div>
             </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
               <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
               No Profile Selected
            </div>
          )}
       </div>
       
       {isProcessing && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-medium animate-pulse">
             <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
             Processing...
          </div>
       )}
    </header>
  );
};

export default Header;