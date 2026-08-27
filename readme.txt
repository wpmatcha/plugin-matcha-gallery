=== Matcha Gallery – AI Photo Wall, Masonry & Portfolio Studio ===
Contributors: wpmatcha
Donate link: https://wpmatcha.com
Tags: gallery, photo gallery, masonry, portfolio, lightbox
Requires at least: 6.2
Tested up to: 7.1
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered image metadata generation, interactive mosaic photo walls, masonry layouts, framing, client proofing, and smart portfolios for WordPress.

== Description ==

**Matcha Gallery** is the next-generation WordPress gallery plugin built for photographers, visual artists, designers, and eCommerce portfolios. It combines a state-of-the-art **Matcha Studio visual editor** with Google Gemini AI vision to automatically tag photos, generate SEO alt-text, calculate color palettes, and create stunning responsive photo walls.

Unlike bloated legacy gallery plugins, Matcha Gallery produces pure vanilla HTML5/CSS3 output with zero jQuery dependencies and ultra-fast page load times (<15KB frontend runtime).

[Live Demo & Documentation](https://wpmatcha.com) | [GitHub Repository](https://github.com/wpmatcha/plugin-matcha-gallery)

= 🍵 Key Highlights =

* **Matcha Studio Pro Editor:** A distraction-free, 3-panel visual workspace inspired by GalleryPlanner and Figma. Customize layouts, picture framing, drop shadows, and matting with real-time WYSIWYG preview.
* **AI Vision & Metadata Generator:** Powered by Google Gemini AI. Automatically generates ADA-compliant alt text, human-readable titles, descriptive captions, and SEO keyword taxonomy.
* **6 Algorithmic Layout Blueprints:**
  * *Classic Grid* — Uniform aspect ratio with responsive column presets.
  * *Pinterest Masonry* — Fluid cascading heights preserving native aspect ratios.
  * *PhotoBlocks Mosaic* — Custom geometric tile spans (1x1, 2x1 wide, 1x2 tall, 2x2 hero).
  * *Pinwheel Spiral* — Center hero spotlight with surrounding spiral thumbnails.
  * *Bento Showcase* — Modern tech-style hero spread.
  * *Justified Rows* — Flickr-style edge-to-edge justified rows.
* **1-Click ✨ Smart Fill:** AI analyzes image aspect ratios across your entire collection and automatically assigns the optimal geometric tile layout with one click.
* **In-Frame Pan & Zoom Cropping:** Interactive 2D target reticle and zoom slider (1.0x to 2.5x) to set pixel-perfect focal framing without cutting off heads or subjects.
* **Realistic Picture Framing & Matting:** 5 gallery-grade picture frames (*White Matting, Slim Black Metal, Natural Oak Wood, Brushed Gold Brass, Glass Float*) with customizable 0–32px matting margins.
* **Multi-Section Gallery Chapters:** Organize a single gallery into tabbed chapters (e.g. *Ceremony, Reception, Portraits* or *Living Room, Bedroom, Kitchen*) with smooth animated switching.
* **AI Color Swatches & Live Filter Toolbar:** Instant color dot filter buttons extracted by AI, plus live keyword search and animated category filter pills.
* **Client Proofing & Shoppable Portfolios:** Visitors can favorite photos with heart icons (`🤍 → ❤️`) and export clean selection lists, or click glassmorphic *Buy / Shop Now* buttons.
* **1-Click 📷 Export Wall & Client Proofing Sheet:** Download a 2x crystal-clear PNG snapshot of your arranged gallery wall, or print a branded client proposal sheet with dimensions and pricing.
* **Gutenberg Block & Shortcode:** Embed galleries seamlessly via the native `[matcha_gallery id="..."]` shortcode or the dedicated Gutenberg block.

== Third-Party Services ==

This plugin integrates with the following external third-party API services to provide AI image analysis and metadata generation:

* **Google Gemini AI Vision API (Google LLC)**
  * **Purpose:** Analyzes uploaded images to generate descriptive alt-text, titles, captions, keyword tags, dominant color palettes, and focal point coordinates.
  * **When it connects:** Only when you explicitly click "⚡ AI Enhance" in the Matcha Studio editor, use the "Generate AI Metadata" button in the WordPress Media Library, or enable the "Auto-generate on upload" setting.
  * **Data Transmitted:** Image file URL or base64 image data sent over secure HTTPS directly to the Google Gemini API endpoint.
  * **Privacy Policy:** [Google Privacy Policy](https://policies.google.com/privacy)
  * **Terms of Service:** [Google Generative AI Terms of Service](https://ai.google.dev/terms)

== Installation ==

1. Upload the `matcha-gallery` folder to your `/wp-content/plugins/` directory, or install directly through **Plugins → Add New** in your WordPress dashboard.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Navigate to **Matcha AI → AI Settings** and enter your free Google Gemini API key (or OpenAI key).
4. Go to **Matcha AI → All Galleries** and click **Add New Gallery** to open the Matcha Studio visual editor.
5. Add photos, customize your layout and framing, and copy your shortcode `[matcha_gallery id="..."]` into any page or post.

== Frequently Asked Questions ==

= Do I need a paid API key to use the AI features? =
No! Google Gemini offers a generous free tier (up to 15 requests per minute) that is completely free of charge. You can generate a free API key at [Google AI Studio](https://aistudio.google.com/).

= Can I use Matcha Gallery without AI? =
Yes, absolutely! All 6 layouts, picture framing, matting, multi-section chapters, lightboxes, and shortcodes work 100% out of the box without configuring an API key.

= Will AI overwrite my existing image alt text? =
By default, no. Matcha Gallery only enriches images with missing alt text or captions. You can toggle "Overwrite existing metadata" in Settings if you wish to re-generate everything.

= Is Matcha Gallery fast and lightweight? =
Yes! The frontend runtime is under 15KB of vanilla JavaScript with zero jQuery or external framework dependencies. It uses native CSS Grid and Flexbox for maximum rendering speed and 100/100 Google PageSpeed scores.

= How do I embed a gallery into a page? =
You can insert the native **Matcha Gallery** Gutenberg block, or paste the shortcode `[matcha_gallery id="123"]` into any block, page builder (Elementor, Divi, Beaver Builder), or widget area.

== Screenshots ==

1. **Matcha Studio Editor** — 3-Panel Pro visual workspace with dark studio theme and realistic wall preview.
2. **Layout Blueprints** — 6 visual presets including Classic Grid, Pinterest Masonry, and PhotoBlocks Mosaic.
3. **Picture Framing & Matting** — Realistic Oak Wood, Black Metal, Gold Brass, and White Matting frames.
4. **In-Frame Pan & Zoom Cropper** — 2D interactive focal target reticle and zoom controls.
5. **AI Color Swatches & Filters** — Frontend live keyword search, dynamic category pills, and color dot palette filtering.
6. **Client Proofing & Shoppable Hotspots** — Heart favorite button with export tray and glassmorphic Buy Now buttons.
7. **Client Proofing Sheet Export** — 1-Click print/PDF proposal generation with itemized specifications and prices.

== Changelog ==

= 1.0.0 =
* Initial public release on WordPress.org.
* Matcha Studio 3-panel Pro dark workspace editor.
* 6 Algorithmic layout blueprints: Grid, Masonry, Mosaic, Pinwheel, Bento, and Justified.
* 1-Click Smart Fill aspect-ratio matcher.
* Picture Framing & Matting system (5 realistic frame styles).
* In-Frame Pan & Zoom cropping with 2D focal reticle.
* Multi-Section Gallery Chapters (tabbed sub-stories in 1 gallery).
* 1-Click 2x High-Res PNG Wall Snapshot & PDF Client Proofing Sheet export.
* AI Vision metadata enrichment via Google Gemini (alt text, titles, captions, colors, focal points).
* Frontend live search, color swatch filter, proofing tray, and accessible lightbox.
* Native Gutenberg block and `[matcha_gallery]` shortcode.
* Local vendored JS dependencies (zero CDN reliance).

== Upgrade Notice ==

= 1.0.0 =
Initial release of Matcha Gallery.
