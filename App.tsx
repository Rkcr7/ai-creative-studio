import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrandProfile, GeneratedAsset, GenerationState, AspectRatio, ImageSize, CreativeMode } from './types';
import SettingsDialog from './components/SettingsDialog';
import TextEditorDialog from './components/TextEditorDialog';
import { generateComprehensiveCreative } from './services/geminiService';
import { db } from './services/db';
import { Session } from '@supabase/supabase-js';

// Modular Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import CampaignForm from './components/CampaignForm';
import VisualAssets from './components/VisualAssets';
import Gallery from './components/Gallery';
import LoginScreen from './components/LoginScreen';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const GALLERY_PAGE_SIZE = 10;
const ALLOWED_DOMAIN = 'yourdomain.com'; // Change this to your domain

// --- DEVELOPMENT CONFIGURATION ---
// Set this to true to bypass Google Sign-In during development.
// Set to false for production to enforce authentication.
const BYPASS_AUTH = true;

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- APP STATE ---
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Large Text Editor State
  const [editingField, setEditingField] = useState<'prompt' | 'details' | null>(null);

  // Images State
  // Modes 1 & 2 (Ad & Asset):
  const [inspirationImages, setInspirationImages] = useState<File[]>([]);
  const [productImages, setProductImages] = useState<File[]>([]);
  
  // Mode 3 (Edit):
  const [editSourceImage, setEditSourceImage] = useState<File[]>([]); // Max 1
  const [editRefImages, setEditRefImages] = useState<File[]>([]); // Max 3
  
  // Inputs
  const [creativeMode, setCreativeMode] = useState<CreativeMode>(CreativeMode.AD_CREATIVE);
  const [prompt, setPrompt] = useState(''); // Campaign Goal / Copy OR Visual Prompt
  const [productDetails, setProductDetails] = useState('');
  const [includeGuidelines, setIncludeGuidelines] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [count, setCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);

  // Gallery
  const [galleryItems, setGalleryItems] = useState<GeneratedAsset[]>([]);
  const [galleryPage, setGalleryPage] = useState(0);
  const [hasMoreAssets, setHasMoreAssets] = useState(true);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const [status, setStatus] = useState<GenerationState>({
    isAnalyzing: false,
    isGenerating: false,
    progress: 0,
    statusMessage: ''
  });

  const [hasApiKey, setHasApiKey] = useState(false);
  
  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- AUTH INITIALIZATION & GUARD ---
  useEffect(() => {
    // DEVELOPMENT BYPASS MODE
    if (BYPASS_AUTH) {
      console.warn("⚠️ Authentication Bypassed: Running in development mode.");
      const mockSession = {
        user: { 
          email: `developer@${ALLOWED_DOMAIN}`, 
          id: 'dev_user_id' 
        }
      } as Session;
      
      setSession(mockSession);
      setAuthError(null);
      setIsAuthChecking(false);
      loadProfiles(); // Load data immediately
      return;
    }

    // STANDARD AUTH FLOW
    // Check initial session
    db.getSession().then((sess) => {
      validateSession(sess);
      setIsAuthChecking(false);
    });

    // Listen for changes
    const subscription = db.onAuthStateChange((sess) => {
      validateSession(sess);
      setIsAuthChecking(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const validateSession = async (sess: Session | null) => {
    if (sess) {
      if (sess.user.email && sess.user.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        setSession(sess);
        setAuthError(null);
        // Load data only if authenticated
        loadProfiles();
      } else {
        // Invalid Domain
        await db.signOut();
        setSession(null);
        setAuthError(`Access Restricted: You must use an @${ALLOWED_DOMAIN} email address.`);
      }
    } else {
      setSession(null);
    }
  };

  const handleSignOut = async () => {
    await db.signOut();
    setSession(null);
    setProfiles([]);
    setSelectedProfileId(null);
    setAuthError(null);
  };

  // --- INITIAL LOAD & DB SYNC ---
  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      setDbConnected(db.isCloudEnabled());
      const data = await db.getProfiles();
      setProfiles(data);
    } catch (e) {
      console.error("Load profiles failed", e);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // --- GALLERY LOAD ---
  const fetchGallery = async (profileId: string, page: number, reset = false) => {
    if (!db.isCloudEnabled()) return;
    
    setIsLoadingGallery(true);
    try {
      const assets = await db.getAssets(profileId, page, GALLERY_PAGE_SIZE);
      if (reset) {
        setGalleryItems(assets);
      } else {
        setGalleryItems(prev => [...prev, ...assets]);
      }
      setHasMoreAssets(assets.length === GALLERY_PAGE_SIZE);
    } catch (e) {
      console.error("Fetch gallery failed", e);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (selectedProfileId) {
      setGalleryPage(0);
      setGalleryItems([]);
      setHasMoreAssets(true);
      fetchGallery(selectedProfileId, 0, true);
    } else {
      setGalleryItems([]);
    }
  }, [selectedProfileId]);

  const handleLoadMore = () => {
    if (selectedProfileId && hasMoreAssets && !isLoadingGallery) {
      const nextPage = galleryPage + 1;
      setGalleryPage(nextPage);
      fetchGallery(selectedProfileId, nextPage, false);
    }
  };

  const handleRefreshGallery = () => {
    if (selectedProfileId) {
      setGalleryPage(0);
      setHasMoreAssets(true);
      fetchGallery(selectedProfileId, 0, true);
    }
  };

  const handleDeleteAsset = async (asset: GeneratedAsset) => {
    // Optimistic UI Update
    setGalleryItems(prev => prev.filter(item => item.id !== asset.id));
    
    try {
      await db.deleteAsset(asset.id, asset.url);
    } catch (e) {
      console.error("Failed to delete asset", e);
    }
  };

  const handleEditAsset = async (asset: GeneratedAsset) => {
    try {
      // 1. Fetch image from URL
      const response = await fetch(asset.url);
      const blob = await response.blob();
      
      // 2. Create File object
      const filename = `source-${asset.id}.png`;
      const file = new File([blob], filename, { type: blob.type });
      
      // 3. Update State
      setEditSourceImage([file]);
      setCreativeMode(CreativeMode.EDIT_ASSET);
      setAspectRatio(AspectRatio.ORIGINAL);
      setPrompt(''); // Clear prompt so user can type new edit instructions
      setIncludeGuidelines(true); // Default to true when entering edit mode
      setIncludeLogo(false); // Default false for edit mode
      // setEditingField('prompt'); // Removed: Do not open editor automatically
      
    } catch (e) {
      console.error("Failed to load image for editing", e);
      setToast({ message: "Could not load image for editing.", type: 'error' });
    }
  };

  // --- API KEY CHECK ---
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            setHasApiKey(true);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // --- ACTIONS ---
  const handleProfileSave = async (profile: BrandProfile) => {
    setProfiles(prev => {
        const exists = prev.find(p => p.id === profile.id);
        if (exists) return prev.map(p => p.id === profile.id ? profile : p);
        return [profile, ...prev]; 
    });
    setSelectedProfileId(profile.id);

    try {
        await db.saveProfile(profile);
    } catch (e) {
        console.error("Failed to save to DB", e);
        setToast({ message: "Failed to save profile. Check connection.", type: 'error' });
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Delete this profile and its data?")) return;
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (selectedProfileId === id) setSelectedProfileId(null);
    try {
        await db.deleteProfile(id);
    } catch (e) {
        console.error("Failed to delete", e);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus({
        isAnalyzing: false,
        isGenerating: false,
        progress: 0,
        statusMessage: 'Cancelled'
      });
      setToast({ message: "Generation Cancelled", type: 'info' });
    }
  };

  const handleGenerate = async () => {
    const selectedProfile = profiles.find(p => p.id === selectedProfileId);
    if (!selectedProfile) return;

    if (!hasApiKey) {
        await handleSelectKey();
    }

    // Initialize new AbortController
    abortControllerRef.current = new AbortController();

    setStatus({
      isAnalyzing: false,
      isGenerating: true,
      progress: 0,
      statusMessage: `Initializing...`
    });

    try {
      // Determine which images to send based on mode
      let activeProductImages: File[] = [];
      let activeInspirationImages: File[] = [];

      if (creativeMode === CreativeMode.EDIT_ASSET) {
        activeProductImages = editSourceImage; // "Source" image treated as product image in service
        activeInspirationImages = editRefImages;
      } else {
        activeProductImages = productImages;
        activeInspirationImages = inspirationImages;
      }

      for (let i = 0; i < count; i++) {
        // Check for cancellation before starting next iteration
        if (abortControllerRef.current.signal.aborted) {
           throw new Error("Cancelled by user");
        }

        const displayCount = `${i + 1}/${count}`;
        setStatus(prev => ({
          ...prev,
          progress: Math.floor(((i) / count) * 100),
          statusMessage: `Generating ${displayCount}`
        }));

        try {
          const result = await generateComprehensiveCreative(
            selectedProfile,
            activeProductImages,
            activeInspirationImages,
            prompt,
            productDetails,
            aspectRatio,
            imageSize,
            i + 1,
            creativeMode, // Pass current mode
            includeGuidelines, // Pass guidelines check state
            includeLogo, // Pass logo check state
            (statusUpdate) => {
              // Update status message on retry
              setStatus(prev => ({
                ...prev,
                statusMessage: statusUpdate
              }));
            },
            abortControllerRef.current.signal // Pass signal to service
          );
          
          // Create temporary local asset
          const tempId = Date.now().toString() + i;
          const newAsset: GeneratedAsset = {
            id: tempId,
            url: result.url,
            promptUsed: result.prompt,
            aspectRatio: aspectRatio
          };
          
          // Prepend to gallery immediately
          setGalleryItems(prev => [newAsset, ...prev]);
          
          // Save to DB in background
          if (db.isCloudEnabled()) {
             // Pass full selectedProfile object to allow auto-sync if profile missing in DB
             db.saveAsset(selectedProfile, result.url, result.prompt, aspectRatio)
               .then(savedAsset => {
                  if (savedAsset) {
                    // Swap temp ID with real DB ID to ensure deletion works later
                    setGalleryItems(prev => prev.map(item => item.id === tempId ? { ...item, id: savedAsset.id } : item));
                  }
               });
          }

        } catch (e) {
          if (abortControllerRef.current.signal.aborted) throw new Error("Cancelled by user");
          console.error(`Failed to generate image ${i+1}`, e);
          throw e; // Rethrow to stop the batch loop and show error
        }
      }

      setStatus({
        isAnalyzing: false,
        isGenerating: false,
        progress: 100,
        statusMessage: 'Production complete.'
      });
      setToast({ message: "All assets generated successfully!", type: 'success' });

    } catch (error: any) {
      const errorStr = error.message || JSON.stringify(error);
      
      // Clean Cancellation handling
      if (errorStr === "Cancelled by user" || errorStr.includes("Cancelled")) {
          setStatus({
            isAnalyzing: false,
            isGenerating: false,
            progress: 0,
            statusMessage: 'Generation cancelled.'
          });
          return;
      }

      console.error(error);
      
      // Improved Error Messaging for the User
      let userMessage = 'Error during production.';
      
      if (errorStr.includes("503") || errorStr.includes("UNAVAILABLE") || errorStr.includes("overloaded")) {
          userMessage = "Model Overloaded: Please try again in a few moments.";
      } else if (errorStr.includes("Requested entity was not found") || errorStr.includes("404")) {
          userMessage = "API Key Error: Please re-select your paid GCP Project.";
          setHasApiKey(false);
          await handleSelectKey();
      } else {
          // Clean up JSON error messages for display
          try {
             const parsed = JSON.parse(errorStr);
             if (parsed.error && parsed.error.message) userMessage = parsed.error.message;
          } catch(e) {
             userMessage = error.message || "Unknown error occurred.";
          }
      }

      setStatus({
        isAnalyzing: false,
        isGenerating: false,
        progress: 0,
        statusMessage: userMessage
      });

      // TRIGGER TOAST NOTIFICATION
      setToast({
        message: userMessage,
        type: 'error'
      });
    }
  };

  // Check valid inputs to enable button
  const hasRequiredImages = creativeMode === CreativeMode.EDIT_ASSET 
    ? editSourceImage.length > 0
    : productImages.length > 0;

  // --- RENDER ---
  if (isAuthChecking) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
         <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-zinc-500 text-sm">Verifying Access...</span>
         </div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen errorMsg={authError} />;
  }

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const isProcessing = status.isAnalyzing || status.isGenerating;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onConfigSaved={loadProfiles} 
      />

      <TextEditorDialog
        isOpen={editingField === 'prompt'}
        onClose={() => setEditingField(null)}
        title={creativeMode === CreativeMode.AD_CREATIVE ? "Campaign Goal & Copy" : (creativeMode === CreativeMode.EDIT_ASSET ? "Editing Instructions" : "Visual Prompt")}
        initialValue={prompt}
        onSave={setPrompt}
        placeholder={creativeMode === CreativeMode.AD_CREATIVE 
          ? "What are we promoting? What's the mood? Any specific text?" 
          : (creativeMode === CreativeMode.EDIT_ASSET ? "What should be changed? e.g. 'Remove the background', 'Add snow', 'Change color to red'." : "Describe the scene, lighting, mood, background")
        }
      />

      <TextEditorDialog
        isOpen={editingField === 'details'}
        onClose={() => setEditingField(null)}
        title="Product Details"
        initialValue={productDetails}
        onSave={setProductDetails}
        placeholder="Key features, materials, pricing, or selling points..."
      />

      <Sidebar 
        profiles={profiles}
        isLoadingProfiles={isLoadingProfiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={setSelectedProfileId}
        onSaveProfile={handleProfileSave}
        onDeleteProfile={handleDeleteProfile}
        hasApiKey={hasApiKey}
        handleSelectKey={handleSelectKey}
        dbConnected={dbConnected}
        setIsSettingsOpen={setIsSettingsOpen}
        onSignOut={handleSignOut}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950">
        
        <Header 
          selectedProfile={selectedProfile}
          dbConnected={dbConnected}
          isProcessing={isProcessing}
        />

        {/* Content Area - Split View on Desktop */}
        <div className="flex-1 overflow-hidden relative">
           <ErrorBoundary onError={(error) => setToast({ message: error.message, type: 'error' })}>
             {selectedProfile ? (
               <div className="h-full w-full overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/50">
                 
                 {/* Left Panel: Campaign Inputs - Independently Scrollable on Desktop */}
                 <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto custom-scrollbar bg-zinc-900/5">
                     <div className="p-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-6 max-w-2xl mx-auto lg:mx-0 safe-area-inset-bottom">
                         <ErrorBoundary>
                           <CampaignForm 
                             mode={creativeMode}
                             setMode={setCreativeMode}
                             prompt={prompt} setPrompt={setPrompt}
                             productDetails={productDetails} setProductDetails={setProductDetails}
                             includeGuidelines={includeGuidelines} setIncludeGuidelines={setIncludeGuidelines}
                             includeLogo={includeLogo} setIncludeLogo={setIncludeLogo}
                             count={count} setCount={setCount}
                             imageSize={imageSize} setImageSize={setImageSize}
                             aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                             setEditingField={setEditingField}
                             handleGenerate={handleGenerate}
                             handleCancel={handleCancel}
                             isProcessing={isProcessing}
                             status={status}
                             hasProductImages={hasRequiredImages}
                           />
                         </ErrorBoundary>
                         
                         <ErrorBoundary>
                           <VisualAssets 
                              mode={creativeMode}
                              productImages={productImages}
                              setProductImages={setProductImages}
                              inspirationImages={inspirationImages}
                              setInspirationImages={setInspirationImages}
                              editSourceImage={editSourceImage}
                              setEditSourceImage={setEditSourceImage}
                              editRefImages={editRefImages}
                              setEditRefImages={setEditRefImages}
                           />
                         </ErrorBoundary>
                     </div>
                 </div>

                 {/* Right Panel: Gallery - Independently Scrollable on Desktop */}
                 <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto custom-scrollbar bg-zinc-950/30 shadow-inner">
                     <div className="p-4 sm:p-6 lg:p-10 h-full safe-area-inset-bottom">
                         <ErrorBoundary>
                           <Gallery 
                             galleryItems={galleryItems}
                             selectedProfile={selectedProfile}
                             isProcessing={isProcessing}
                             status={status}
                             hasMoreAssets={hasMoreAssets}
                             isLoadingGallery={isLoadingGallery}
                             handleLoadMore={handleLoadMore}
                             handleRefresh={handleRefreshGallery}
                             handleDeleteAsset={handleDeleteAsset}
                             onEditAsset={handleEditAsset}
                           />
                         </ErrorBoundary>
                     </div>
                 </div>

               </div>
             ) : (
               <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-10">
                  <WelcomeScreen />
               </div>
             )}
           </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default App;
