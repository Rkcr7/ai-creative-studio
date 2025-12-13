# 🎨 AI Creative Studio

## What is it?

**AI Creative Studio** is an AI-powered creative asset generator designed for marketers, designers, and brand managers. It uses Google's **Gemini AI** (multimodal image generation) to create professional marketing visuals, product shots, and ad creatives in seconds.

Built for efficiency, the app allows you to maintain brand consistency across all generated assets by storing brand profiles with guidelines and logos.

---

## 🚀 Key Features

### 1. **Three Creative Modes**

| Mode | Description | Best For |
|------|-------------|----------|
| **🎯 Ad Creative** | Creates "stop-the-scroll" ad visuals optimized for high CTR and conversions | Facebook, Instagram, Meta ads |
| **🖼️ Asset Generation** | Generates product shots, compositions, graphics, stickers, and visual art | Product photography, social posts |
| **✏️ Edit Asset** | Modify existing images with AI-powered edits | Background removal, style changes, enhancements |

---

### 2. **Brand Profile Management**

- Create and save **unlimited brand profiles**
- Store **brand guidelines** (tone, colors, style preferences)
- Upload **brand logos** for automatic integration
- Switch between brands instantly

---

### 3. **Smart Image Inputs**

- **Product Images** - Upload your actual product for accurate representation
- **Inspiration/Reference Images** - AI mimics the style, lighting, and mood
- **Source Image (Edit Mode)** - Select any image to modify

---

### 4. **Flexible Output Options**

#### Aspect Ratios
- `1:1` - Square (Instagram Feed)
- `4:5` - Portrait (Instagram/Facebook Feed)
- `9:16` - Mobile Full Screen (Stories, Reels, TikTok)
- `16:9` - Cinematic (YouTube Thumbnails)
- `3:2`, `2:3`, `3:4`, `4:3`, `5:4` - Standard formats
- `21:9` - Ultrawide
- `Original` - Preserve source image ratio (Edit mode only)

#### Resolution Options
- **1K** - Fast generation, good for previews
- **2K** - Balanced quality and speed
- **4K** - Maximum quality for final assets

#### Batch Generation
- Generate **1-10 variations** in a single run
- Each variation gets unique treatment while maintaining brand consistency

---

### 5. **Gallery & Asset Management**

- **Live Preview** - Generated assets appear instantly in the gallery
- **Persistent Storage** - All assets saved to Supabase cloud storage
- **Pagination** - Load more assets as needed
- **Quick Actions**:
  - 🗑️ **Delete** - Remove unwanted assets
  - ✏️ **Edit** - Send any gallery asset to Edit mode for modifications

---

### 6. **AI Intelligence**

#### Ad Creative Mode
- Acts as a **Meta Ad Creative Strategist**
- Preserves product integrity (colors, labels, details)
- Integrates brand logo naturally
- Optimizes composition for the selected aspect ratio

#### Asset Generation Mode
- Acts as a **Visual Artist & Product Photographer**
- Supports various styles: photography, graphics, collages, stickers
- Adapts to your prompt (clean shots vs. creative compositions)

#### Edit Mode
- **Non-destructive editing** - Source is preserved
- Can use reference images for style transfer
- Maintains original aspect ratio option

---

### 7. **Enterprise-Ready Features**

- **Google Authentication** - Restrict access to your domain
- **Domain Allowlist** - Only `@yourcompany.com` emails can sign in
- **Development Bypass** - Easy local testing without auth
- **Cloud Sync** - All data stored in Supabase (PostgreSQL + Storage)
- **Offline Fallback** - LocalStorage backup when cloud unavailable

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Build Tool** | Vite |
| **AI Engine** | Google Gemini API (`gemini-3-pro-image-preview`) |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage |
| **Authentication** | Supabase Auth (Google OAuth) |

---

## 📱 User Interface

### Sidebar
- Brand profile selector
- Create new profiles
- API key status indicator
- Database connection status
- Settings access

### Main Panel (Split View)
- **Left**: Campaign/editing form with all input controls
- **Right**: Gallery with generated assets

### Responsive Design
- **Desktop**: Side-by-side panels
- **Mobile**: Stacked layout with smooth scrolling

---

## 🔐 Security Notes

- **No credentials in code** - All secrets via environment variables
- **RLS Enabled** - Supabase Row Level Security for data protection
- **Domain Restricted** - Production mode requires approved email domain
- **API Keys** - Never exposed to client (processed server-side by Vite)

---

## 📂 Project Structure

```
creative-studio/
├── App.tsx              # Main application component
├── types.ts             # TypeScript interfaces & enums
├── constants.ts         # Configuration constants
├── vite.config.ts       # Build configuration
├── components/
│   ├── Button.tsx       # Reusable button component
│   ├── CampaignForm.tsx # Main form for all modes
│   ├── Gallery.tsx      # Asset gallery display
│   ├── Header.tsx       # Top navigation bar
│   ├── ImageUploader.tsx# Drag & drop image upload
│   ├── LoginScreen.tsx  # Google sign-in page
│   ├── ProfileManager.tsx# Brand profile CRUD
│   ├── SettingsDialog.tsx# Configuration modal
│   ├── Sidebar.tsx      # Left navigation panel
│   ├── TextEditorDialog.tsx # Expanded text editor
│   ├── Toast.tsx        # Notification popups
│   ├── VisualAssets.tsx # Image upload sections
│   └── WelcomeScreen.tsx# Initial onboarding
└── services/
    ├── db.ts            # Supabase database service
    └── geminiService.ts # Gemini AI integration
```

---

## 🎯 Use Cases

1. **E-commerce Teams** - Generate product ads at scale
2. **Social Media Managers** - Create platform-optimized visuals
3. **Marketing Agencies** - Manage multiple client brands
4. **Startups** - Professional creatives without a design team
5. **Content Creators** - Quick visual content for posts

---

## 📈 Performance Features

- **Retry Logic** - Automatic retry on API overload (503 errors)
- **Cancellation** - Stop generation mid-process
- **Progress Tracking** - Real-time status updates
- **Timeout Handling** - 80-second hard timeout per generation
- **Optimistic UI** - Instant gallery updates before cloud sync

---

## 🔮 Future Possibilities

- Video generation support
- Template library
- Team collaboration
- Export to Figma/Canva
- Analytics dashboard
- A/B testing integration
