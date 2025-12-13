import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface TextEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue: string;
  onSave: (value: string) => void;
  placeholder?: string;
}

const TextEditorDialog: React.FC<TextEditorDialogProps> = ({
  isOpen, onClose, title, initialValue, onSave, placeholder
}) => {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setText(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative animate-scaleIn">
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 rounded-t-2xl">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 rounded text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
             </div>
             <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
        </div>
        
        <div className="flex-1 p-4 bg-zinc-950/50">
            <textarea
                className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-base text-zinc-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none font-mono leading-relaxed placeholder:text-zinc-700"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                autoFocus
            />
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 rounded-b-2xl flex justify-between items-center">
            <span className="text-xs text-zinc-500">
                {text.length} characters
            </span>
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={() => { onSave(text); onClose(); }}>Save Changes</Button>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TextEditorDialog;