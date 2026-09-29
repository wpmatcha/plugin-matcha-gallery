# Matcha Gallery — Master Project Status & Context Contract

> **Permanent Memory File:** This document stores the complete architecture, technical decisions, bug fixes, feature splits (Free vs. Pro), and active roadmap for the Matcha Gallery project. If an AI session or chat context resets, read this file first to resume immediately without lost context. **Update this file whenever a new milestone, architectural change, or feature commit occurs.**

---

## 1. Project Overview & Commercial Strategy

* **Product Name:** Matcha Gallery (Free) / Matcha Gallery Pro
* **Current Free Version:** 1.0.2 (Approved & Live on WordPress.org — <10 Active Installs Growth Stage)
* **Tagline:** AI-Powered Smart Photo Wall, Masonry & Portfolio Studio for WordPress
* **Target Audience:** Photographers, designers, e-commerce stores, creative agencies, and portfolio owners who want intelligent auto-tagging, zero layout shift (CLS 0), and visual masonry galleries.
* **Pricing & Monetization Model:**
  * **Free:** Distributed via WordPress.org plugin directory (`https://wordpress.org/plugins/matcha-gallery/`). 100% free with BYOK (Bring Your Own Key) for Google Gemini and OpenAI.
  * **Pro:** Commercial add-on distributed via `wpmatcha.com`. Annual subscription ($49 single site / $99 5 sites / $199 agency unlimited).

---

## 2. Technical Stack & Standards

* **PHP:** PHP 8.0+ (Tested up to PHP 8.3). Modern OOP, strictly namespaced (`Matcha_AI_Smart_Gallery` for Free, `Matcha_Gallery_Pro` for Pro).
* **Security Standards:**
  * Strict nonce verification (`check_ajax_referer`, `X-WP-Nonce` in REST).
  * Capability checks (`upload_files`, `edit_post`, `manage_options`).
  * Strict sanitization on save and escaping on render (`esc_html`, `esc_attr`, `wp_kses_post`, `sanitize_hex_color`).
  * SSRF validation on all outbound AI endpoints (`validate_endpoint_url`).
* **Frontend Studio:**
  * Vanilla ES2020 JavaScript bundled via `esbuild` (`npm run build`). No heavy external frameworks for maximum performance.
* **Gutenberg Block:**
  * React 18 via WordPress core dependencies (`@wordpress/blocks`, `@wordpress/block-editor`, `@wordpress/element`, `@wordpress/components`).
* **Page Builder Integrations:**
  * Native Elementor Widget (`Matcha_Gallery_Widget`).
  * Native Gutenberg Block (`build/smart-gallery/`).
  * Native Shortcode Engine (`[matcha_gallery]`).

---

## 3. How the AI Vision Pipeline Works

```
Image Upload / Selection 
   │
   ▼
Frontend Studio Queue (index.js) 
   │ (Skips already-enriched images; sequential 1-by-1 runner)
   ▼
WordPress REST API (POST /matcha-gallery/v1/ai/analyze)
   │ (Nonce & capability check; SSRF guard)
   ▼
Image Downscaling (AI_REST.php)
   │ (Resizes temporary copy to 512px max dimension, base64 ~70KB)
   ▼
Gemini_Client / OpenAI_Client
   │ (Structured system prompt; JSON response mode; thinkingBudget: 0)
   ▼
Metadata Generator
   │ (Sanitizes title, alt text, caption, focal point X/Y, colors, keywords)
   ▼
Database Persistence
   ├─ Core Fields: _wp_attachment_image_alt, post_title, post_excerpt
   ├─ Post Meta: _matcha_ai_metadata, _matcha_ai_generated
   └─ Custom Taxonomy: matcha_keyword (terms assigned for fast SQL querying)
   ▼
Dynamic Gallery Wall
   └─ Client-side instant category filter pills & color swatch filtering
```

---

## 4. Free vs. Pro Feature Matrix

| Feature Area | **Free Version (`matcha-gallery`)** | **Pro Version (`matcha-gallery-pro`)** |
| :--- | :--- | :--- |
| **Distribution** | WordPress.org Repo | `wpmatcha.com` with auto-updater |
| **AI Vision Provider** | BYOK (Google Gemini Free Tier, OpenAI, OpenRouter) | BYOK + Pro License key support |
| **AI Enrichment** | Manual Batch in Studio (interactive progress) | Studio Batch + Unattended Server Queue (Roadmap) |
| **Generated Metadata** | Title, Alt Text, Caption, 4–6 Vision Keywords | Title, Alt, Caption, Keywords, Colors, Focal Zoom |
| **Smart Focal Point** | Centering only (`1.0x` zoom) | Custom Focal Point + **1.0x – 3.0x Zoom Scale** |
| **Layouts** | Grid, Masonry, Justified, Mosaic, **Curated Art Wall (Hero Triptych)** | Grid, Masonry, Justified, Mosaic, **Curated Art Wall (Salon, Staircase, Symmetric, Freeform Drag & 90° Frame Rotation)** + **Pinwheel, Bento, Custom Spans** |
| **Filtering Modes** | Single-select filter pills (`All`, `Cats`, `Nature`) | Single-select + **Multi-Select Faceted Checkbox Filtering** |
| **Toolbar & Controls Skins** | **Modern Capsule** (clean rounded pills, light & dark auto-adaptation) | **Modern Capsule** + **Minimalist Hairline**, **Obsidian Dark**, & **Frosted Glass** |
| **Color Swatches** | Colors extracted and saved in meta | **Interactive Color Swatch Filter Bar** (click color pill to filter) |
| **Smart Fill** | Triggers Pro Upgrade modal | **AI Smart Fill Geometry Matcher** (auto-arranges tile spans) |
| **Picture Framing** | Frameless Clean (Modern), **Matte Black Exhibition Molding** | Frameless Clean, **Matte Black, Natural Oak, Nordic White, Brushed Gold Brass, Glassmorphism Float** |
| **Aesthetic Themes** | Clean Minimalist | Clean Minimalist, Glassmorphic Frost, Matcha Glow Lift |
| **Preloaders** | Classic Matcha Spinner | Spinner, Soft Pulse, Shimmering Skeleton Boxes |
| **Pagination** | All Photos (No Pagination) | Infinite Smooth Scroll, Numbered Pages Navigation |
| **Client Proofing** | Not included | Itemized PDF/Print proofing sheet, Heart favorites |
| **Shoppable Hotspots** | Not included | WooCommerce product links & custom buy hotspots per image |
| **Multi-Section** | Single gallery collection | **Multi-Section Chapters** (e.g. Ceremony, Reception) |

---

## 5. Key Bugs Solved & Architectural Decisions

### 1. Google Gemini 2.5 Flash Token Truncation (Fixed)
* **Problem:** When analyzing images with `gemini-2.5-flash`, the API returned `finishReason: "MAX_TOKENS"`. The internal reasoning/thinking tokens consumed ~920 tokens, leaving only ~80 tokens for JSON. Gemini truncated output mid-string, causing PHP `json_decode()` to fail with HTTP 500.
* **Solution:**
  * Updated [Gemini_Client.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/AI/Gemini_Client.php) to increase `maxOutputTokens` from `1000` to `4000`.
  * Added `thinkingConfig => ['thinkingBudget' => 0]` in `generationConfig` to bypass reasoning tokens on pure JSON schema prompts.
  * Added regex markdown fence stripping for clean JSON parsing.

### 2. Rapid-Fire 429 Quota Exhaustion (Fixed)
* **Problem:** The Studio fired 2 parallel requests with a 400ms interval. A batch of 14 images hit Google Gemini Free Tier's 15 RPM / burst limit within 10 seconds, causing subsequent images to fail.
* **Solution:**
  * In [studio/src/index.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/studio/src/index.js), added **Smart Skip**: images with existing `ai_generated && keywords` are skipped immediately.
  * Set queue runner to sequential (concurrency 1) with an 800ms delay.
  * Added client-side exponential backoff on HTTP 429 (pauses 3s, 6s, 9s with status feedback).
  * Added server-side retry loop in [Gemini_Client.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/AI/Gemini_Client.php) with `sleep(2 * attempt)` on 429 and 503 responses.

### 3. Pro Licensing Integration (Completed in `matcha-gallery-pro`)
* **Architecture:**
  * [matcha-gallery-pro.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/matcha-gallery-pro.php) connects to Free Core via filters:
    * `matcha_gallery_is_pro` -> `License_Manager::is_valid()`
    * `matcha_gallery_allowed_layouts` -> unlocks `mosaic`, `pinwheel`, `bento`
    * `matcha_gallery_allowed_frames` -> unlocks luxury frames
    * `matcha_gallery_sanitize_config` -> preserves spans, shoppable links, chapters, focal zoom
  * [Updater.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/includes/Updater.php) provides GitHub / remote license-based automatic plugin updates.

### 4. Pro AI Architecture & Background Processing (Completed)
* **AI Smart Fill Geometry Matcher:**
  * Implemented in [studio/src/index.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/studio/src/index.js). Automatically reads photo aspect ratios and focal points, allocates `2x2` hero anchors and balanced `2x1` / `1x2` spans, sets layout to `mosaic`, and notifies with interactive visual toast.
* **Server-Side Unattended Background Queue:**
  * Implemented in [Background_Queue.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/includes/Background_Queue.php) and [Queue_REST.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/includes/Queue_REST.php).
  * Uses non-blocking asynchronous HTTP loops with WP-Cron fallback. Processes batches unattended with 2-second rate-limit protection so users can close their browser safely.
* **AI Brand Persona & Tone Presets:**
  * Added `ai_persona` setting in [Settings_Page.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/Admin/Settings_Page.php) for E-Commerce, Wedding/Portraits, Architecture/Interiors, and Editorial/Fashion.
  * Injected via `matcha_gallery_ai_system_prompt` filter hook in [matcha-gallery-pro.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/matcha-gallery-pro.php) to calibrate vision classification.
* **WooCommerce Shoppable Hotspots & Lightbox Buy Now:**
  * Implemented in [WooCommerce_Integration.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/includes/WooCommerce_Integration.php), Studio Inspector, and Frontend Gallery Lightbox.
  * REST API endpoint `/matcha-gallery-pro/v1/woocommerce/products` with live catalog search, stock status badges, formatted currency prices, and direct Lightbox "Shop The Look" floating action buttons.

### 5. Unified Gallery Controls & Toolbar Skins Architecture (Completed)
* **Problem:** Gallery controls (Search input, category filter buttons, sort dropdown, and color swatches) looked like generic, unstyled browser forms that clashed with custom gallery layouts and dark themes. Furthermore, theme stylesheets (Astra, Kadence, Divi) frequently overrode inputs with solid backgrounds.
* **Solution:**
  * Developed a unified 4-skin aesthetic system across Gutenberg, Visual Studio, PHP rendering, and frontend CSS:
    1. `capsule` (Modern rounded pill, clean border/shadow, default Free)
    2. `underline` (Minimalist hairline, editorial/fine-art borderless search + underline tabs, Pro)
    3. `obsidian` (Deep charcoal `#1e293b` surface with matcha glow, Pro)
    4. `glass` (Frosted glass with 14px blur, specular highlight borders, and smoked dark-mode adaptation, Pro)
  * **Backend & CPT Storage:** Whitelisted and sanitized `toolbarSkin` in [Gallery_CPT.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/Gallery/Gallery_CPT.php) and registered in [block.json](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/blocks/smart-gallery/block.json).
  * **PHP Renderer:** Injected `.matcha-gallery__toolbar--skin-{$toolbar_skin}` and `.matcha-gallery__filters--skin-{$toolbar_skin}` in [Smart_Gallery_Block.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/Blocks/Smart_Gallery_Block.php) with automatic fallback harmonizing.
  * **Inspector & Studio UI:** Added SelectControl in [InspectorControls.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/blocks/smart-gallery/components/InspectorControls.js), [FilterTab.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/studio/src/components/Tabs/FilterTab.js), and [studio/src/index.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/studio/src/index.js). Selecting Pro skins without a license triggers the `showProModal` upgrade dialog and reverts to Capsule.
  * **CSS Specificity Collision Fix:** Scoped legacy `.matcha-gallery__filters--style-dark` and dark theme overrides with `:not([class*="--skin-capsule"]):not([class*="--skin-underline"]):not([class*="--skin-glass"])` in [frontend-gallery.css](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/assets/css/frontend-gallery.css), preventing style leaks on transparent or glass skins. Added mobile horizontal scroll (`< 640px`).

### 6. Interactive Spatial 3D Tilt & Action Dock Architecture (Completed)
* **Spatial 3D Perspective Tilt:** Cards dynamically track cursor offset to compute CSS 3D perspective transforms (`rotateX`, `rotateY`, and subtle specular glare gradients).
* **Floating Action Dock:** Smooth hover dock offering 1-click Quick Zoom, Client Proofing Heart favorite toggles, and direct WooCommerce Shoppable product actions.

### 7. 2026 AI-Native Intelligence Suite Prototype (`skin-studio-mockup.html`) (Completed)
* **Floating AI Vibe Bar:** Real-time semantic natural language prompt search filtering against image keywords, vibes, and descriptions, paired with 1-click smart mood chips (`Emerald Flora`, `Sunset Warmth`, `Nordic Canopy`).
* **AI Visual Echo / Semantic Re-Clustering:** Allows any photo to act as an anchor (`🎯 Echo Anchor`) with real-time confidence badges (`✨ 94% AI Match`) and a frosted twin count toast.
* **Chromatic Palette Harmony Engine:** Clickable 6-swatch dominant harmony engine that highlights chromatic matches with hex backlight glow.
### 8. Curated Art Wall & Gallery Exhibition Architecture (Completed)
* **Free Tier Core Value:** Built a production-grade 3-frame **Hero Triptych** layout available to all Free users without any artificial lockouts or watermarks (100% compliant with WordPress.org guidelines). Features museum-grade 57″ gallery eye-level alignment, classic Matte Black frame molding, passe-partout matting, subtle ambient wall shadow elevation, dimension badges (`24" × 36"`), and responsive vertical collapse on mobile (`< 768px`).
* **Surplus Photo & Zero-Loss Lightbox Handling:** Galleries with >3 photos preserve all surplus images in the rendered DOM (`.matcha-gallery__item--surplus` with `display: none !important;`). An elegant exhibition pill button (`+N More Exhibition Works in Viewer`) allows visitors to immediately launch the Lightbox directly starting at photo index 3, with complete thumbnail strip and arrow navigation across the entire gallery collection. Canvas filtering (`applyCanvasFilter()`) and CSS rules strictly isolate surplus frames so they never bleed into the canvas background or disrupt the exhibition wall grid.
* **Pro Studio Tier:** Unlocks Salon, Staircase, and Symmetric layout geometry presets, freeform canvas coordinate drag-and-drop, 90° frame orientation flip, and luxury moldings (Natural Oak, Nordic White, Brushed Gold Brass, and Floating Glassmorphism). Gated via `matcha_gallery_allowed_wall_presets` and `matcha_gallery_allowed_wall_moldings` filters.

### 9. Editorial, Cinema & Museum Exhibition Layout Suite (Completed)
* **Design Prototype Port (`skin-studio-mockup.html`):** Successfully migrated all 3 modern layout concepts from the high-fidelity prototype into core production code:
  1. **Lookbook Duet (`lookbook-duet`) [Free Core]:** 2026 Editorial magazine stagger layout. Features 3-column grid with alternating column 2 vertical offset (`margin-top: 48px`), dynamic organic aspect ratios (3:4, 1:1, 4:5), and seamless responsive collapse to 2 columns on tablet and 1 column on mobile. 100% free, unwatermarked, and unrestricted to accelerate viral WordPress.org installs.
  2. **Cinema Reel (`cinema-reel`) [Pro Addon]:** 16:9 widescreen horizontal runway strip with smooth touch/trackpad momentum, CSS `scroll-snap`, responsive `82vw` mobile peek, and custom luxury matcha scrollbar.
  3. **Curator Specimen (`curator-specimen`) [Pro Addon]:** Swiss museum dual-column archive presentation with generous 40px negative space, deep shadow elevation (`#111613` specimen matting cards), and 4:3 inner media ratios.
* **Full Stack Integration:**
  * **Backend CPT Sanitization:** Added `lookbook-duet`, `cinema-reel`, and `curator-specimen` to allowlists in [Gallery_CPT.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/Gallery/Gallery_CPT.php) and [matcha-gallery-pro.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery-pro/matcha-gallery-pro.php).
  * **PHP Block Renderer:** Fallback harmonization in [Smart_Gallery_Block.php](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/includes/Blocks/Smart_Gallery_Block.php) enforcing Pro layout license gating while cleanly allowing Lookbook Duet for all users.
  * **Gutenberg Inspector & Studio UI:** Added interactive blueprint cards, responsive dimensions controls, and Pro modal upgrade triggers in [block.json](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/blocks/smart-gallery/block.json), [InspectorControls.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/blocks/smart-gallery/components/InspectorControls.js), and [studio/src/index.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/studio/src/index.js).
  * **Cross-Environment CSS:** Production styles in [frontend-gallery.css](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/assets/css/frontend-gallery.css) and [studio.css](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/assets/css/studio.css) targeting `.matcha-gallery__item-inner` with high-specificity canvas overrides.

### 10. Studio Prototype Port & Visual Architecture Suite (Completed)
* **Best-Fitting Skins Integration:** Visual cards under Layout Blueprints in Studio left sidebar (`Pure Minimalist`, `Editorial Card`, `Exhibition Hairline`, `Atmospheric Aura PRO`) with dynamic layout compatibility matrix filtering and automatic fallback recommendation.
* **Live Status Chips & Top Bar Controls:** Top bar now features active layout and skin indicator chips (`Layout: ...`, `Active Skin: ...`), `▶ 3D Wave Demo` sequence runner, and hardware-accelerated `✦ Spatial 3D Tilt (PRO)` toggle.
* **Contextual Art Wall Controls (PRO):** When Curated Art Wall layout is selected, right sidebar displays dedicated panel for Wall Texture & Material (`Charcoal`, `Plaster`, `Linen`, `Sage`), Curated Presets (`Salon Wall`, `Hero Triptych`, `Staircase`, `Symmetric Quad`), 57″ Museum Eye-Level horizon guide toggle, Frame Moldings (`Matte Black`, `Natural Oak`, `Nordic White`), Frame Orientation (`Portrait`, `Landscape`, 90° quick flip), Curated Frame Ratios (`24"×36"`, `18"×24"`, `12"×12"`, `16"×20"`, `20"×30"`, `16:9 Wide`), and Responsive mobile tour notes.
* **Spatial 3D Holographic Tilt:** Gyro/mouse perspective transform with specular light sheen overlay on card hover (`.item-specular-glare`), plus in-inspector wave demo trigger.
### 11. True Continuous CSS Multi-Column Masonry (Completed in v1.0.2)
* **Problem:** Earlier masonry iterations relied on CSS Grid or Flexbox with uniform row tracking, which produced awkward vertical white gaps or required heavy JavaScript masonry calculations that caused visible page jumps on mobile and delayed load times.
* **Solution:**
  * Implemented pure, zero-dependency CSS multi-column masonry: `columns: var(--matcha-columns, 3)` with `column-gap: var(--matcha-gap, 16px)`.
  * Enforced `break-inside: avoid; display: inline-block; width: 100%; margin-bottom: var(--matcha-gap, 16px);` on all gallery items.
  * Added responsive breakpoint rules: 3 columns on desktop, 2 on tablet (`@media (max-width: 900px)`), and 1 column on mobile (`@media (max-width: 600px)`), producing seamless cascading heights while preserving native photo aspect ratios with 0ms calculation delay.

### 12. Cold-Load Thumbnail Preloading & Zero-CLS Guard (Completed in v1.0.2)
* **Zero Cumulative Layout Shift (CLS < 0.01):**
  * Computed native aspect ratios from WordPress attachment metadata during PHP block/shortcode render.
  * Injected `style="aspect-ratio: {$width} / {$height};"` directly onto `.matcha-gallery__item-frame` before images start downloading, eliminating page jumps when images resolve over slow mobile networks.
* **Cold-Load Thumbnail Staggering:**
  * Embedded lightweight progressive preloader logic with smooth opacity transitions (`transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)`) and fallback shimmer skeleton placeholders.

### 13. Obsidian Studio Streamlining & Duplicate Control Removal (Completed in v1.0.2)
* **UI Redundancy Cleanup:** Addressed layout confusion where skin options were duplicated in both the left layout blueprints and the right sidebar properties panel.
* **Refined Information Architecture:**
  * Consolidated Blueprint selection into the left tabbed drawer as the single source of truth for gallery structural presets.
  * Dedicated the right sidebar inspector strictly to contextual styling, frame options, hover effects, and theme skin harmonization.
  * Refined entire dark workspace to the Obsidian Studio standard (`#090d0b` stage background, `#111613` cards, `#1f2822` borders, and crisp `#ffffff` primary typography with zero muddy green tinting).

### 14. WordPress.org High-CTR Pure Symbol Icon Suite (Completed in v1.0.2)
* **The 64px Search Card Illegibility Trap:**
  * In the WordPress.org plugin directory and WP Admin search results (`/wp-admin/plugin-install.php`), plugin cards already display the plugin title in bold 14–16px typography immediately beside the icon.
  * Embedding tiny text inside the 256×256 icon wasted 40% of the canvas height, shrinking the actual logo symbol to an unreadable 120px smudge at 64px and 128px screen scales.
* **Pure Symbol Architecture:**
  * Centered the signature botanical leaf contour at `(128, 128)` and enlarged it to `162 × 166px` (68% canvas coverage).
  * Multi-photo bento mosaic gallery wall fills the leaf shape, overlaid with 4 concentric tilted gyre loops focusing like a camera aperture.
  * Retained the matte sage brand background (`#73907F`) and razor-sharp white hairline borders (`2.2px`).
  * Automated dual-export via [compile-svg.js](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/.wordpress-org/compile-svg.js) (scalable SVG) and [build-icons.ps1](file:///c:/Users/Brosoft/Local%20Sites/matcha-ai-smart-gallery/app/public/wp-content/plugins/matcha-gallery/.wordpress-org/build-icons.ps1) (GDI+ bicubic rendering for 256×256 and 128×128 PNGs).
  * Synchronized generated assets directly to `.wordpress-org/` SVN assets and `assets/images/`.

---

## 6. Git Repositories & Build Instructions

### Free Plugin
* **Directory:** `app/public/wp-content/plugins/matcha-gallery`
* **Remote:** `https://github.com/wpmatcha/plugin-matcha-gallery.git` (branch: `main`)
* **Build Commands:**
  ```bash
  node build.js          # Builds Gutenberg block & Studio UI bundle (assets/js/studio.js)
  node pack.js           # Rebuilds, updates POT (513 strings), and generates matcha-gallery.zip
  ```

### Pro Plugin Addon
* **Directory:** `app/public/wp-content/plugins/matcha-gallery-pro`
* **Remote:** `https://github.com/wpmatcha/plugin-matcha-gallery-pro.git` (branch: `main`)
* **Build Commands:**
  ```bash
  node pack.js           # Generates matcha-gallery-pro.zip distribution package
  ```

---

## 7. Active Roadmap

- [x] Fix Gemini 2.5 Flash token truncation & 429 burst rate limits.
- [x] Smart skip for already-analyzed images in Studio.
- [x] Connect Pro license validation and remote updates.
- [x] **AI Smart Fill Geometry Matcher:** Auto-calculates optimal Bento/Mosaic tile layouts.
- [x] **Server-Side Unattended Background Queue:** Background batch processing for 500+ photos without keeping the tab open.
- [x] **AI Brand Persona / Tone Presets:** E-Commerce, Wedding, Architecture, Editorial niche vision prompts.
- [x] **Creative Architectural Hover Presets (The Grid Inspired):** Bogota (Cinematic Pullback), Brasilia (Editorial Hairline Frame), Sofia (Slide Curtain), Lome (Bottom Drawer), Grayscale to Vivid.
- [x] **Dynamic Hover Customizer:** Brasilia hairline frame color picker (`--matcha-hover-frame-color`) and mobile touch interaction switcher (direct lightbox vs tap-to-reveal overlay).
- [x] **Multimedia & Video Lightbox Support:** Multi-platform (YouTube nocookie, Vimeo, native MP4/WebM) with responsive 16:9 lightbox player, Play thumbnail badges, play icon actions, and zero-audio-leak memory destruction.
- [x] **Unified Toolbar & Controls Skins System:** Modern Capsule (Free), Minimalist Hairline (Pro), Obsidian Dark (Pro), Frosted Glass (Pro) across Search, Filters, Sort, and Swatches.
- [x] **Gutenberg & Studio Toolbar Customization:** Integrated skin controls in block inspector and Studio with Pro gating modal and mobile horizontal scroll.
- [x] **Spatial 3D Tilt & Floating Action Dock:** Real-time perspective matrix transform with action dock on hover.
- [x] **2026 AI-Native Intelligence Suite Prototype:** Floating AI Vibe Bar, Visual Echo semantic similarity re-clustering, and Chromatic Palette engine.
- [x] **WordPress.org Directory Approval:** Approved & live in directory (`matcha-gallery`).
- [x] **Curated Art Wall (Hero Triptych in Free + Canvas Studio in Pro):** Ship entry-level framed triptych to Free to drive viral installs, with freeform canvas in Pro.
- [x] **2026 Modern Layout Suite Port:** Lookbook Duet (Magazine editorial stagger in Free) + Cinema Reel (16:9 widescreen runway in Pro) + Curator Specimen (Swiss museum 2-column archive in Pro).
- [x] **Studio Prototype Feature Port:** Best-Fitting Skins filter matrix, Live Status Chips, 3D Spatial Depth suite, and Art Wall Controls panel.
- [x] **v1.0.2 Release Milestone:** True continuous CSS masonry, cold-load thumbnail preloader, Lookbook Duet, Obsidian Studio UI, and High-CTR Pure Symbol WP.org icon suite.
- [ ] **WordPress.org SVN Release Sync:** Deploy `v1.0.2` tag and updated directory banner/icon assets to `plugins.svn.wordpress.org/matcha-gallery`.
- [ ] **Growth Milestone:** Drive first 100+ active installs on WordPress.org through targeted community launch and portfolio user outreach.

