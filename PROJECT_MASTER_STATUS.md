# Matcha Gallery — Master Project Status & Context Contract

> **Permanent Memory File:** This document stores the complete architecture, technical decisions, bug fixes, feature splits (Free vs. Pro), and active roadmap for the Matcha Gallery project. If an AI session or chat context resets, read this file first to resume immediately without lost context. **Update this file whenever a new milestone, architectural change, or feature commit occurs.**

---

## 1. Project Overview & Commercial Strategy

* **Product Name:** Matcha Gallery (Free) / Matcha Gallery Pro
* **Tagline:** AI-Powered Smart Photo Wall, Masonry & Portfolio Studio for WordPress
* **Target Audience:** Photographers, designers, e-commerce stores, creative agencies, and portfolio owners who want intelligent auto-tagging, zero layout shift (CLS 0), and visual masonry galleries.
* **Pricing & Monetization Model:**
  * **Free:** Distributed via WordPress.org plugin directory. 100% free with BYOK (Bring Your Own Key) for Google Gemini and OpenAI.
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
| **Layouts** | Grid, Masonry, Justified, Mosaic (standard) | Grid, Masonry, Justified, Mosaic + **Pinwheel, Bento, Custom Geometry Spans** |
| **Filtering Modes** | Single-select filter pills (`All`, `Cats`, `Nature`) | Single-select + **Multi-Select Faceted Checkbox Filtering** |
| **Color Swatches** | Colors extracted and saved in meta | **Interactive Color Swatch Filter Bar** (click color pill to filter) |
| **Smart Fill** | Triggers Pro Upgrade modal | **AI Smart Fill Geometry Matcher** (auto-arranges tile spans) |
| **Picture Framing** | Frameless Clean (Modern) | Matte Black Metal, Natural Oak, Brushed Gold Brass, Glassmorphism 3D Float |
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

---

## 6. Git Repositories & Build Instructions

### Free Plugin
* **Directory:** `app/public/wp-content/plugins/matcha-gallery`
* **Remote:** `https://github.com/wpmatcha/plugin-matcha-gallery.git` (branch: `main`)
* **Build Commands:**
  ```bash
  npm run build          # Builds Gutenberg block & Studio UI bundle (assets/js/studio.js)
  npm run pack           # Generates matcha-gallery.zip ready for WordPress.org
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
- [ ] **Action Scheduler Background Queue:** Server-side batch processing for 500+ photos without requiring the browser tab to remain open.
- [ ] **WordPress.org Directory Review:** Complete directory review requirements (assets, banner, icon, tags, translations).
- [ ] **WooCommerce Hotspots:** Native product search picker in Studio for tagging photos with products.
