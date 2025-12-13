import React from 'react';
import { LOGO_URL } from '../constants';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-zinc-400 animate-fadeIn">
      <div className="bg-zinc-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/5 max-w-lg text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="w-32 h-32 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">AI Creative Studio</h2>
        <p className="mb-8 text-zinc-400 leading-relaxed">AI-powered studio for generating ad creatives and visual assets.</p>
        
        <div className="flex flex-col gap-3">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Get Started</p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
            <span className="text-sm">Select a profile from the sidebar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
