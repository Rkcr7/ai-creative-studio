import React, { useState, useEffect } from 'react';
import Button from './Button';
import { getDbConfig, saveDbConfig } from '../services/db';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

const SQL_FIX = `-- Run this in your Supabase SQL Editor to fix RLS errors for Create & Delete

-- 1. Allow Public Access to Brand Profiles Table (CRUD)
alter table brand_profiles enable row level security;
drop policy if exists "Public Profiles Access" on brand_profiles;
create policy "Public Profiles Access" on brand_profiles for all using (true) with check (true);

-- 2. Allow Public Access to Generated Assets Table (CRUD)
alter table generated_assets enable row level security;
drop policy if exists "Public Assets Access" on generated_assets;
create policy "Public Assets Access" on generated_assets for all using (true) with check (true);

-- 3. Setup Storage Bucket and Policies
insert into storage.buckets (id, name, public) 
values ('creatives', 'creatives', true) 
on conflict (id) do nothing;

drop policy if exists "Public Uploads" on storage.objects;
create policy "Public Uploads" on storage.objects 
for insert with check ( bucket_id = 'creatives' );

drop policy if exists "Public Reads" on storage.objects;
create policy "Public Reads" on storage.objects 
for select using ( bucket_id = 'creatives' );

drop policy if exists "Public Deletes" on storage.objects;
create policy "Public Deletes" on storage.objects 
for delete using ( bucket_id = 'creatives' );
`;

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('');
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getDbConfig();
      setUrl(config.url || '');
      setKey(config.key || '');
      setStatus('');
      setShowSql(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveDbConfig(url, key);
    setStatus('Saved! Reloading profiles...');
    setTimeout(() => {
      onConfigSaved();
      onClose();
    }, 800);
  };

  const handleClear = () => {
    saveDbConfig('', '');
    setUrl('');
    setKey('');
    setStatus('Disconnected. Reverting to local storage...');
    setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_FIX);
    setStatus('SQL copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Database Settings</h3>
        <p className="text-zinc-400 text-sm mb-6">Connect to Supabase to persist profiles and assets.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">Supabase URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm focus:border-indigo-500 outline-none font-mono"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">Supabase Anon Key</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm focus:border-indigo-500 outline-none font-mono"
            />
          </div>

          {status && <p className="text-green-400 text-sm text-center font-medium animate-pulse">{status}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">Connect Database</Button>
            {url && (
                <Button onClick={handleClear} variant="danger" className="flex-1">Disconnect</Button>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-zinc-800">
             <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Troubleshooting & Setup</span>
                <button 
                  onClick={() => setShowSql(!showSql)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  {showSql ? 'Hide Script' : 'View SQL Setup Script'}
                </button>
             </div>
             
             {showSql && (
               <div className="space-y-2 animate-fadeIn">
                 <p className="text-xs text-zinc-400">
                   If you see <strong>"policy"</strong> errors, run this in your Supabase SQL Editor:
                 </p>
                 <div className="relative">
                   <textarea 
                     readOnly
                     value={SQL_FIX}
                     className="w-full h-32 bg-zinc-950/50 border border-zinc-700/50 rounded-lg p-3 text-[10px] font-mono text-zinc-300 resize-none outline-none"
                   />
                   <button 
                     onClick={copyToClipboard}
                     className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] px-2 py-1 rounded border border-zinc-700"
                   >
                     Copy
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;