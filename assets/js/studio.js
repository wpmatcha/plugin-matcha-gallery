(() => {
  // studio/src/store/useStudioStore.js
  var state = {
    galleryId: window.MatchaStudio?.galleryId || 0,
    title: window.MatchaStudio?.title || "",
    config: window.MatchaStudio?.config || { imageIds: [], aiTags: [], layout: "grid", columns: 3, columnsTablet: 2, columnsMobile: 1, gutterSize: 16, filtersEnabled: true, showAllFilter: true, showTitle: true, showCaption: false, lightboxEnabled: true },
    viewport: "desktop",
    // desktop|tablet|mobile
    saving: false,
    ai: { running: false, done: 0, total: 0, errors: [] }
  };
  var listeners = /* @__PURE__ */ new Set();
  var getState = () => state;
  var setState = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l(state));
  };
  var subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  var patchConfig = (patch) => setState({ config: { ...state.config, ...patch } });
  var setViewport = (v) => setState({ viewport: v });

  // studio/src/index.js
  var Icons = {
    leaf: `<svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 2.5 L11.5 2.5 A3.5 3.5 0 0 1 15 6 L15 12 L9 12 A3.5 3.5 0 0 1 5.5 8.5 Z" fill="none" stroke="currentColor" stroke-width="1.6"/><ellipse cx="10" cy="7.25" rx="3.6" ry="2.8" transform="rotate(-22 10 7.25)" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.9"/><ellipse cx="10" cy="7.25" rx="3.2" ry="2.6" transform="rotate(24 10 7.25)" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.85"/><ellipse cx="10" cy="7.25" rx="2.6" ry="2.2" transform="rotate(-8 10 7.25)" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.8"/><ellipse cx="10" cy="7.25" rx="2.0" ry="1.6" transform="rotate(12 10 7.25)" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.95"/></svg>`,
    bolt: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    desktop: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
    tablet: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>`,
    mobile: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>`,
    camera: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    image: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    layoutGrid: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
    masonry: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="11" x="3" y="3" rx="1"/><rect width="7" height="6" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    mosaic: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="11" height="11" x="3" y="3" rx="1"/><rect width="6" height="5" x="15" y="3" rx="1"/><rect width="6" height="5" x="15" y="9" rx="1"/><rect width="18" height="6" x="3" y="15" rx="1"/></svg>`,
    bento: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="11" height="18" x="3" y="3" rx="1"/><rect width="7" height="8" x="15" y="3" rx="1"/><rect width="7" height="8" x="15" y="13" rx="1"/></svg>`,
    pinwheel: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12V3a9 9 0 0 1 9 9h-9Z"/><path d="M12 12h9a9 9 0 0 1-9 9v-9Z"/><path d="M12 12v9a9 9 0 0 1-9-9h9Z"/><path d="M12 12H3a9 9 0 0 1 9-9v9Z"/></svg>`,
    justified: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>`,
    sparkles: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    crosshair: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>`,
    frame: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><rect width="10" height="10" x="7" y="7" rx="1"/></svg>`,
    sliders: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>`,
    search: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>`,
    shoppingBag: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    heart: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    folder: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
    fileText: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
    copy: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    lock: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    palette: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
    filter: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    sort: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>`,
    eye: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    list: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
    grid: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
    grid3: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="4" x="3" y="3" rx="1"/><rect width="4" height="4" x="10" y="3" rx="1"/><rect width="4" height="4" x="17" y="3" rx="1"/><rect width="4" height="4" x="3" y="10" rx="1"/><rect width="4" height="4" x="10" y="10" rx="1"/><rect width="4" height="4" x="17" y="10" rx="1"/><rect width="4" height="4" x="3" y="17" rx="1"/><rect width="4" height="4" x="10" y="17" rx="1"/><rect width="4" height="4" x="17" y="17" rx="1"/></svg>`,
    gem: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8da993" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>`,
    check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    drag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
    edit: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
    trash: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    link: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    externalLink: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>`
  };
  var root = document.getElementById("matcha-studio-root");
  if (root) {
    let showProModal = function(featureTitle = "Matcha Studio Pro Feature", featureDesc = "Upgrade to Matcha Gallery Pro to unlock this advanced feature and take your WordPress galleries to the next level.") {
      let backdrop = document.querySelector(".matcha-pro-modal-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "matcha-pro-modal-backdrop";
        document.body.appendChild(backdrop);
      }
      backdrop.innerHTML = `
      <div class="matcha-pro-modal" role="dialog" aria-modal="true">
        <button type="button" class="close-btn" aria-label="Close" id="matcha-pro-close-btn">&times;</button>
        
        <div class="matcha-pro-modal-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>

        <div class="matcha-pro-modal-badge-wrap">
          <span class="matcha-pro-badge">PRO FEATURE</span>
        </div>

        <h3 class="matcha-pro-modal-title">${escapeHtml(featureTitle)}</h3>
        <p class="matcha-pro-modal-desc">${escapeHtml(featureDesc)}</p>
        
        <div class="matcha-pro-features-list">
          <div class="matcha-pro-feat-item"><span class="icon">${Icons.check}</span><span>PhotoBlocks, Pinwheel & Bento Layouts</span></div>
          <div class="matcha-pro-feat-item"><span class="icon">${Icons.check}</span><span>AI Smart Fill & 2D Focal Pan/Zoom Cropping</span></div>
          <div class="matcha-pro-feat-item"><span class="icon">${Icons.check}</span><span>Luxury Picture Frames & Shadow Matting</span></div>
          <div class="matcha-pro-feat-item"><span class="icon">${Icons.check}</span><span>Client Proofing Sessions & Story Chapters</span></div>
        </div>

        <a href="${upgradeUrl}" target="_blank" rel="noopener noreferrer" class="matcha-pro-modal-cta" id="matcha-pro-cta-btn">
          <span>Upgrade to Matcha Pro \u2192</span>
        </a>

        <div class="matcha-pro-modal-footer">
          <span>30-Day Money-Back Guarantee</span> \u2022 <span>Instant License Activation</span>
        </div>
      </div>
    `;
      backdrop.classList.add("is-visible");
      const closeBtn = backdrop.querySelector("#matcha-pro-close-btn");
      if (closeBtn) {
        closeBtn.onclick = () => backdrop.classList.remove("is-visible");
      }
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("is-visible");
        }
      };
    }, openCreateChapterModal = function(initialPhotoId = null) {
      if (!isPro) {
        showProModal(
          "Multi-Section Gallery Chapters",
          "Divide your gallery into tabbed story chapters (e.g. Ceremony, Reception, Portraits). Available in Matcha Gallery Pro."
        );
        return;
      }
      let backdrop = document.getElementById("matcha-chapter-modal-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "matcha-chapter-modal-backdrop";
        backdrop.className = "matcha-pro-modal-backdrop";
        document.body.appendChild(backdrop);
      }
      backdrop.innerHTML = `
      <div class="matcha-pro-modal" style="max-width:440px;" role="dialog" aria-modal="true">
        <button type="button" class="close-btn" aria-label="Close" id="chapter-modal-close-btn">&times;</button>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(94,194,127,0.16);color:#5ec27f;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.folder}
          </div>
          <div>
            <h3 style="font-size:15px;color:#ffffff;margin:0 0 2px;font-weight:700;">Create Story Chapter</h3>
            <p style="font-size:11px;color:var(--st-text-secondary);margin:0;">Organize photos into tabbed story sections.</p>
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:5px;letter-spacing:0.5px;">CHAPTER TITLE</label>
          <input type="text" id="new-chapter-name-inp" class="matcha-dark-input" placeholder="e.g. The Ceremony" style="width:100%;font-size:13px;padding:9px 12px;box-sizing:border-box;border-radius:8px;" autocomplete="off" />
        </div>

        <div style="margin-bottom:18px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:6px;letter-spacing:0.5px;">CLICK POPULAR EXAMPLES TO INSERT</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${["Ceremony", "Reception", "Portraits", "Getting Ready", "Exterior", "Living Spaces", "Drone Shots", "Cocktails"].map((idea) => `
              <button type="button" class="chapter-preset-chip" data-title="${idea}" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:#cbd5e1;font-size:11px;padding:4px 9px;cursor:pointer;transition:all 0.15s;">
                + ${idea}
              </button>
            `).join("")}
          </div>
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" id="chapter-modal-cancel" class="matcha-exit-btn" style="padding:7px 14px;font-size:11px;">Cancel</button>
          <button type="button" id="chapter-modal-submit" class="matcha-publish-btn" style="padding:7px 18px;font-size:11px;font-weight:700;">Create Chapter</button>
        </div>
      </div>
    `;
      backdrop.classList.add("is-visible");
      const input = backdrop.querySelector("#new-chapter-name-inp");
      setTimeout(() => input?.focus(), 60);
      backdrop.querySelectorAll(".chapter-preset-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (input) {
            input.value = btn.dataset.title;
            input.focus();
          }
        });
      });
      const close = () => backdrop.classList.remove("is-visible");
      backdrop.querySelector("#chapter-modal-close-btn").onclick = close;
      backdrop.querySelector("#chapter-modal-cancel").onclick = close;
      backdrop.onclick = (e) => {
        if (e.target === backdrop) close();
      };
      const submit = () => {
        const name = input?.value.trim();
        if (!name) return;
        const secId = "sec_" + Date.now().toString(36);
        const sections = [...getState().config.sections || []];
        const imageIds = initialPhotoId ? [initialPhotoId] : [];
        sections.push({ id: secId, title: name, imageIds });
        activeSectionId = secId;
        trayPage = 1;
        patchConfig({ sections, sectionsEnabled: true });
        close();
        renderRightPanel();
        renderLeftTab("images");
        renderCanvas();
        autosaveSoon();
      };
      backdrop.querySelector("#chapter-modal-submit").onclick = submit;
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") close();
      });
    }, updateZoom = function(z) {
      canvasZoom = Math.max(50, Math.min(150, z));
      zoomLabel.textContent = `${canvasZoom}%`;
      zoomContainer.style.transform = `scale(${canvasZoom / 100})`;
    }, exportPDFSheet = function() {
      const st = getState();
      const cfg = st.config;
      const ids = cfg.imageIds || [];
      const title = st.title || "Untitled Gallery";
      const printWin = window.open("", "_blank");
      if (!printWin) return alert("Please allow popup windows to view the client proofing sheet.");
      const rows = ids.map((id) => {
        const m = metaCache.get(id) || {};
        const media = mediaCache.get(id);
        const link = (cfg.imageLinks || {})[id] || {};
        const span = (cfg.imageSpans || {})[id] || "1x1";
        const imgSrc = media?.media_details?.sizes?.medium?.source_url || media?.source_url || "";
        const w = media?.media_details?.width || "\u2014";
        const h = media?.media_details?.height || "\u2014";
        return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;width:90px;">
            <img src="${imgSrc}" style="width:80px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #cbd5e1;" />
          </td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">
            <div style="font-weight:700;color:#0f172a;font-size:13px;">${escapeHtml(m.title || "#" + id)}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px;">Alt: ${escapeHtml(m.alt || "\u2014")}</div>
            <div style="font-size:10px;color:#059669;margin-top:4px;">Tags: ${(m.keywords || []).slice(0, 5).join(", ") || "\u2014"}</div>
          </td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">
            <div>Dim: ${w} \xD7 ${h}px</div>
            <div style="font-size:11px;color:#64748b;">Tile: ${span}</div>
          </td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#0f172a;">
            ${link.price ? escapeHtml(link.price) : "\u2014"}
            ${link.url ? `<div style="font-size:10px;color:#2563eb;">${escapeHtml(link.label || "Shop")}</div>` : ""}
          </td>
        </tr>
      `;
      }).join("");
      printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Matcha Gallery \u2014 ${escapeHtml(title)} (Client Proofing Sheet)</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 18px; font-weight: 900; color: #16a34a; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#f1f5f9;padding:12px 20px;margin:-40px -40px 30px -40px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #cbd5e1;">
          <span style="font-weight:700;font-size:13px;">Client Presentation / Proofing Sheet</span>
          <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:700;cursor:pointer;">Print or Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="brand">MATCHA GALLERY</div>
            <h1 class="title">${escapeHtml(title)}</h1>
          </div>
          <div style="text-align:right;font-size:12px;color:#64748b;">
            <div>Total Images: <strong>${ids.length}</strong></div>
            <div>Layout: <strong>${escapeHtml(cfg.layout || "grid")}</strong> | Frame: <strong>${escapeHtml(cfg.frameStyle || "frameless")}</strong></div>
            <div>Date: <strong>${(/* @__PURE__ */ new Date()).toLocaleDateString()}</strong></div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Artwork Title & AI SEO Metadata</th>
              <th>Specs & Geometry</th>
              <th>Price Tag</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `);
      printWin.document.close();
      exportDropdown?.classList.remove("is-open");
    }, copyProposalMarkdown = function() {
      const st = getState();
      const cfg = st.config;
      const ids = cfg.imageIds || [];
      const title = st.title || "Untitled Gallery";
      const text = `# ${title} \u2014 Gallery Proposal

**Total Photos:** ${ids.length} | **Layout:** ${cfg.layout || "grid"} | **Frame Style:** ${cfg.frameStyle || "none"}

| # | Title | Alt Text | Tile Geometry | Price |
|---|---|---|---|---|
` + ids.map((id, i) => {
        const m = metaCache.get(id) || {};
        const link = (cfg.imageLinks || {})[id] || {};
        const span = (cfg.imageSpans || {})[id] || "1x1";
        return `| ${i + 1} | ${m.title || "#" + id} | ${m.alt || "\u2014"} | ${span} | ${link.price || "\u2014"} |`;
      }).join("\n");
      navigator.clipboard.writeText(text);
      alert("\u2713 Proposal Markdown copied to clipboard!");
      exportDropdown?.classList.remove("is-open");
    }, renderLeftTab = function(name) {
      const cfg = getState().config;
      if (name === "images") {
        leftPanel.innerHTML = imagesHTML(cfg);
        bindImages();
        renderImageList();
      } else if (name === "blueprints") {
        leftPanel.innerHTML = blueprintsHTML(cfg);
        bindBlueprints();
      } else if (name === "superpowers") {
        leftPanel.innerHTML = superpowersHTML(cfg);
        bindSuperpowers();
      }
    }, imagesHTML = function(cfg) {
      const sections = cfg.sections || [];
      const totalCount = (cfg.imageIds || []).length;
      const currentSection = sections.find((s) => s.id === activeSectionId);
      return `
        <!-- Chapter / Section Switcher Header -->
        <div class="matcha-studio-chapter-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:inline-flex;align-items:center;gap:5px;letter-spacing:0.5px;text-transform:uppercase;">
            <span style="color:#5ec27f;">${Icons.folder}</span> Chapters ${sections.length > 0 ? `<span style="opacity:0.6;font-weight:600;">(${sections.length})</span>` : ""}
          </span>
          <button type="button" id="btn-add-section" class="matcha-exit-btn" style="color:#ffffff;border-color:rgba(77,164,104,0.35);background:rgba(94,194,127,0.12);font-weight:700;font-size:10px;display:inline-flex;align-items:center;gap:4px;padding:3px 8px;" title="Create new gallery chapter">
            <span style="color:#5ec27f;font-weight:800;font-size:12px;line-height:1;">+</span> Chapter <span class="matcha-pro-badge" style="font-size:8px;padding:1px 4px;">PRO</span>
          </button>
        </div>

        <!-- Wrapped Chapter Pills (Auto-wrapping, zero horizontal overflow) -->
        <div class="matcha-studio-sections">
          <button type="button" class="matcha-studio-section-pill ${activeSectionId === "*" ? "is-active" : ""}" data-sec="*">
            All Photos <span class="cnt">${totalCount}</span>
          </button>
          ${sections.map((s) => `
            <button type="button" class="matcha-studio-section-pill ${activeSectionId === s.id ? "is-active" : ""}" data-sec="${s.id}">
              <span style="opacity:0.7;">${Icons.folder}</span> ${escapeHtml(s.title)} <span class="cnt">${(s.imageIds || []).length}</span>
            </button>
          `).join("")}
        </div>

        ${currentSection ? `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin-bottom:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;">
            <span style="font-size:11px;font-weight:700;color:#ffffff;display:flex;align-items:center;gap:5px;">
              <span style="color:#5ec27f;">${Icons.folder}</span> "${escapeHtml(currentSection.title)}"
            </span>
            <div style="display:flex;gap:4px;">
              <button type="button" id="btn-rename-sec" class="matcha-exit-btn" style="padding:2px 6px;font-size:9px;">Rename</button>
              <button type="button" id="btn-delete-sec" class="matcha-exit-btn" style="padding:2px 6px;font-size:9px;color:#f87171;">Delete</button>
            </div>
          </div>
        ` : ""}

        <button type="button" id="matcha-add-images" class="matcha-publish-btn" style="width:100%;height:38px;margin-bottom:8px;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>+</span> ${currentSection ? `Add Photos to "${escapeHtml(currentSection.title)}"` : "Add Photos from Media"}
        </button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
          <button type="button" id="matcha-run-ai" class="matcha-exit-btn" style="font-weight:700;color:#ffffff;display:flex;align-items:center;justify-content:center;gap:5px;" title="Run Gemini AI Vision Auto-Tagging">
            <span style="color:#5ec27f;">${Icons.bolt}</span> AI Enhance
          </button>
          <button type="button" id="matcha-smart-fill" class="matcha-exit-btn" style="font-weight:700;color:#ffffff;display:flex;align-items:center;justify-content:center;gap:5px;" title="Auto-match aspect ratios and tile geometry">
            <span style="color:#38bdf8;">${Icons.sparkles}</span> Smart Fill <span class="matcha-pro-badge">PRO</span>
          </button>
        </div>
        <div class="matcha-progress" style="height:4px;background:#202632;border-radius:4px;overflow:hidden;margin:6px 0;display:none;">
          <div id="matcha-ai-bar" class="matcha-progress__bar" style="height:100%;background:linear-gradient(90deg, #5ec27f, #4da468);width:0%;transition:width 0.3s ease;"></div>
        </div>
        <div id="matcha-ai-status" style="font-size:10px;color:var(--st-text-secondary);text-align:center;min-height:14px;margin-bottom:8px;"></div>

        <!-- Photos Tray Management Toolbar (Search, 3-Way Density Switcher, Sort, Filter) -->
        <div class="matcha-tray-toolbar" style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
          <div style="position:relative;flex:1;display:flex;align-items:center;">
            <span style="position:absolute;left:8px;color:#64748b;font-size:11px;display:flex;pointer-events:none;">${Icons.search}</span>
            <input type="text" id="tray-search-input" class="matcha-dark-input" placeholder="Search filename..." style="font-size:11px;padding:5px 22px 5px 24px;width:100%;height:30px;box-sizing:border-box;" value="${escapeHtml(traySearchQuery)}" />
            ${traySearchQuery ? `<button type="button" id="btn-clear-tray-search" style="position:absolute;right:6px;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px;padding:0;line-height:1;" title="Clear Search">\xD7</button>` : ""}
          </div>

          <!-- Segmented View Switcher (List / 2-Col / 3-Col) -->
          <div class="matcha-tray-view-segmented" title="Switch photo density">
            <button type="button" class="matcha-tray-view-btn ${trayViewMode === "list" ? "is-active" : ""}" data-tray-view="list" title="1-Column List View (Details)">
              ${Icons.list}
            </button>
            <button type="button" class="matcha-tray-view-btn ${trayViewMode === "grid-2" ? "is-active" : ""}" data-tray-view="grid-2" title="2-Column Grid (Standard)">
              ${Icons.grid}
            </button>
            <button type="button" class="matcha-tray-view-btn ${trayViewMode === "grid-3" ? "is-active" : ""}" data-tray-view="grid-3" title="3-Column Grid (High Density)">
              ${Icons.grid3}
            </button>
          </div>

          <!-- Sort Dropdown -->
          <div style="position:relative;">
            <button type="button" id="btn-tray-sort-toggle" class="matcha-hud-btn" style="width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;color:${(getState().config.sortBy || "manual") !== "manual" ? "#5ec27f" : "#b5c7ba"};border-radius:6px;border:1px solid var(--st-border-subtle);" title="Sort Gallery Photos">
              ${Icons.sort}
            </button>
            <div id="tray-sort-dropdown" class="matcha-combobox-dropdown" style="display:none;position:absolute;top:calc(100% + 4px);right:0;width:185px;background:var(--st-bg-card);border:1px solid var(--st-border-strong);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.8);z-index:9999;padding:4px;">
              <div class="tray-menu-item ${(getState().config.sortBy || "manual") === "manual" ? "is-selected" : ""}" data-sort="manual">
                <span>Manual (Drag & Drop)</span>
                ${(getState().config.sortBy || "manual") === "manual" ? '<span style="color:#5ec27f;font-weight:700;">\u2713</span>' : ""}
              </div>
              <div class="tray-menu-item ${(getState().config.sortBy || "manual") === "name-asc" ? "is-selected" : ""}" data-sort="name-asc">
                <span>Title (A \u2192 Z)</span>
                ${(getState().config.sortBy || "manual") === "name-asc" ? '<span style="color:#5ec27f;font-weight:700;">\u2713</span>' : ""}
              </div>
              <div class="tray-menu-item ${(getState().config.sortBy || "manual") === "name-desc" ? "is-selected" : ""}" data-sort="name-desc">
                <span>Title (Z \u2192 A)</span>
                ${(getState().config.sortBy || "manual") === "name-desc" ? '<span style="color:#5ec27f;font-weight:700;">\u2713</span>' : ""}
              </div>
              <div class="tray-menu-item ${(getState().config.sortBy || "manual") === "newest" ? "is-selected" : ""}" data-sort="newest">
                <span>Date Added (Newest)</span>
                ${isPro ? (getState().config.sortBy || "manual") === "newest" ? '<span style="color:#5ec27f;font-weight:700;">\u2713</span>' : "" : '<span class="matcha-pro-badge" style="font-size:9px;padding:1px 5px;margin-left:auto;">PRO</span>'}
              </div>
              <div class="tray-menu-item ${(getState().config.sortBy || "manual") === "oldest" ? "is-selected" : ""}" data-sort="oldest">
                <span>Date Added (Oldest)</span>
                ${isPro ? (getState().config.sortBy || "manual") === "oldest" ? '<span style="color:#5ec27f;font-weight:700;">\u2713</span>' : "" : '<span class="matcha-pro-badge" style="font-size:9px;padding:1px 5px;margin-left:auto;">PRO</span>'}
              </div>
              <div class="tray-menu-item ${(getState().config.sortBy || "manual") === "random" ? "is-selected" : ""}" data-sort="random">
                <span>Random Shuffle</span>
                ${isPro ? (getState().config.sortBy || "manual") === "random" ? '<span style="color:#5ec27f;font-weight:700;">\u2713</span>' : "" : '<span class="matcha-pro-badge" style="font-size:9px;padding:1px 5px;margin-left:auto;">PRO</span>'}
              </div>
            </div>
          </div>

          <!-- Filter Status Dropdown -->
          <div style="position:relative;">
            <button type="button" id="btn-tray-filter-toggle" class="matcha-hud-btn" style="width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;color:${trayFilterBy !== "all" ? "#5ec27f" : "#b5c7ba"};border-radius:6px;border:1px solid var(--st-border-subtle);" title="Filter Photos by Status">
              ${Icons.filter}
            </button>
            <div id="tray-filter-dropdown" class="matcha-combobox-dropdown" style="display:none;position:absolute;top:calc(100% + 4px);right:0;width:170px;background:var(--st-bg-card);border:1px solid var(--st-border-strong);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.8);z-index:9999;padding:4px;">
              <div class="tray-menu-item ${trayFilterBy === "all" ? "is-selected" : ""}" data-filter="all">
                <span>All Photos</span>
                <span style="font-size:10px;opacity:0.7;">(${totalCount})</span>
              </div>
              <div class="tray-menu-item ${trayFilterBy === "ai" ? "is-selected" : ""}" data-filter="ai">
                <span>AI Analyzed</span>
                <span style="font-size:10px;color:#5ec27f;font-weight:700;">\u2713</span>
              </div>
              <div class="tray-menu-item ${trayFilterBy === "no-alt" ? "is-selected" : ""}" data-filter="no-alt">
                <span>Needs Alt Text</span>
                <span style="font-size:10px;color:#fbbf24;display:inline-flex;align-items:center;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </span>
              </div>
              <div class="tray-menu-item ${trayFilterBy === "untagged" ? "is-selected" : ""}" data-filter="untagged">
                <span>Untagged Photos</span>
              </div>
            </div>
          </div>
        </div>

        <div id="matcha-image-list" class="matcha-image-grid ${trayViewMode === "list" ? "matcha-image-grid--list" : trayViewMode === "grid-3" ? "matcha-image-grid--col-3" : ""}"></div>
        <div id="matcha-tray-pagination" class="matcha-tray-pagination-bar" style="display:none;"></div>
      </div>
    `;
    }, blueprintsHTML = function(cfg) {
      const curLayout = cfg.layout || "grid";
      return `
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.layoutGrid} Layout Blueprints</span>
          <button type="button" id="btn-smart-shuffle" style="background:none;border:none;color:#ffffff;cursor:pointer;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px;">
            <span style="color:#5ec27f;">${Icons.sparkles}</span> Auto-Arrange
          </button>
        </div>
        <p style="font-size:11px;color:var(--st-text-muted);margin:0 0 12px;">Select an algorithmic layout style or let AI auto-arrange.</p>

        <div class="matcha-blueprint-grid">
          <div class="matcha-blueprint-card ${curLayout === "grid" ? "is-active" : ""}" data-layout="grid">
            <span class="matcha-blueprint-icon">${Icons.layoutGrid}</span>
            <div class="matcha-blueprint-title">Classic Grid</div>
            <div class="matcha-blueprint-desc">Uniform aspect ratio</div>
          </div>
          <div class="matcha-blueprint-card ${curLayout === "masonry" ? "is-active" : ""}" data-layout="masonry">
            <span class="matcha-blueprint-icon">${Icons.masonry}</span>
            <div class="matcha-blueprint-title">Pinterest Masonry</div>
            <div class="matcha-blueprint-desc">Dynamic heights</div>
          </div>
          <div class="matcha-blueprint-card ${curLayout === "justified" ? "is-active" : ""}" data-layout="justified">
            <span class="matcha-blueprint-icon">${Icons.justified}</span>
            <div class="matcha-blueprint-title">Justified Rows</div>
            <div class="matcha-blueprint-desc">Flickr edge-to-edge</div>
          </div>
          <div class="matcha-blueprint-card ${curLayout === "mosaic" ? "is-active" : ""}" data-layout="mosaic">
            <span class="matcha-blueprint-icon">${Icons.mosaic}</span>
            <div class="matcha-blueprint-title">
              PhotoBlocks Mosaic
            </div>
            <div class="matcha-blueprint-desc">Custom tile spans</div>
          </div>
          <div class="matcha-blueprint-card ${curLayout === "bento" ? "is-active" : ""}" data-layout="bento">
            <span class="matcha-pro-badge">PRO</span>
            <span class="matcha-blueprint-icon">${Icons.bento}</span>
            <div class="matcha-blueprint-title">
              Bento Showcase
            </div>
            <div class="matcha-blueprint-desc">Modern hero spread</div>
          </div>
          <div class="matcha-blueprint-card ${curLayout === "pinwheel" ? "is-active" : ""}" data-layout="pinwheel">
            <span class="matcha-pro-badge">PRO</span>
            <span class="matcha-blueprint-icon">${Icons.pinwheel}</span>
            <div class="matcha-blueprint-title">
              Pinwheel Spiral
            </div>
            <div class="matcha-blueprint-desc">Center hero + spiral</div>
          </div>
        </div>
      </div>
    `;
    }, superpowersHTML = function(cfg) {
      return `
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.folder} Multi-Section Chapters <span class="matcha-pro-badge">PRO</span></span>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-sections-toggle" ${isPro && cfg.sectionsEnabled !== false ? "checked" : ""}>
          Enable Chapter Tab Navigation
        </label>
        <p style="font-size:10px;color:var(--st-text-muted);margin:4px 0 16px 22px;">
          Displays a multi-tab chapter bar above the gallery (e.g. Ceremony, Reception, Portraits).
        </p>

        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.palette} AI Color Swatches <span class="matcha-pro-badge">PRO</span></span>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-color-filter" ${isPro && cfg.colorFilterEnabled ? "checked" : ""}>
          Enable Live Color Swatches Filter
        </label>
        <p style="font-size:10px;color:var(--st-text-muted);margin:4px 0 16px 22px;">
          Visitors can click color dots above the gallery to filter photos by dominant palette.
        </p>

        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.shoppingBag} Shoppable Portfolios <span class="matcha-pro-badge">PRO</span></span>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-shoppable" ${isPro && cfg.shoppableEnabled !== false ? "checked" : ""}>
          Enable Shoppable Buy Buttons
        </label>
        <p style="font-size:10px;color:var(--st-text-muted);margin:4px 0 16px 22px;">
          Displays glassmorphic Buy / Shop Now action buttons on image hover.
        </p>

        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.heart} Client Proofing <span class="matcha-pro-badge">PRO</span></span>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-proofing" ${isPro && cfg.proofingEnabled ? "checked" : ""}>
          Enable Favorites Tray & Export
        </label>
        <p style="font-size:10px;color:var(--st-text-muted);margin:4px 0 0 22px;">
          Clients can heart photos and export a clean list of selected image IDs with 1 click.
        </p>

        
      </div>
    `;
    }, renderRightPanel = function() {
      const panel = document.getElementById("studio-right-panel");
      const headerTitle = document.getElementById("right-panel-header-title");
      const deselectBtn = document.getElementById("btn-deselect-photo");
      const cfg = getState().config;
      if (selectedPhotoId) {
        headerTitle.textContent = `Photo #${selectedPhotoId} Inspector`;
        deselectBtn.style.display = "block";
        panel.innerHTML = photoInspectorHTML(selectedPhotoId, cfg);
        bindPhotoInspector(selectedPhotoId);
      } else {
        headerTitle.textContent = "Wall & Gallery Properties";
        deselectBtn.style.display = "none";
        panel.innerHTML = wallPropertiesHTML(cfg);
        bindWallProperties();
      }
    }, wallPropertiesHTML = function(cfg) {
      const curFrame = cfg.frameStyle || "none";
      const curShadow = cfg.shadowElevation || "soft";
      const curTheme = cfg.cardTheme || "clean";
      const curPag = cfg.paginationType || "none";
      return `
      <!-- Curated Style Preset (Skins) -->
      <div class="matcha-card" style="border: 1px solid rgba(94, 194, 127, 0.35); background: rgba(94, 194, 127, 0.04);">
        <div class="matcha-card-title">
          <span class="heading-wrap" style="color:#5ec27f;">${Icons.palette} Curated Style Preset (Skin)</span>
        </div>
        <select id="st-style-preset" class="matcha-dark-select" style="margin-bottom:6px;font-weight:600;">
          <option value="custom" ${(cfg.stylePreset || "custom") === "custom" ? "selected" : ""}>Custom (Manual Adjustments)</option>
          <option value="exhibition-frame" ${cfg.stylePreset === "exhibition-frame" ? "selected" : ""}>Exhibition Hairline Frame (The Grid: Brasilia)</option>
          <option value="architectural-curtain" ${cfg.stylePreset === "architectural-curtain" ? "selected" : ""}>Architectural Curtain (The Grid: Sofia)</option>
          <option value="cinematic-pullback" ${cfg.stylePreset === "cinematic-pullback" ? "selected" : ""}>Cinematic Pullback (The Grid: Bogota)</option>
          <option value="minimalist-drawer" ${cfg.stylePreset === "minimalist-drawer" ? "selected" : ""}>Minimalist Bottom Drawer (The Grid: Lome)</option>
        </select>
        <p style="font-size:9.5px;color:var(--st-text-muted);margin:0;line-height:1.35;">
          Harmonizes layout, hover effects, frames, and elevation into 1-click cohesive aesthetics.
        </p>
      </div>

      <!-- Picture Frame Styles -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.frame} Picture Framing</span>
        </div>
        <select id="st-frame-style" class="matcha-dark-select" style="margin-bottom:12px;">
          <option value="none" ${curFrame === "none" ? "selected" : ""}>Frameless Clean (Modern)</option>
          <option value="white-mat" ${curFrame === "white-mat" ? "selected" : ""}>Gallery White Matting</option>
          <option value="black-metal" ${curFrame === "black-metal" ? "selected" : ""}>Slim Matte Black Metal (PRO)</option>
          <option value="natural-oak" ${curFrame === "natural-oak" ? "selected" : ""}>Natural Oak Wood (PRO)</option>
          <option value="gold-brass" ${curFrame === "gold-brass" ? "selected" : ""}>Brushed Gold Brass (PRO)</option>
          <option value="glass-float" ${curFrame === "glass-float" ? "selected" : ""}>Glassmorphism 3D Float (PRO)</option>
        </select>

        <div class="range-row">
          <label>Matting Margin</label>
          <input id="st-matting" type="range" min="0" max="32" step="2" value="${cfg.mattingSize ?? 0}">
          <span class="val">${cfg.mattingSize ?? 0}px</span>
        </div>
      </div>

      <!-- Shadow & Elevation -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.sparkles} Shadow & Depth</span>
        </div>
        <select id="st-shadow" class="matcha-dark-select" style="margin-bottom:12px;">
          <option value="none" ${curShadow === "none" ? "selected" : ""}>Flat (No Shadow)</option>
          <option value="soft" ${curShadow === "soft" ? "selected" : ""}>Subtle Soft Float</option>
          <option value="medium" ${curShadow === "medium" ? "selected" : ""}>Medium Drop Shadow</option>
          <option value="gallery-spotlight" ${curShadow === "gallery-spotlight" ? "selected" : ""}>Gallery Spotlight Depth</option>
          <option value="deep-lift" ${curShadow === "deep-lift" ? "selected" : ""}>Deep 3D Hover Lift</option>
        </select>

        <div class="matcha-card-title" style="margin-top:14px;">Card Aesthetic Theme</div>
        <select id="st-theme" class="matcha-dark-select">
          <option value="clean" ${curTheme === "clean" ? "selected" : ""}>Clean Minimalist</option>
          <option value="dark" ${curTheme === "dark" ? "selected" : ""}>Dark Mode Aesthetic</option>
          <option value="glass" ${curTheme === "glass" ? "selected" : ""}>Glassmorphic Frost (PRO)</option>
          <option value="glow" ${curTheme === "glow" ? "selected" : ""}>Matcha Glow Lift (PRO)</option>
        </select>

        <div class="matcha-card-title" style="margin-top:14px;">Photo Hover Animation</div>
        <select id="st-hover-effect" class="matcha-dark-select">
          <option value="zoom" ${(cfg.hoverEffect || "zoom") === "zoom" ? "selected" : ""}>Smooth Zoom (The Grid Malabo)</option>
          <option value="pullback" ${(cfg.hoverEffect || "zoom") === "pullback" ? "selected" : ""}>Cinematic Pullback (The Grid Bogota)</option>
          <option value="frame" ${(cfg.hoverEffect || "zoom") === "frame" ? "selected" : ""}>Editorial Hairline Frame (The Grid Brasilia)</option>
          <option value="curtain" ${(cfg.hoverEffect || "zoom") === "curtain" ? "selected" : ""}>Architectural Curtain (The Grid Sofia)</option>
          <option value="drawer" ${(cfg.hoverEffect || "zoom") === "drawer" ? "selected" : ""}>Minimalist Bottom Drawer (The Grid Lome)</option>
          <option value="grayscale" ${(cfg.hoverEffect || "zoom") === "grayscale" ? "selected" : ""}>Monochrome to Vibrant Color</option>
          <option value="none" ${(cfg.hoverEffect || "zoom") === "none" ? "selected" : ""}>Clean Static (No Effect)</option>
        </select>

        <div id="wrap-hover-frame-color" style="margin-top:10px;display:${(cfg.hoverEffect || "zoom") === "frame" ? "block" : "none"};">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:4px;">
            Brasilia Hairline Frame Color
          </label>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="color" id="st-hover-frame-color-picker" value="${cfg.hoverFrameColor || "#ffffff"}" style="width:28px;height:28px;padding:0;border:none;border-radius:4px;cursor:pointer;background:none;" />
            <input type="text" id="st-hover-frame-color" class="matcha-dark-input" value="${escapeHtml(cfg.hoverFrameColor || "")}" placeholder="rgba(255,255,255,0.45) or #ffffff" style="font-size:11px;flex:1;" />
          </div>
        </div>

        <div style="margin-top:12px;">
          <div class="matcha-card-title" style="margin-bottom:4px;">Mobile Touch Behavior</div>
          <select id="st-hover-mobile-tap" class="matcha-dark-select">
            <option value="lightbox" ${(cfg.hoverMobileTap || "lightbox") === "lightbox" ? "selected" : ""}>Direct Lightbox Open (Fast & Standard)</option>
            <option value="reveal" ${cfg.hoverMobileTap === "reveal" ? "selected" : ""}>Tap to Reveal Overlay (Captions & Actions First)</option>
          </select>
          <div style="font-size:9.5px;color:var(--st-text-muted);margin-top:4px;line-height:1.3;">
            On touch screens, choose whether tapping immediately opens the lightbox or reveals titles and buttons first.
          </div>
        </div>
      </div>

      <!-- Grid Dimensions & Spacing -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.sliders} Dimensions & Gaps</span>
        </div>
        ${cfg.layout === "justified" ? `
          <div class="range-row">
            <label>Row Height</label>
            <input id="st-row-height" type="range" min="140" max="400" step="10" value="${cfg.rowHeight || 240}">
            <span class="val">${cfg.rowHeight || 240}px</span>
          </div>
        ` : `
          <div class="range-row">
            <label>Desktop Columns</label>
            <input id="st-col" type="range" min="1" max="6" value="${cfg.columns || 3}">
            <span class="val">${cfg.columns || 3}</span>
          </div>
        `}
        <div class="range-row">
          <label>Tablet Columns</label>
          <input id="st-colt" type="range" min="1" max="4" value="${cfg.columnsTablet || 2}">
          <span class="val">${cfg.columnsTablet || 2}</span>
        </div>
        <div class="range-row">
          <label>Mobile Columns</label>
          <input id="st-colm" type="range" min="1" max="2" value="${cfg.columnsMobile || 1}">
          <span class="val">${cfg.columnsMobile || 1}</span>
        </div>
        <div class="range-row">
          <label>Gutter Gap</label>
          <input id="st-gut" type="range" min="0" max="48" step="4" value="${cfg.gutterSize ?? 16}">
          <span class="val">${cfg.gutterSize ?? 16}px</span>
        </div>
        <div class="range-row">
          <label>Corner Radius</label>
          <input id="st-rad" type="range" min="0" max="32" step="2" value="${cfg.borderRadius ?? 10}">
          <span class="val">${cfg.borderRadius ?? 10}px</span>
        </div>
      </div>

      <!-- Progressive Loading & Pagination -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.fileText} Loading & Pagination</span>
        </div>
        
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:8px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-instant-frames" ${cfg.instantFramesEnabled !== false ? "checked" : ""}>
          Enable Instant Zero-CLS Frames
        </label>
        
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:8px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-preloader" ${cfg.preloaderEnabled !== false ? "checked" : ""}>
          Enable Gallery Pre-Loader
        </label>

        <label style="display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:12px;cursor:pointer;color:var(--st-text-primary);">
          <span style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="st-randomize-load" ${isPro && cfg.randomizeOrder ? "checked" : ""}>
            Randomize on Page Load
          </span>
          <span class="matcha-pro-badge" style="font-size:9px;padding:1px 5px;">PRO</span>
        </label>

        ${cfg.preloaderEnabled !== false ? `
          <div style="padding-top:8px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:12px;">
            <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Preloader Visual Style</label>
            <select id="st-preloader-style" class="matcha-dark-select">
              <option value="spinner" ${(cfg.preloaderStyle || "spinner") === "spinner" ? "selected" : ""}>Matcha Spinner (Classic)</option>
              <option value="pulse" ${(cfg.preloaderStyle || "spinner") === "pulse" ? "selected" : ""}>Soft Pulse Overlay (PRO)</option>
              <option value="skeleton" ${(cfg.preloaderStyle || "spinner") === "skeleton" ? "selected" : ""}>Shimmering Skeleton Boxes (PRO)</option>
            </select>
          </div>
        ` : ""}

        <div class="matcha-card-title" style="margin-top:14px;">Pagination Type</div>
        <select id="st-pagination" class="matcha-dark-select" style="margin-bottom:12px;">
          <option value="none" ${curPag === "none" ? "selected" : ""}>All Photos (No Pagination)</option>
          <option value="load-more" ${curPag === "load-more" ? "selected" : ""}>Load More Button</option>
          <option value="infinite" ${curPag === "infinite" ? "selected" : ""}>Infinite Smooth Scroll (PRO)</option>
          <option value="pages" ${curPag === "pages" ? "selected" : ""}>Numbered Pages Navigation (PRO)</option>
        </select>

        ${curPag !== "none" ? `
          <div class="range-row">
            <label>Items Per Batch</label>
            <input id="st-items-per-page" type="range" min="4" max="48" step="4" value="${cfg.itemsPerPage || 12}">
            <span class="val">${cfg.itemsPerPage || 12}</span>
          </div>
        ` : ""}

        ${curPag === "load-more" ? `
          <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);margin-top:10px;display:flex;flex-direction:column;gap:10px;">
            <div>
              <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Button Visual Style</label>
              <select id="st-loadmore-style" class="matcha-dark-select">
                <option value="pill" ${(cfg.loadMoreStyle || "pill") === "pill" ? "selected" : ""}>Solid Accent Pill</option>
                <option value="outline" ${(cfg.loadMoreStyle || "pill") === "outline" ? "selected" : ""}>Accent Outline / Border</option>
                <option value="minimal" ${(cfg.loadMoreStyle || "pill") === "minimal" ? "selected" : ""} >Minimalist Text Link </option>
                <option value="glass" ${(cfg.loadMoreStyle || "pill") === "glass" ? "selected" : ""} >Frosted Glass Pill </option>
                <option value="dark" ${(cfg.loadMoreStyle || "pill") === "dark" ? "selected" : ""} >Solid Obsidian Dark </option>
              </select>
            </div>
            <div>
              <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Button Label Text</label>
              <input type="text" id="st-loadmore-label" class="matcha-dark-input" value="${escapeHtml(cfg.loadMoreLabel || "Load More Photos")}" placeholder="Load More Photos" />
            </div>
          </div>
        ` : ""}
      </div>

      <!-- Search & Filters -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.search} Search & Filter Toolbar</span>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:8px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-search" ${cfg.searchEnabled !== false ? "checked" : ""}>
          Enable Live Search Bar
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:8px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-filters" ${cfg.filtersEnabled ? "checked" : ""}>
          Enable Category Pill Filters
        </label>
        <label style="display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:8px;cursor:pointer;color:var(--st-text-primary);">
          <span style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="st-frontend-sort" ${isPro && cfg.frontendSortEnabled ? "checked" : ""}>
            Enable Visitor Sort Dropdown
          </span>
          <span class="matcha-pro-badge" style="font-size:9px;padding:1px 5px;">PRO</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:12px;cursor:pointer;color:var(--st-text-primary);">
          <input type="checkbox" id="st-lightbox" ${cfg.lightboxEnabled ? "checked" : ""}>
          Enable Fullscreen Lightbox
        </label>

        <div style="margin-bottom:12px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Toolbar & Controls Aesthetic Skin</label>
          <select id="st-toolbar-skin" class="matcha-dark-select">
            <option value="capsule" ${(cfg.toolbarSkin || "capsule") === "capsule" ? "selected" : ""}>Modern Capsule (Clean Rounded Pill)</option>
            <option value="underline" ${(cfg.toolbarSkin || "capsule") === "underline" ? "selected" : ""}>Minimalist Hairline (Fine-Art & Editorial) ${!isPro ? "(PRO)" : ""}</option>
            <option value="obsidian" ${(cfg.toolbarSkin || "capsule") === "obsidian" ? "selected" : ""}>Obsidian Dark (Deep Charcoal Glow) ${!isPro ? "(PRO)" : ""}</option>
            <option value="glass" ${(cfg.toolbarSkin || "capsule") === "glass" ? "selected" : ""}>Frosted Glass (Specular Blur) ${!isPro ? "(PRO)" : ""}</option>
          </select>
        </div>

        ${cfg.filtersEnabled ? `
          <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;gap:10px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;color:var(--st-text-primary);">
              <input type="checkbox" id="st-filter-multi" ${isPro && cfg.filterMultiSelect ? "checked" : ""}>
              <span>Enable Multi-Select Filtering</span> <span class="matcha-pro-badge">PRO</span>
            </label>
            
            ${isPro && cfg.filterMultiSelect ? `
              <div>
                <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Multi-Select Intersection Logic</label>
                <select id="st-filter-logic" class="matcha-dark-select">
                  <option value="or" ${(cfg.filterLogic || "or") === "or" ? "selected" : ""}>Match ANY Tag (Expand Results - OR)</option>
                  <option value="and" ${(cfg.filterLogic || "or") === "and" ? "selected" : ""}>Match ALL Tags (Strict Intersection - AND)</option>
                </select>
              </div>
            ` : ""}

            <div>
              <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Filter Visual Style</label>
              <select id="st-filter-style" class="matcha-dark-select">
                <option value="pills" ${(cfg.filterStyle || "pills") === "pills" ? "selected" : ""}>Modern Rounded Pills</option>
                <option value="underline" ${(cfg.filterStyle || "pills") === "underline" ? "selected" : ""}>Minimalist Underline Tabs</option>
                <option value="dark" ${(cfg.filterStyle || "pills") === "dark" ? "selected" : ""} >Solid Obsidian Dark </option>
                <option value="minimal" ${(cfg.filterStyle || "pills") === "minimal" ? "selected" : ""} >Clean Ghost Text </option>
                <option value="glass" ${(cfg.filterStyle || "pills") === "glass" ? "selected" : ""} >Frosted Glassmorphic </option>
              </select>
            </div>

            <div>
              <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Filter Alignment</label>
              <select id="st-filter-align" class="matcha-dark-select">
                <option value="left" ${(cfg.filterAlign || "left") === "left" ? "selected" : ""}>Left Aligned</option>
                <option value="center" ${(cfg.filterAlign || "left") === "center" ? "selected" : ""}>Centered</option>
                <option value="right" ${(cfg.filterAlign || "left") === "right" ? "selected" : ""}>Right Aligned</option>
                <option value="between" ${(cfg.filterAlign || "left") === "between" ? "selected" : ""}>Space-Between (Justified)</option>
              </select>
            </div>

            <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;color:var(--st-text-primary);">
              <input type="checkbox" id="st-filter-count" ${cfg.showFilterCount !== false ? "checked" : ""}>
              Show Photo Count Badges
            </label>

            <label style="display:flex;align-items:center;gap:8px;font-size:11px;cursor:pointer;color:var(--st-text-primary);">
              <input type="checkbox" id="st-show-all-filter" ${cfg.showAllFilter !== false ? "checked" : ""}>
              Show "All" Filter Button
            </label>

            ${cfg.showAllFilter !== false ? `
              <div>
                <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">"All" Button Label</label>
                <input type="text" id="st-all-filter-label" class="matcha-dark-input" value="${escapeHtml(cfg.allFilterLabel || "All")}" placeholder="All" />
              </div>
            ` : ""}
          </div>
        ` : ""}

        <div style="margin-top:14px;">
          <button type="button" id="btn-open-filter-manager" class="matcha-cta-btn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;background:rgba(77,164,104,0.16);border:1px solid rgba(77,164,104,0.35);color:#ffffff;font-weight:700;font-size:12px;border-radius:8px;cursor:pointer;">
            <span style="color:#5ec27f;">${Icons.filter}</span> Manage All Gallery Filters
          </button>
        </div>
      </div>

      <!-- Brand & Accent Color -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.palette} Brand & Accent Color</span>
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:6px;">Curated Brand Palettes</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            ${[
        { hex: "#607d66", name: "Matcha Green" },
        { hex: "#3e5242", name: "Dark Moss" },
        { hex: "#0284c7", name: "Ocean Blue" },
        { hex: "#8b5cf6", name: "Royal Violet" },
        { hex: "#d97706", name: "Amber Gold" },
        { hex: "#1e2420", name: "Matcha Slate" }
      ].map((p) => {
        const isSelected = (cfg.accentColor || "#607d66").toLowerCase() === p.hex.toLowerCase();
        return `
                <button type="button" class="btn-accent-preset" data-hex="${p.hex}" style="width:28px;height:28px;border-radius:50%;background:${p.hex};border:2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.2)"};box-shadow:${isSelected ? `0 0 0 2px ${p.hex}, 0 2px 8px rgba(0,0,0,0.4)` : "none"};cursor:pointer;transition:all 0.15s ease;" title="${p.name}"></button>
              `;
      }).join("")}
          </div>
        </div>

        <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);">Custom Brand Hex Color</label>
            
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="color" id="st-accent-picker" value="${cfg.accentColor || "#607d66"}" style="width:36px;height:32px;border:none;border-radius:6px;background:none;cursor:pointer;padding:0;" />
            <input type="text" id="st-accent-hex" class="matcha-dark-input" value="${escapeHtml(cfg.accentColor || "#607d66")}" placeholder="#607d66" style="font-family:monospace;font-size:12px;cursor:text;" />
          </div>
          
        </div>
      </div>
    `;
    }, photoInspectorHTML = function(id, cfg) {
      const m = metaCache.get(id) || {};
      const link = (cfg.imageLinks || {})[id] || {};
      const videoUrl = (cfg.imageVideos || {})[id] || "";
      const fp = (cfg.focalPoints || {})[id] || m.focal_point || { x: 50, y: 50, zoom: 1 };
      const colors = m.colors || [];
      const currentSpan = (cfg.imageSpans || {})[id] || "1x1";
      const media = mediaCache.get(id);
      const imgSrc = media?.media_details?.sizes?.medium_large?.source_url || media?.media_details?.sizes?.medium?.source_url || media?.source_url || "";
      const zoom = isPro ? fp.zoom || 1 : 1;
      const keywords = m.keywords || [];
      const allIds = cfg.imageIds || [];
      const allGalleryTags = /* @__PURE__ */ new Set();
      allIds.forEach((otherId) => {
        const otherMeta = metaCache.get(otherId);
        (otherMeta?.keywords || []).forEach((kw) => {
          const cleanKw = kw.trim();
          if (cleanKw && !keywords.includes(cleanKw)) {
            allGalleryTags.add(cleanKw);
          }
        });
      });
      const availableTags = Array.from(allGalleryTags).sort();
      return `
      <!-- In-Frame Pan & Zoom Cropper -->
      <div class="matcha-card" style="position:relative;">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.crosshair} In-Frame Pan & Focal Crop</span>
          <button type="button" id="btn-reset-ai-focal" style="background:none;border:none;color:#ffffff;cursor:pointer;font-size:10px;font-weight:700;">\u21BA Reset</button>
        </div>
        <p style="font-size:10px;color:var(--st-text-muted);margin:0 0 8px;">Click or drag to pan the photo crop in real time.</p>

        <div id="cropper-box" class="matcha-cropper-box">
          <img id="cropper-img" src="${imgSrc}" style="object-position:${fp.x}% ${fp.y}%;transform:scale(${zoom});transform-origin:${fp.x}% ${fp.y}%;" />
          <div class="matcha-cropper-grid">
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
          </div>
          <div id="cropper-reticle" class="matcha-cropper-reticle" style="left:${fp.x}%;top:${fp.y}%;"></div>
        </div>

        <div class="range-row" id="wrap-crop-zoom" style="position:relative;cursor:${!isPro ? "pointer" : "default"};" title="${!isPro ? "Click to unlock Zoom Scaling with Matcha Pro" : ""}">
          <label style="display:flex;align-items:center;gap:6px;${!isPro ? "pointer-events:none;" : ""}">
            Zoom Scale ${!isPro ? `<span class="matcha-pro-badge" style="font-size:9px;padding:1px 5px;">PRO</span>` : ""}
          </label>
          <input id="prop-crop-zoom" type="range" min="1" max="2.5" step="0.05" value="${zoom}" ${!isPro ? "disabled" : ""} style="${!isPro ? "opacity:0.6;pointer-events:none;" : ""}">
          <span class="val" style="${!isPro ? "pointer-events:none;" : ""}">${zoom.toFixed(2)}x</span>
        </div>

        <div class="range-row">
          <label>Horizontal (X)</label>
          <input id="prop-focal-x" type="range" min="0" max="100" value="${fp.x}">
          <span class="val">${fp.x}%</span>
        </div>

        <div class="range-row">
          <label>Vertical (Y)</label>
          <input id="prop-focal-y" type="range" min="0" max="100" value="${fp.y}">
          <span class="val">${fp.y}%</span>
        </div>
      </div>

      <!-- Tile Geometry Spans -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.mosaic} Mosaic Tile Geometry ${!isPro ? `<span class="matcha-pro-badge">PRO</span>` : ""}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <button type="button" class="matcha-exit-btn prop-span-btn ${currentSpan === "1x1" ? "is-active" : ""}" data-span="1x1">1x1 Standard</button>
          <button type="button" class="matcha-exit-btn prop-span-btn ${currentSpan === "2x1" ? "is-active" : ""}" data-span="2x1">2x1 Wide \u2194</button>
          <button type="button" class="matcha-exit-btn prop-span-btn ${currentSpan === "1x2" ? "is-active" : ""}" data-span="1x2">1x2 Tall \u2195</button>
          <button type="button" class="matcha-exit-btn prop-span-btn ${currentSpan === "2x2" ? "is-active" : ""}" data-span="2x2">2x2 Hero \u2922</button>
        </div>
      </div>

      <!-- Assigned Chapters (PRO) -->
      <div class="matcha-card">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.folder} Assigned Chapters <span class="matcha-pro-badge">PRO</span></span>
        </div>
        ${cfg.sections && cfg.sections.length > 0 ? `
          <p style="font-size:10px;color:var(--st-text-muted);margin:0 0 10px;">Select which chapter tabs this photo appears under.</p>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;">
            ${cfg.sections.map((sec) => {
        const isAssigned = (sec.imageIds || []).includes(id);
        return `
                <label style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:rgba(255,255,255,0.03);border:1px solid ${isAssigned ? "rgba(94,194,127,0.35)" : "rgba(255,255,255,0.07)"};border-radius:6px;cursor:pointer;font-size:11px;color:var(--st-text-primary);transition:all 0.15s ease;">
                  <span style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" class="prop-chapter-checkbox" data-sec-id="${sec.id}" ${isAssigned ? "checked" : ""} style="cursor:pointer;" />
                    <span style="font-weight:600;">${escapeHtml(sec.title)}</span>
                  </span>
                  <span style="font-size:10px;color:var(--st-text-muted);">${(sec.imageIds || []).length} ${(sec.imageIds || []).length === 1 ? "photo" : "photos"}</span>
                </label>
              `;
      }).join("")}
          </div>
        ` : `
          <p style="font-size:10px;color:var(--st-text-muted);margin:0 0 10px;">No chapters created yet. Divide your gallery into stories like Ceremony, Reception, or Behind-The-Scenes.</p>
        `}
        <button type="button" id="btn-inspector-create-chapter" class="matcha-exit-btn" style="width:100%;font-size:10px;color:#ffffff;display:flex;align-items:center;justify-content:center;gap:4px;" title="Create a new chapter and assign this photo">
          <span style="color:#5ec27f;">+</span> Create New Chapter
        </button>
      </div>

      <!-- Interactive Photo SEO & Tag Manager (FREE & FULLY EDITABLE) -->
      <div class="matcha-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-weight:700;font-size:11px;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">Photo SEO & Filter Tags</div>
          <div style="display:flex;gap:4px;">
            ${colors.map((c) => `<span style="width:14px;height:14px;border-radius:50%;background:${c};border:1px solid rgba(255,255,255,0.4);" title="${c}"></span>`).join("")}
          </div>
        </div>

        <div style="margin-bottom:8px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Alt Text (SEO & Accessibility)</label>
          <input type="text" id="prop-alt" class="matcha-dark-input" value="${escapeHtml(m.alt || "")}" placeholder="Alt text for Google & screen readers..." />
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Title</label>
          <input type="text" id="prop-title" class="matcha-dark-input" value="${escapeHtml(m.title || "")}" placeholder="Image title..." />
        </div>

        <!-- Interactive Combobox Tag Manager (Notion / Linear Style) -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;">Filter Tags & Categories (${keywords.length})</label>
            ${keywords.length > 0 ? `
              <button type="button" id="btn-clear-photo-tags" style="background:none;border:none;color:#ef4444;font-size:10px;font-weight:600;cursor:pointer;padding:0;" title="Remove all tags from this photo">Clear All</button>
            ` : ""}
          </div>

          <!-- Active Tag Badges -->
          <div id="inspector-tag-cloud" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
            ${keywords.map((k) => `
              <span class="matcha-badge matcha-badge--ai" style="display:inline-flex;align-items:center;gap:5px;padding:3px 8px;font-size:10px;">
                <span>${escapeHtml(k)}</span>
                <button type="button" class="tag-del-btn" data-del-tag="${escapeHtml(k)}" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:0;font-size:12px;line-height:1;" title="Remove tag">\xD7</button>
              </span>
            `).join("")}
          </div>

          <!-- Smart Searchable Combobox Input with Dedicated Toggle -->
          <div class="matcha-combobox-wrap" style="position:relative;">
            <div style="position:relative;display:flex;align-items:center;">
              <span style="position:absolute;left:8px;color:#64748b;font-size:11px;display:flex;pointer-events:none;">${Icons.search}</span>
              <input type="text" id="prop-combobox-input" class="matcha-dark-input" placeholder="Type tag or click list \u25BE" style="font-size:11px;padding:6px 52px 6px 26px;width:100%;" autocomplete="off" />
              <div style="position:absolute;right:6px;display:flex;align-items:center;gap:4px;">
                <button type="button" id="btn-toggle-tag-dropdown" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;line-height:1;" title="Toggle Gallery Tags List">\u25BE</button>
                <button type="button" id="btn-combobox-add" style="background:none;border:none;color:#ffffff;cursor:pointer;font-weight:700;font-size:13px;padding:1px 3px;line-height:1;" title="Add Tag">+</button>
              </div>
            </div>

            <!-- Floating Suggestions Dropdown with Custom Scrollbar -->
            <div id="tag-suggestions-dropdown" class="matcha-combobox-dropdown" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--st-bg-card);border:1px solid var(--st-border-strong);border-radius:8px;box-shadow:0 14px 35px rgba(0,0,0,0.85);z-index:9999;max-height:200px;overflow-y:auto;padding:6px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Image Link & Click Action -->
      <div class="matcha-card" style="position:relative;">
        <div class="matcha-card-title">
          <span class="heading-wrap">${Icons.link} Image Link & Click Action</span>
        </div>

        <!-- 1. Destination URL Input -->
        <div style="margin-bottom:10px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">
            Target URL (Portfolio, Page, or External Site)
          </label>
          <div style="position:relative;display:flex;align-items:center;">
            <span style="position:absolute;left:8px;color:#64748b;display:flex;pointer-events:none;">${Icons.link}</span>
            <input type="url" id="prop-link-url" class="matcha-dark-input" value="${escapeHtml(link.url || "")}" placeholder="https://example.com/project-or-page" style="padding-left:26px;" />
          </div>
        </div>

        <!-- 2. Dual Interaction: What happens when clicked? -->
        <div style="margin-bottom:10px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">
            Click Behavior
          </label>
          <select id="prop-link-action" class="matcha-dark-input" style="height:32px;">
            <option value="lightbox" ${(link.clickAction || "lightbox") === "lightbox" ? "selected" : ""}>
              \u{1F50D} Open Lightbox (Dual Action: Show Button in Lightbox & Hover)
            </option>
            <option value="direct" ${link.clickAction === "direct" ? "selected" : ""}>
              \u2197 Direct Link (Clicking image opens URL immediately)
            </option>
          </select>
          <div style="font-size:9.5px;color:var(--st-text-muted);margin-top:3px;line-height:1.3;">
            ${link.clickAction === "direct" ? "Clicking this thumbnail bypasses the lightbox and opens the URL directly." : "Best of both worlds: clicking opens the large preview, while a sleek button lets visitors visit the link."}
          </div>
        </div>

        <!-- 3. Target Window & Button Text -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
          <div>
            <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Open In</label>
            <select id="prop-link-target" class="matcha-dark-input" style="height:32px;">
              <option value="_blank" ${link.target !== "_self" ? "selected" : ""}>New Tab (_blank)</option>
              <option value="_self" ${link.target === "_self" ? "selected" : ""}>Same Window (_self)</option>
            </select>
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">Button Text</label>
            <input type="text" id="prop-link-label" class="matcha-dark-input" value="${escapeHtml(link.label || (link.price ? "Shop Now" : "Visit Link"))}" placeholder="Visit Link" />
          </div>
        </div>

        <!-- 4. Shoppable Hotspot & WooCommerce Section (Pro) -->
        <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:10px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:4px;">
              ${Icons.shoppingBag} E-Commerce Hotspot ${!isPro ? `<span class="matcha-pro-badge">PRO</span>` : ""}
            </span>
            ${link.productId ? `
              <button type="button" id="btn-unlink-woo-product" style="background:none;border:none;color:#ef4444;font-size:10px;cursor:pointer;padding:0;font-weight:600;">
                \u2715 Unlink Product
              </button>
            ` : ""}
          </div>

          ${isPro && isWooActive ? `
            ${link.productId ? `
              <div id="woo-linked-product-card" style="display:flex;align-items:center;gap:8px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:6px;padding:6px 8px;margin-bottom:8px;">
                <div style="width:28px;height:28px;border-radius:4px;overflow:hidden;background:#000;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:14px;">\u{1F6CD}\uFE0F</span>
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:11px;font-weight:600;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${escapeHtml(link.label || "Linked Store Product")}
                  </div>
                  <div style="font-size:10px;color:#a855f7;font-weight:700;">
                    ${escapeHtml(link.price || "In Catalog")} \u2022 Product #${link.productId}
                  </div>
                </div>
              </div>
            ` : `
              <div style="position:relative;margin-bottom:8px;">
                <input
                  type="text"
                  id="woo-product-search-input"
                  class="matcha-dark-input"
                  placeholder="Auto-connect WooCommerce product..."
                  style="padding-left:26px;"
                  autocomplete="off"
                />
                <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:11px;opacity:0.5;pointer-events:none;">\u{1F50D}</span>
                <div id="woo-product-dropdown" class="matcha-woo-dropdown" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;max-height:220px;overflow-y:auto;background:#1e1e24;border:1px solid rgba(255,255,255,0.15);border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,0.6);z-index:9999;padding:4px;"></div>
              </div>
            `}
          ` : isPro && !isWooActive ? `
            <div style="margin-bottom:8px;padding:6px 10px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.12);border-radius:6px;font-size:10px;color:var(--st-text-secondary);line-height:1.4;">
              \u{1F4A1} <em>WooCommerce not detected. You can enter manual price tags below or install WooCommerce to auto-sync catalog products.</em>
            </div>
          ` : ""}

          <div>
            <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">
              Price Tag ${!isPro ? `<span class="matcha-pro-badge" style="font-size:8px;">PRO</span>` : ""}
            </label>
            <input type="text" id="prop-link-price" class="matcha-dark-input" value="${escapeHtml(link.price || "")}" placeholder="$45" ${!isPro ? "disabled" : ""} />
          </div>

          ${!isPro ? `
            <div style="margin-top:10px;padding:8px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.18);border-radius:6px;cursor:pointer;" id="promo-shoppable-pro">
              <div style="font-size:10px;font-weight:700;color:#4ade80;margin-bottom:2px;">\u26A1 Unlock WooCommerce Integration</div>
              <div style="font-size:9.5px;color:#94a3b8;line-height:1.35;">Auto-search store catalog, display floating price tags & Buy Now buttons with Matcha Pro.</div>
            </div>
          ` : ""}
        </div>
      </div>

      <!-- Multimedia & Video URL -->
      <div class="matcha-card" style="position:relative;">
        <div class="matcha-card-title">
          <span class="heading-wrap" style="display:flex;align-items:center;gap:5px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="color:#ef4444;"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            Multimedia & Video URL
          </span>
          ${videoUrl ? `<span class="matcha-badge" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.4);font-size:9px;padding:1px 5px;">VIDEO ACTIVE</span>` : ""}
        </div>

        <div style="margin-bottom:8px;">
          <label style="font-size:10px;font-weight:700;color:var(--st-text-secondary);display:block;margin-bottom:3px;">
            Video Link (YouTube, Vimeo, or Direct MP4)
          </label>
          <div style="position:relative;display:flex;align-items:center;">
            <span style="position:absolute;left:8px;color:#64748b;display:flex;pointer-events:none;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            </span>
            <input type="url" id="prop-video-url" class="matcha-dark-input" value="${escapeHtml(videoUrl)}" placeholder="https://youtube.com/watch?v=... or .mp4" style="padding-left:26px;font-size:11px;" />
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:8px;">
          <button type="button" id="btn-choose-video-media" class="matcha-exit-btn" style="font-size:10px;padding:4px 8px;display:flex;align-items:center;gap:4px;">
            \u{1F4C1} Select MP4 from Media Library
          </button>
          ${videoUrl ? `
            <button type="button" id="btn-remove-video-url" style="background:none;border:none;color:#ef4444;font-size:10px;cursor:pointer;padding:0;font-weight:600;">
              \u2715 Remove Video
            </button>
          ` : ""}
        </div>

        <div style="font-size:9.5px;color:var(--st-text-muted);margin-top:6px;line-height:1.3;">
          Attaching a video displays an architectural Play badge on this thumbnail and plays the video responsively in the fullscreen lightbox.
        </div>
      </div>
    `;
    }, bindWallProperties = function() {
      document.getElementById("st-frame-style")?.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!isPro && ["black-metal", "natural-oak", "gold-brass", "glass-float"].includes(val)) {
          e.target.value = getState().config.frameStyle || "none";
          showProModal("Luxury Picture Framing", "Museum-grade picture frames including Natural Oak Wood, Matte Black Metal, Brushed Gold Brass, and 3D Glass Float are available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ frameStyle: val });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-matting")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value + "px";
        patchConfig({ mattingSize: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-style-preset")?.addEventListener("change", (e) => {
        const val = e.target.value;
        const patch = { stylePreset: val, contentPlacement: "overlay" };
        if (val === "exhibition-frame") {
          patch.hoverEffect = "frame";
          patch.layout = "grid";
        } else if (val === "architectural-curtain") {
          patch.hoverEffect = "curtain";
          patch.layout = "justified";
        } else if (val === "cinematic-pullback") {
          patch.hoverEffect = "pullback";
          patch.layout = "masonry";
        } else if (val === "minimalist-drawer") {
          patch.hoverEffect = "drawer";
          patch.layout = "grid";
        }
        patchConfig(patch);
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-shadow")?.addEventListener("change", (e) => {
        patchConfig({ shadowElevation: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-theme")?.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!isPro && ["glass", "glow"].includes(val)) {
          e.target.value = getState().config.cardTheme || "clean";
          showProModal("Boutique Card Aesthetic Themes", "Bespoke card aesthetics including Glassmorphic Frost and Matcha Glow Lift are available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ cardTheme: val });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-hover-effect")?.addEventListener("change", (e) => {
        patchConfig({ hoverEffect: e.target.value });
        const wrapFrameColor = document.getElementById("wrap-hover-frame-color");
        if (wrapFrameColor) wrapFrameColor.style.display = e.target.value === "frame" ? "block" : "none";
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-hover-frame-color-picker")?.addEventListener("input", (e) => {
        const hexInput = document.getElementById("st-hover-frame-color");
        if (hexInput) hexInput.value = e.target.value;
        patchConfig({ hoverFrameColor: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-hover-frame-color")?.addEventListener("change", (e) => {
        const val = e.target.value.trim();
        patchConfig({ hoverFrameColor: val });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-hover-mobile-tap")?.addEventListener("change", (e) => {
        patchConfig({ hoverMobileTap: e.target.value });
        autosaveSoon();
      });
      document.getElementById("st-pagination")?.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!isPro && ["infinite", "pages"].includes(val)) {
          e.target.value = getState().config.paginationType || "none";
          showProModal("Advanced Pagination", "Infinite viewport scroll and multi-page numbered pagination navigation are available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ paginationType: val });
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-items-per-page")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value;
        patchConfig({ itemsPerPage: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-loadmore-style")?.addEventListener("change", (e) => {
        patchConfig({ loadMoreStyle: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-loadmore-label")?.addEventListener("input", (e) => {
        patchConfig({ loadMoreLabel: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-row-height")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value + "px";
        patchConfig({ rowHeight: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-col")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value;
        patchConfig({ columns: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-colt")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value;
        patchConfig({ columnsTablet: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-colm")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value;
        patchConfig({ columnsMobile: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-gut")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value + "px";
        patchConfig({ gutterSize: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-rad")?.addEventListener("input", (e) => {
        e.target.nextElementSibling.textContent = e.target.value + "px";
        patchConfig({ borderRadius: parseInt(e.target.value) });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-instant-frames")?.addEventListener("change", (e) => {
        patchConfig({ instantFramesEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-preloader")?.addEventListener("change", (e) => {
        patchConfig({ preloaderEnabled: e.target.checked });
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-preloader-style")?.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!isPro && ["pulse", "skeleton"].includes(val)) {
          e.target.value = getState().config.preloaderStyle || "spinner";
          showProModal("Luxury Preloader Styles", "Cinematic preloading effects including Ambient Soft Pulse and Shimmering Skeleton Boxes are available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ preloaderStyle: val });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-randomize-load")?.addEventListener("change", (e) => {
        if (!isPro) {
          e.target.checked = false;
          showProModal(
            "Randomize Photos on Page Load",
            "Upgrade to Matcha Gallery Pro to deliver dynamic galleries that automatically shuffle photo order on every visitor page load."
          );
          return;
        }
        patchConfig({ randomizeOrder: e.target.checked });
        autosaveSoon();
      });
      document.getElementById("st-toolbar-skin")?.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!isPro && ["underline", "obsidian", "glass"].includes(val)) {
          e.target.value = getState().config.toolbarSkin || "capsule";
          showProModal(
            "Luxury Toolbar & Controls Skins",
            "Aesthetic toolbar skins including Minimalist Hairline, Obsidian Dark, and Frosted Glass are available in Matcha Gallery Pro."
          );
          return;
        }
        patchConfig({ toolbarSkin: val });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-search")?.addEventListener("change", (e) => {
        patchConfig({ searchEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-frontend-sort")?.addEventListener("change", (e) => {
        if (!isPro) {
          e.target.checked = false;
          showProModal(
            "Visitor Sort Dropdown",
            "Upgrade to Matcha Gallery Pro to let visitors interactively sort your gallery by newest, oldest, or alphabetically directly on your website."
          );
          return;
        }
        patchConfig({ frontendSortEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-filters")?.addEventListener("change", (e) => {
        patchConfig({ filtersEnabled: e.target.checked });
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-filter-multi")?.addEventListener("change", (e) => {
        if (!isPro) {
          e.target.checked = false;
          showProModal(
            "Multi-Select Faceted Filtering",
            "Upgrade to Matcha Gallery Pro to enable advanced multi-tag filtering with custom AND/OR intersection logic."
          );
          return;
        }
        patchConfig({ filterMultiSelect: e.target.checked });
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-filter-logic")?.addEventListener("change", (e) => {
        patchConfig({ filterLogic: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-filter-style")?.addEventListener("change", (e) => {
        patchConfig({ filterStyle: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-filter-align")?.addEventListener("change", (e) => {
        patchConfig({ filterAlign: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-filter-count")?.addEventListener("change", (e) => {
        patchConfig({ showFilterCount: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-show-all-filter")?.addEventListener("change", (e) => {
        patchConfig({ showAllFilter: e.target.checked });
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-all-filter-label")?.addEventListener("input", (e) => {
        patchConfig({ allFilterLabel: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-lightbox")?.addEventListener("change", (e) => {
        patchConfig({ lightboxEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.querySelectorAll(".btn-accent-preset").forEach((btn) => {
        btn.addEventListener("click", () => {
          const hex = btn.dataset.hex;
          patchConfig({ accentColor: hex });
          renderRightPanel();
          renderCanvas();
          autosaveSoon();
        });
      });
      const accentPicker = document.getElementById("st-accent-picker");
      const accentHex = document.getElementById("st-accent-hex");
      accentPicker?.addEventListener("input", (e) => {
        if (accentHex) accentHex.value = e.target.value;
        patchConfig({ accentColor: e.target.value });
        renderCanvas();
        autosaveSoon();
      });
      accentHex?.addEventListener("change", (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith("#")) val = "#" + val;
        if (/^#[0-9a-fA-F]{3,8}$/.test(val)) {
          if (accentPicker) accentPicker.value = val;
          patchConfig({ accentColor: val });
          renderRightPanel();
          renderCanvas();
          autosaveSoon();
        }
      });
      document.getElementById("btn-open-filter-manager")?.addEventListener("click", () => {
        openFilterManagerModal();
      });
    }, bindPhotoInspector = function(id) {
      const cropperBox = document.getElementById("cropper-box");
      const reticle = document.getElementById("cropper-reticle");
      const cropperImg = document.getElementById("cropper-img");
      const zoomInp = document.getElementById("prop-crop-zoom");
      const xInp = document.getElementById("prop-focal-x");
      const yInp = document.getElementById("prop-focal-y");
      function updateCrop(x, y, zoom) {
        const currentFp = { ...getState().config.focalPoints || {} };
        currentFp[id] = { x, y, zoom };
        patchConfig({ focalPoints: currentFp });
        if (reticle) {
          reticle.style.left = `${x}%`;
          reticle.style.top = `${y}%`;
        }
        if (cropperImg) {
          cropperImg.style.objectPosition = `${x}% ${y}%`;
          cropperImg.style.transform = `scale(${zoom})`;
          cropperImg.style.transformOrigin = `${x}% ${y}%`;
        }
        if (xInp) {
          xInp.value = x;
          xInp.nextElementSibling.textContent = `${x}%`;
        }
        if (yInp) {
          yInp.value = y;
          yInp.nextElementSibling.textContent = `${y}%`;
        }
        if (zoomInp) {
          zoomInp.value = zoom;
          zoomInp.nextElementSibling.textContent = `${zoom.toFixed(2)}x`;
        }
        renderCanvas();
        autosaveSoon();
      }
      document.getElementById("wrap-crop-zoom")?.addEventListener("click", () => {
        if (!isPro) {
          showProModal("In-Frame Zoom Scaling (1.0x \u2013 2.5x)", "Magnify subjects and create tight editorial close-ups directly inside the gallery frame. Available in Matcha Gallery Pro.");
        }
      });
      if (cropperBox) {
        {
          let isDragging = false;
          const handlePointer = (e) => {
            const rect = cropperBox.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = Math.max(0, Math.min(100, Math.round((clientX - rect.left) / rect.width * 100)));
            const y = Math.max(0, Math.min(100, Math.round((clientY - rect.top) / rect.height * 100)));
            const curZoom = isPro ? parseFloat(zoomInp?.value || 1) : 1;
            updateCrop(x, y, curZoom);
          };
          cropperBox.addEventListener("mousedown", (e) => {
            isDragging = true;
            handlePointer(e);
          });
          window.addEventListener("mousemove", (e) => {
            if (isDragging) handlePointer(e);
          });
          window.addEventListener("mouseup", () => {
            isDragging = false;
          });
          cropperBox.addEventListener("touchstart", (e) => {
            isDragging = true;
            handlePointer(e);
          });
          window.addEventListener("touchmove", (e) => {
            if (isDragging) handlePointer(e);
          });
          window.addEventListener("touchend", () => {
            isDragging = false;
          });
        }
      }
      zoomInp?.addEventListener("input", (e) => {
        if (!isPro) return;
        const z = parseFloat(e.target.value);
        const curX = parseInt(xInp?.value || 50);
        const curY = parseInt(yInp?.value || 50);
        updateCrop(curX, curY, z);
      });
      xInp?.addEventListener("input", (e) => {
        const x = parseInt(e.target.value);
        const curY = parseInt(yInp?.value || 50);
        const curZ = isPro ? parseFloat(zoomInp?.value || 1) : 1;
        updateCrop(x, curY, curZ);
      });
      yInp?.addEventListener("input", (e) => {
        const y = parseInt(e.target.value);
        const curX = parseInt(xInp?.value || 50);
        const curZ = isPro ? parseFloat(zoomInp?.value || 1) : 1;
        updateCrop(curX, y, curZ);
      });
      document.getElementById("btn-reset-ai-focal")?.addEventListener("click", () => {
        const m = metaCache.get(id);
        const aiFp = m?.focal_point || { x: 50, y: 50 };
        updateCrop(aiFp.x, aiFp.y, isPro ? aiFp.zoom || 1 : 1);
      });
      function addTags(rawInput) {
        if (!rawInput) return;
        const tagsToAdd = (Array.isArray(rawInput) ? rawInput : rawInput.split(",")).map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")).filter((t) => t.length > 0);
        if (tagsToAdd.length === 0) return;
        const m = metaCache.get(id) || {};
        const currentKeywords = [...m.keywords || []];
        let changed = false;
        tagsToAdd.forEach((t) => {
          if (!currentKeywords.includes(t)) {
            currentKeywords.push(t);
            changed = true;
          }
        });
        if (changed) {
          m.keywords = currentKeywords;
          metaCache.set(id, m);
          dirtyMetaIds.add(id);
          renderRightPanel();
          renderCanvas();
          updateScorecard();
          autosaveSoon();
        }
      }
      function addTag(newTag) {
        addTags(newTag);
      }
      function toggleTag(rawTag) {
        const tag = rawTag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
        if (!tag) return;
        const m = metaCache.get(id) || {};
        let currentKeywords = [...m.keywords || []];
        if (currentKeywords.includes(tag)) {
          currentKeywords = currentKeywords.filter((k) => k !== tag);
        } else {
          currentKeywords.push(tag);
        }
        m.keywords = currentKeywords;
        metaCache.set(id, m);
        dirtyMetaIds.add(id);
        renderRightPanel();
        renderCanvas();
        updateScorecard();
        autosaveSoon();
        setTimeout(() => {
          const inp = document.getElementById("prop-combobox-input");
          if (inp) {
            inp.focus();
            renderTagSuggestions(inp.value);
          }
        }, 30);
      }
      function removeTag(tagToRemove) {
        const m = metaCache.get(id) || {};
        m.keywords = (m.keywords || []).filter((k) => k !== tagToRemove);
        metaCache.set(id, m);
        dirtyMetaIds.add(id);
        renderRightPanel();
        renderCanvas();
        updateScorecard();
        autosaveSoon();
      }
      const comboboxInput = document.getElementById("prop-combobox-input");
      const dropdown = document.getElementById("tag-suggestions-dropdown");
      const addBtn = document.getElementById("btn-combobox-add");
      const allIds = getState().config.imageIds || [];
      function renderTagSuggestions(filterText = "") {
        if (!dropdown) return;
        const query = filterText.toLowerCase().trim();
        const currentTags = (metaCache.get(id)?.keywords || []).map((k) => k.toLowerCase().trim());
        const galleryTagCounts = {};
        allIds.forEach((otherId) => {
          const otherMeta = metaCache.get(otherId);
          (otherMeta?.keywords || []).forEach((k) => {
            const clean = k.toLowerCase().trim();
            if (clean) {
              galleryTagCounts[clean] = (galleryTagCounts[clean] || 0) + 1;
            }
          });
        });
        currentTags.forEach((t) => {
          if (!galleryTagCounts[t]) galleryTagCounts[t] = 1;
        });
        const allUnique = Object.keys(galleryTagCounts).sort();
        const matchingTags = allUnique.filter((t) => query === "" || t.includes(query));
        let html = "";
        if (query !== "") {
          const parts = query.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
          const newParts = parts.filter((p) => !currentTags.includes(p.toLowerCase().replace(/[^a-z0-9_-]/g, "-")));
          if (newParts.length > 0) {
            html += `
            <div class="combobox-item combobox-item--create" data-tags="${escapeHtml(newParts.join(","))}" style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:6px;cursor:pointer;background:rgba(77,164,104,0.16);border:1px solid rgba(77,164,104,0.35);color:#5ec27f;font-size:11px;font-weight:600;margin-bottom:6px;">
              <span>\u2795 Add ${newParts.length > 1 ? `${newParts.length} tags` : `tag`}: "<strong>${escapeHtml(newParts.join(", "))}</strong>"</span>
              <span style="font-size:9px;color:#ffffff;background:rgba(77,164,104,0.35);padding:2px 6px;border-radius:4px;border:1px solid rgba(77,164,104,0.4);">Enter \u21B5</span>
            </div>
          `;
          }
        }
        if (matchingTags.length > 0) {
          html += `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:4px;">
            <span style="font-size:9px;font-weight:700;color:#9aa79d;text-transform:uppercase;letter-spacing:0.5px;">Gallery Tags (${matchingTags.length})</span>
            <span style="font-size:9px;color:#9aa79d;">Click to toggle multi-select</span>
          </div>
        `;
          html += matchingTags.map((tag) => {
            const isSelected = currentTags.includes(tag);
            return `
            <div class="combobox-item ${isSelected ? "is-selected" : ""}" data-tag="${escapeHtml(tag)}" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-radius:6px;cursor:pointer;color:${isSelected ? "#ffffff" : "#e2e8f0"};background:${isSelected ? "rgba(77,164,104,0.18)" : "transparent"};font-size:11px;transition:all 0.15s ease;margin-bottom:1px;">
              <span style="display:flex;align-items:center;gap:8px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;border:1px solid ${isSelected ? "#4da468" : "rgba(255,255,255,0.2)"};background:${isSelected ? "#4da468" : "rgba(255,255,255,0.04)"};color:#fff;font-size:10px;font-weight:900;">
                  ${isSelected ? "\u2713" : "+"}
                </span>
                <span style="font-weight:${isSelected ? "700" : "500"};">${escapeHtml(tag)}</span>
              </span>
              <span style="background:rgba(255,255,255,0.08);color:#94a3b8;font-size:10px;padding:1px 6px;border-radius:999px;">${galleryTagCounts[tag]}</span>
            </div>
          `;
          }).join("");
        } else if (query === "" && allUnique.length === 0) {
          html += `<div style="padding:12px;text-align:center;color:#64748b;font-size:11px;">No gallery tags yet. Type to create one!</div>`;
        } else if (matchingTags.length === 0) {
          html += `<div style="padding:10px;text-align:center;color:#64748b;font-size:11px;">No matching tags. Press Enter to create.</div>`;
        }
        dropdown.innerHTML = html;
        dropdown.style.display = "block";
        dropdown.querySelectorAll(".combobox-item").forEach((item) => {
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (item.classList.contains("combobox-item--create")) {
              const tags = item.dataset.tags;
              addTags(tags);
              if (comboboxInput) {
                comboboxInput.value = "";
                comboboxInput.focus();
              }
              renderTagSuggestions("");
            } else {
              toggleTag(item.dataset.tag);
            }
          });
          item.addEventListener("mouseenter", () => {
            if (!item.classList.contains("is-selected") && !item.classList.contains("combobox-item--create")) {
              item.style.background = "rgba(255,255,255,0.06)";
            }
          });
          item.addEventListener("mouseleave", () => {
            if (!item.classList.contains("is-selected") && !item.classList.contains("combobox-item--create")) {
              item.style.background = "transparent";
            }
          });
        });
      }
      if (comboboxInput) {
        comboboxInput.addEventListener("focus", () => {
          renderTagSuggestions(comboboxInput.value);
        });
        comboboxInput.addEventListener("input", () => {
          renderTagSuggestions(comboboxInput.value);
        });
        comboboxInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const firstCreate = dropdown.querySelector(".combobox-item--create");
            const firstItem = dropdown.querySelector(".combobox-item");
            if (firstCreate) {
              addTags(firstCreate.dataset.tags);
              comboboxInput.value = "";
              renderTagSuggestions("");
            } else if (firstItem) {
              toggleTag(firstItem.dataset.tag);
            } else if (comboboxInput.value.trim()) {
              addTags(comboboxInput.value.trim());
              comboboxInput.value = "";
              renderTagSuggestions("");
            }
          } else if (e.key === "Escape") {
            dropdown.style.display = "none";
          }
        });
      }
      const toggleBtn = document.getElementById("btn-toggle-tag-dropdown");
      toggleBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!dropdown) return;
        if (dropdown.style.display === "block") {
          dropdown.style.display = "none";
        } else {
          renderTagSuggestions(comboboxInput?.value || "");
          comboboxInput?.focus();
        }
      });
      addBtn?.addEventListener("click", () => {
        if (comboboxInput?.value.trim()) {
          addTags(comboboxInput.value.trim());
          comboboxInput.value = "";
          renderTagSuggestions("");
        } else {
          comboboxInput?.focus();
          renderTagSuggestions("");
        }
      });
      document.addEventListener("click", (e) => {
        if (dropdown && !e.target.closest(".matcha-combobox-wrap")) {
          dropdown.style.display = "none";
        }
      });
      document.getElementById("btn-clear-photo-tags")?.addEventListener("click", () => {
        const m = metaCache.get(id) || {};
        m.keywords = [];
        metaCache.set(id, m);
        dirtyMetaIds.add(id);
        renderRightPanel();
        renderCanvas();
        updateScorecard();
        autosaveSoon();
      });
      document.querySelectorAll(".tag-del-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeTag(btn.dataset.delTag);
        });
      });
      document.getElementById("prop-alt")?.addEventListener("change", (e) => {
        const m = metaCache.get(id) || {};
        m.alt = e.target.value;
        metaCache.set(id, m);
        dirtyMetaIds.add(id);
        updateScorecard();
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("prop-title")?.addEventListener("change", (e) => {
        const m = metaCache.get(id) || {};
        m.title = e.target.value;
        metaCache.set(id, m);
        dirtyMetaIds.add(id);
        renderCanvas();
        autosaveSoon();
      });
      document.querySelectorAll(".prop-span-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!isPro) {
            showProModal("PhotoBlocks Mosaic Geometry", "Assign custom geometric tile spans (1x1, 2x1 wide, 1x2 tall, 2x2 hero) to create asymmetric photo walls. Available in Matcha Gallery Pro.");
            return;
          }
          const span = btn.dataset.span;
          const currentSpans = { ...getState().config.imageSpans || {} };
          currentSpans[id] = span;
          patchConfig({ imageSpans: currentSpans, layout: "mosaic" });
          renderRightPanel();
          renderCanvas();
          autosaveSoon();
        });
      });
      document.getElementById("promo-shoppable-pro")?.addEventListener("click", () => {
        showProModal(
          "Shoppable Product Hotspots & WooCommerce",
          "Directly connect WooCommerce catalog products, auto-sync live prices and stock, and render sleek floating Buy Now buttons on hover and inside the fullscreen lightbox. Available in Matcha Gallery Pro."
        );
      });
      const updateLink = () => {
        const url = (document.getElementById("prop-link-url")?.value || "").trim();
        const clickAction = document.getElementById("prop-link-action")?.value || "lightbox";
        const target = document.getElementById("prop-link-target")?.value || "_blank";
        const price = isPro ? (document.getElementById("prop-link-price")?.value || "").trim() : "";
        const label = (document.getElementById("prop-link-label")?.value || "").trim() || (price ? "Shop Now" : "Visit Link");
        const currentLinks = { ...getState().config.imageLinks || {} };
        const prevData = currentLinks[id] || {};
        if (!url) {
          delete currentLinks[id];
        } else {
          currentLinks[id] = {
            ...prevData,
            url,
            clickAction,
            target,
            label,
            price
          };
        }
        patchConfig({ imageLinks: currentLinks });
        renderCanvas();
        autosaveSoon();
      };
      document.getElementById("prop-link-url")?.addEventListener("change", updateLink);
      document.getElementById("prop-link-action")?.addEventListener("change", updateLink);
      document.getElementById("prop-link-target")?.addEventListener("change", updateLink);
      document.getElementById("prop-link-price")?.addEventListener("change", updateLink);
      document.getElementById("prop-link-label")?.addEventListener("change", updateLink);
      const updateVideo = (newUrl) => {
        const currentVideos = { ...getState().config.imageVideos || {} };
        const trimmed = (newUrl || "").trim();
        if (trimmed) {
          currentVideos[id] = trimmed;
        } else {
          delete currentVideos[id];
        }
        patchConfig({ imageVideos: currentVideos });
        renderRightPanel();
        renderCanvas();
        autosaveSoon();
      };
      document.getElementById("prop-video-url")?.addEventListener("change", (e) => {
        updateVideo(e.target.value);
      });
      document.getElementById("btn-remove-video-url")?.addEventListener("click", () => {
        updateVideo("");
      });
      document.getElementById("btn-choose-video-media")?.addEventListener("click", () => {
        if (typeof wp === "undefined" || !wp.media) return;
        const frame = wp.media({
          title: "Select Video for Matcha Gallery",
          multiple: false,
          library: { type: "video" }
        });
        frame.on("select", () => {
          const sel = frame.state().get("selection").first().toJSON();
          if (sel && sel.url) {
            updateVideo(sel.url);
          }
        });
        frame.open();
      });
      document.getElementById("btn-unlink-woo-product")?.addEventListener("click", () => {
        const currentLinks = { ...getState().config.imageLinks || {} };
        if (currentLinks[id]) {
          delete currentLinks[id].productId;
          patchConfig({ imageLinks: currentLinks });
          renderRightPanel();
          renderCanvas();
          autosaveSoon();
        }
      });
      const wooInput = document.getElementById("woo-product-search-input");
      const wooDropdown = document.getElementById("woo-product-dropdown");
      let searchDebounceTimer = null;
      if (wooInput && wooDropdown) {
        wooInput.addEventListener("input", (e) => {
          const query = (e.target.value || "").trim();
          clearTimeout(searchDebounceTimer);
          if (query.length < 1) {
            wooDropdown.style.display = "none";
            wooDropdown.innerHTML = "";
            return;
          }
          wooDropdown.innerHTML = '<div style="padding:8px 12px;font-size:11px;color:#94a3b8;text-align:center;">Searching store catalog...</div>';
          wooDropdown.style.display = "block";
          searchDebounceTimer = setTimeout(async () => {
            try {
              const endpoint = `${window.MatchaStudio.root}matcha-gallery-pro/v1/woocommerce/products?search=${encodeURIComponent(query)}&per_page=8`;
              const res = await fetch(endpoint, {
                headers: { "X-WP-Nonce": window.MatchaStudio.nonce }
              });
              if (!res.ok) throw new Error("Search request failed");
              const data = await res.json();
              const products = data.products || [];
              if (products.length === 0) {
                wooDropdown.innerHTML = '<div style="padding:8px 12px;font-size:11px;color:#94a3b8;text-align:center;">No matching products found.</div>';
                return;
              }
              wooDropdown.innerHTML = products.map((p) => `
              <div class="matcha-woo-item" data-id="${p.id}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background 0.15s ease;">
                <img src="${p.thumbnail || ""}" style="width:28px;height:28px;border-radius:4px;object-fit:cover;background:#111;flex-shrink:0;" />
                <div style="flex:1;min-width:0;">
                  <div style="font-size:11px;font-weight:600;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${escapeHtml(p.title)}
                  </div>
                  <div style="font-size:10px;color:#a855f7;font-weight:600;">
                    ${escapeHtml(p.price || "In Catalog")} ${p.in_stock ? '<span style="color:#22c55e;">\u2022 In Stock</span>' : '<span style="color:#ef4444;">\u2022 Out of stock</span>'}
                  </div>
                </div>
              </div>
            `).join("");
              wooDropdown.querySelectorAll(".matcha-woo-item").forEach((itemEl) => {
                itemEl.addEventListener("mouseenter", () => {
                  itemEl.style.background = "rgba(255,255,255,0.08)";
                });
                itemEl.addEventListener("mouseleave", () => {
                  itemEl.style.background = "none";
                });
                itemEl.addEventListener("click", () => {
                  const prodId = parseInt(itemEl.dataset.id, 10);
                  const chosen = products.find((p) => p.id === prodId);
                  if (chosen) {
                    const currentLinks = { ...getState().config.imageLinks || {} };
                    currentLinks[id] = {
                      productId: chosen.id,
                      url: chosen.permalink,
                      price: chosen.price || "",
                      label: "Shop Now",
                      target: "_blank"
                    };
                    patchConfig({ imageLinks: currentLinks });
                    renderRightPanel();
                    renderCanvas();
                    autosaveSoon();
                  }
                });
              });
            } catch (err) {
              wooDropdown.innerHTML = '<div style="padding:8px 12px;font-size:11px;color:#ef4444;text-align:center;">Failed to search store catalog.</div>';
            }
          }, 280);
        });
        document.addEventListener("click", (e) => {
          if (!wooInput.contains(e.target) && !wooDropdown.contains(e.target)) {
            wooDropdown.style.display = "none";
          }
        });
      }
      document.querySelectorAll(".prop-chapter-checkbox").forEach((chk) => {
        chk.addEventListener("change", (e) => {
          if (!isPro) {
            e.target.checked = !e.target.checked;
            showProModal(
              "Multi-Section Gallery Chapters",
              "Divide your gallery into tabbed chapters (e.g. Ceremony, Reception, Portraits). Available in Matcha Gallery Pro."
            );
            return;
          }
          const secId = chk.dataset.secId;
          const sections = [...getState().config.sections || []];
          const targetSec = sections.find((s) => s.id === secId);
          if (!targetSec) return;
          const curSet = new Set(targetSec.imageIds || []);
          if (e.target.checked) {
            curSet.add(id);
          } else {
            curSet.delete(id);
          }
          targetSec.imageIds = Array.from(curSet);
          patchConfig({ sections });
          renderRightPanel();
          renderLeftTab("images");
          renderCanvas();
          autosaveSoon();
        });
      });
      document.getElementById("btn-inspector-create-chapter")?.addEventListener("click", () => {
        openCreateChapterModal(id);
      });
    }, selectPhoto = function(id) {
      selectedPhotoId = id;
      renderRightPanel();
      document.querySelectorAll(".matcha-img-card").forEach((c) => {
        c.classList.toggle("is-selected", parseInt(c.dataset.id) === id);
      });
    }, bindImages = function() {
      document.getElementById("matcha-add-images")?.addEventListener("click", () => {
        const frame = wp.media({
          title: "Select Images for Matcha Gallery",
          multiple: true,
          library: { type: "image" }
        });
        frame.on("select", () => {
          const sel = frame.state().get("selection").toJSON();
          const ids = sel.map((s) => s.id);
          const cur = getState().config.imageIds || [];
          const merged = [.../* @__PURE__ */ new Set([...cur, ...ids])];
          const cfg = getState().config;
          const sections = [...cfg.sections || []];
          const currentSection = sections.find((s) => s.id === activeSectionId);
          const patch = { imageIds: merged };
          if (currentSection) {
            currentSection.imageIds = [.../* @__PURE__ */ new Set([...currentSection.imageIds || [], ...ids])];
            patch.sections = sections;
          }
          patchConfig(patch);
          trayPage = 1;
          renderLeftTab("images");
          renderCanvas();
          autosaveSoon();
        });
        frame.open();
      });
      document.getElementById("matcha-run-ai")?.addEventListener("click", runAI);
      document.getElementById("matcha-smart-fill")?.addEventListener("click", () => {
        smartAutoArrange();
      });
      document.querySelectorAll(".matcha-studio-section-pill[data-sec]").forEach((pill) => {
        pill.addEventListener("click", () => {
          activeSectionId = pill.dataset.sec;
          trayPage = 1;
          renderLeftTab("images");
        });
      });
      document.getElementById("btn-rename-sec")?.addEventListener("click", () => {
        const sections = [...getState().config.sections || []];
        const sec = sections.find((s) => s.id === activeSectionId);
        if (!sec) return;
        const newName = prompt("Rename Chapter:", sec.title);
        if (newName && newName.trim()) {
          sec.title = newName.trim();
          patchConfig({ sections });
          renderLeftTab("images");
          autosaveSoon();
        }
      });
      document.getElementById("btn-delete-sec")?.addEventListener("click", () => {
        if (!confirm("Delete this chapter? (Photos will remain in All Photos)")) return;
        const sections = (getState().config.sections || []).filter((s) => s.id !== activeSectionId);
        activeSectionId = "*";
        patchConfig({ sections });
        renderLeftTab("images");
        autosaveSoon();
      });
      const searchInp = document.getElementById("tray-search-input");
      searchInp?.addEventListener("input", (e) => {
        traySearchQuery = e.target.value.toLowerCase().trim();
        trayPage = 1;
        renderImageList();
      });
      document.getElementById("btn-clear-tray-search")?.addEventListener("click", () => {
        traySearchQuery = "";
        trayPage = 1;
        if (searchInp) searchInp.value = "";
        renderImageList();
      });
      document.querySelectorAll(".matcha-tray-view-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          trayViewMode = btn.dataset.trayView;
          try {
            localStorage.setItem("matcha_studio_tray_density", trayViewMode);
          } catch (e) {
          }
          renderLeftTab("images");
        });
      });
      const sortBtn = document.getElementById("btn-tray-sort-toggle");
      const sortDropdown = document.getElementById("tray-sort-dropdown");
      const filterBtn = document.getElementById("btn-tray-filter-toggle");
      const filterDropdown = document.getElementById("tray-filter-dropdown");
      sortBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sortDropdown) sortDropdown.style.display = sortDropdown.style.display === "block" ? "none" : "block";
        if (filterDropdown) filterDropdown.style.display = "none";
      });
      sortDropdown?.querySelectorAll(".tray-menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const selectedSort = item.dataset.sort;
          if (sortDropdown) sortDropdown.style.display = "none";
          if (!isPro && ["newest", "oldest", "random"].includes(selectedSort)) {
            showProModal(
              "Advanced Gallery Sorting & Shuffling",
              "Upgrade to Matcha Gallery Pro to sort your gallery chronologically by date added (newest/oldest) or shuffle your entire photo order with 1 click."
            );
            return;
          }
          const cfg = getState().config;
          const curIds = [...cfg.imageIds || []];
          if (selectedSort === "manual") {
            patchConfig({ sortBy: "manual" });
          } else if (selectedSort === "name-asc") {
            curIds.sort((a, b) => {
              const nameA = (metaCache.get(a)?.title || mediaCache.get(a)?.title?.rendered || "#" + a).toLowerCase();
              const nameB = (metaCache.get(b)?.title || mediaCache.get(b)?.title?.rendered || "#" + b).toLowerCase();
              return nameA.localeCompare(nameB);
            });
            patchConfig({ imageIds: curIds, sortBy: "name-asc" });
          } else if (selectedSort === "name-desc") {
            curIds.sort((a, b) => {
              const nameA = (metaCache.get(a)?.title || mediaCache.get(a)?.title?.rendered || "#" + a).toLowerCase();
              const nameB = (metaCache.get(b)?.title || mediaCache.get(b)?.title?.rendered || "#" + b).toLowerCase();
              return nameB.localeCompare(nameA);
            });
            patchConfig({ imageIds: curIds, sortBy: "name-desc" });
          } else if (selectedSort === "newest") {
            curIds.sort((a, b) => {
              const dateA = new Date(mediaCache.get(a)?.date || 0).getTime() || a;
              const dateB = new Date(mediaCache.get(b)?.date || 0).getTime() || b;
              return dateB - dateA;
            });
            patchConfig({ imageIds: curIds, sortBy: "newest" });
          } else if (selectedSort === "oldest") {
            curIds.sort((a, b) => {
              const dateA = new Date(mediaCache.get(a)?.date || 0).getTime() || a;
              const dateB = new Date(mediaCache.get(b)?.date || 0).getTime() || b;
              return dateA - dateB;
            });
            patchConfig({ imageIds: curIds, sortBy: "oldest" });
          } else if (selectedSort === "random") {
            for (let i = curIds.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [curIds[i], curIds[j]] = [curIds[j], curIds[i]];
            }
            patchConfig({ imageIds: curIds, sortBy: "random" });
          }
          traySortBy = selectedSort;
          trayPage = 1;
          renderLeftTab("images");
          renderCanvas();
          autosaveSoon();
        });
      });
      filterBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (filterDropdown) filterDropdown.style.display = filterDropdown.style.display === "block" ? "none" : "block";
        if (sortDropdown) sortDropdown.style.display = "none";
      });
      filterDropdown?.querySelectorAll(".tray-menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          trayFilterBy = item.dataset.filter;
          trayPage = 1;
          if (filterDropdown) filterDropdown.style.display = "none";
          renderLeftTab("images");
        });
      });
      document.addEventListener("click", () => {
        if (sortDropdown) sortDropdown.style.display = "none";
        if (filterDropdown) filterDropdown.style.display = "none";
      });
      const leftPanelEl = document.getElementById("studio-left-tabpanel");
      leftPanelEl?.addEventListener("scroll", () => {
        if (leftPanelEl.scrollTop + leftPanelEl.clientHeight >= leftPanelEl.scrollHeight - 160) {
          if (typeof window.__matchaTrayLoadMore === "function") {
            window.__matchaTrayLoadMore();
          }
        }
      });
      document.getElementById("btn-add-section")?.addEventListener("click", () => {
        openCreateChapterModal();
      });
    }, bindBlueprints = function() {
      document.querySelectorAll(".matcha-blueprint-card").forEach((card) => {
        card.addEventListener("click", () => {
          const layout = card.dataset.layout;
          if (!isPro && (layout === "pinwheel" || layout === "bento")) {
            const names = {
              pinwheel: "Pinwheel Spiral",
              bento: "Bento Showcase"
            };
            showProModal(`Unlock ${names[layout] || "Pro Layout"}`, "Dynamic aspect-ratio tile spanning, focal-directed hero spreads, and bespoke gallery layouts are available in Matcha Gallery Pro.");
            return;
          }
          document.querySelectorAll(".matcha-blueprint-card").forEach((c) => c.classList.remove("is-active"));
          card.classList.add("is-active");
          if (layout === "pinwheel") {
            const ids = getState().config.imageIds || [];
            const spans = {};
            ids.forEach((id, i) => {
              spans[id] = i === 0 ? "2x2" : "1x1";
            });
            patchConfig({ layout: "pinwheel", imageSpans: spans, columns: 4 });
          } else {
            patchConfig({ layout });
          }
          renderLeftTab("blueprints");
          renderCanvas();
          renderRightPanel();
          autosaveSoon();
        });
      });
      document.getElementById("btn-smart-shuffle")?.addEventListener("click", () => {
        smartAutoArrange();
      });
    }, bindSuperpowers = function() {
      document.getElementById("st-sections-toggle")?.addEventListener("change", (e) => {
        if (!isPro && e.target.checked) {
          e.target.checked = false;
          showProModal("Multi-Section Chapters", "Divide your story into tabbed chapters (e.g. Ceremony, Reception, Portraits). Available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ sectionsEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-color-filter")?.addEventListener("change", (e) => {
        if (!isPro && e.target.checked) {
          e.target.checked = false;
          showProModal("AI Color Swatches Palette Filter", "Visitors can filter your photos by clicking dominant color palette swatches automatically extracted by AI. Available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ colorFilterEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-shoppable")?.addEventListener("change", (e) => {
        if (!isPro && e.target.checked) {
          e.target.checked = false;
          showProModal("Shoppable Portfolios", "Display glassmorphic Buy Now buttons and product price hotspots on image hover. Available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ shoppableEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
      document.getElementById("st-proofing")?.addEventListener("change", (e) => {
        if (!isPro && e.target.checked) {
          e.target.checked = false;
          showProModal("Client Proofing Sessions", "Allow clients to favorite photos and export a clean selection list with 1 click. Available in Matcha Gallery Pro.");
          return;
        }
        patchConfig({ proofingEnabled: e.target.checked });
        renderCanvas();
        autosaveSoon();
      });
    }, showStudioToast = function(msg, isSuccess = true) {
      let t = document.getElementById("matcha-studio-toast");
      if (!t) {
        t = document.createElement("div");
        t.id = "matcha-studio-toast";
        t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#181e29;border:1px solid rgba(255,255,255,0.15);color:#fff;padding:8px 20px;border-radius:24px;font-size:12px;font-weight:600;box-shadow:0 8px 28px rgba(0,0,0,0.6);z-index:999999;pointer-events:none;transition:opacity 0.3s ease, transform 0.3s ease;opacity:0;display:flex;align-items:center;gap:8px;backdrop-filter:blur(8px);";
        document.body.appendChild(t);
      }
      t.innerHTML = `<span style="color:#5ec27f;font-size:14px;">\u2726</span> <span>${escapeHtml(msg)}</span>`;
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(0)";
      clearTimeout(t._timer);
      t._timer = setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform = "translateX(-50%) translateY(12px)";
      }, 3200);
    }, smartAutoArrange = function() {
      if (!isPro) {
        showProModal("AI Smart Fill Geometry Matcher", "AI Smart Fill analyzes photo dimensions and aspect ratios across your collection and automatically creates an optimal mosaic arrangement. Available in Matcha Gallery Pro.");
        return;
      }
      const ids = getState().config.imageIds || [];
      if (!ids.length) return alert("Please add images first.");
      const spans = {};
      const total = ids.length;
      let heroesNeeded = total >= 10 ? 2 : total >= 4 ? 1 : 0;
      let heroesAssigned = 0;
      const heroIndices = /* @__PURE__ */ new Set();
      if (heroesNeeded >= 1) heroIndices.add(0);
      if (heroesNeeded >= 2) heroIndices.add(Math.floor(total / 2));
      let landscapeCount = 0;
      let portraitCount = 0;
      ids.forEach((id, idx) => {
        const m = mediaCache.get(id);
        const w = m?.media_details?.width || 1e3;
        const h = m?.media_details?.height || 1e3;
        const ratio = w / h;
        if (heroIndices.has(idx) && heroesAssigned < heroesNeeded) {
          spans[id] = "2x2";
          heroesAssigned++;
        } else if (ratio >= 1.32 && landscapeCount <= portraitCount + 2) {
          spans[id] = "2x1";
          landscapeCount++;
        } else if (ratio <= 0.82 && portraitCount <= landscapeCount + 2) {
          spans[id] = "1x2";
          portraitCount++;
        } else {
          spans[id] = "1x1";
        }
      });
      patchConfig({ layout: "mosaic", imageSpans: spans });
      renderLeftTab("blueprints");
      renderCanvas();
      renderRightPanel();
      autosaveSoon();
      showStudioToast(`AI Smart Fill: Arranged ${total} photos into balanced Mosaic geometry!`);
    }, updateSingleCardMeta = function(attId) {
      const card = document.querySelector(`.matcha-img-card[data-id="${attId}"]`);
      const meta = metaCache.get(attId);
      if (card && meta) {
        const metaEl = card.querySelector(".matcha-img-card__meta");
        if (metaEl) {
          const isAi = meta.ai_generated && meta.keywords?.length > 0;
          metaEl.innerHTML = `
          <div class="matcha-img-card__title">${escapeHtml(meta.title || "#" + attId)}</div>
          <span class="matcha-badge ${isAi ? "matcha-badge--ai" : "matcha-badge--missing"}" title="${escapeHtml((meta.keywords || []).join(", "))}">
            ${isAi ? "\u2713 " + escapeHtml(meta.keywords[0] || "AI Tagged") : "Needs AI"}
          </span>
        `;
        }
      }
    }, updateScorecard = function() {
      const ids = getState().config.imageIds || [];
      const total = ids.length;
      if (!total) {
        document.getElementById("studio-ada-text").textContent = "SEO Score: \u2014";
        return;
      }
      let enriched = 0;
      ids.forEach((id) => {
        const m = metaCache.get(id);
        if (m && (m.ai_generated || m.alt && m.alt.length > 5)) {
          enriched++;
        }
      });
      const percent = Math.round(enriched / total * 100);
      const textEl = document.getElementById("studio-ada-text");
      textEl.textContent = `SEO: ${percent}% (${enriched}/${total})`;
    }, initSortable = function() {
      const list = document.getElementById("matcha-image-list");
      if (!list || !window.Sortable) return;
      if (studioSortableInstance) {
        try {
          studioSortableInstance.destroy();
        } catch (e) {
        }
        studioSortableInstance = null;
      }
      const isFiltering = !!(traySearchQuery || trayFilterBy && trayFilterBy !== "all");
      if (isFiltering) {
        return;
      }
      studioSortableInstance = new Sortable(list, {
        animation: 200,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        swapThreshold: 0.65,
        invertSwap: true,
        invertedSwapThreshold: 0.65,
        forceFallback: true,
        fallbackClass: "matcha-sortable-fallback",
        fallbackOnBody: true,
        fallbackTolerance: 4,
        ghostClass: "matcha-sortable-ghost",
        chosenClass: "matcha-sortable-chosen",
        dragClass: "matcha-sortable-drag",
        filter: ".remove",
        preventOnFilter: true,
        onStart: () => {
          didJustDrag = true;
          document.body.classList.add("matcha-is-dragging");
        },
        onEnd: (evt) => {
          document.body.classList.remove("matcha-is-dragging");
          setTimeout(() => {
            didJustDrag = false;
          }, 80);
          if (evt.oldIndex === evt.newIndex) return;
          const cards = [...list.querySelectorAll(".matcha-img-card")];
          const newIdsInDOM = cards.map((el) => parseInt(el.dataset.id)).filter(Boolean);
          if (!newIdsInDOM.length) return;
          const cfg = getState().config;
          const sections = cfg.sections || [];
          const currentSection = sections.find((s) => s.id === activeSectionId);
          if (currentSection) {
            currentSection.imageIds = newIdsInDOM;
            patchConfig({ sections: [...sections], sortBy: "manual" });
          } else {
            patchConfig({ imageIds: newIdsInDOM, sortBy: "manual" });
          }
          traySortBy = "manual";
          const sortBtn = document.getElementById("btn-tray-sort-toggle");
          if (sortBtn) sortBtn.style.color = "#b5c7ba";
          renderCanvas();
          autosaveSoon();
        }
      });
    }, openFilterManagerModal = function() {
      let modal = document.getElementById("matcha-filter-manager-modal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "matcha-filter-manager-modal";
        modal.className = "matcha-modal";
        document.body.appendChild(modal);
      }
      const cfg = getState().config;
      const allIds = cfg.imageIds || [];
      let visibleFilterTags = [...cfg.visibleFilterTags || []];
      const tagMap = {};
      allIds.forEach((id) => {
        const m = metaCache.get(id);
        const kws = m?.keywords || [];
        kws.forEach((k) => {
          const clean = k.trim();
          if (!clean) return;
          if (!tagMap[clean]) tagMap[clean] = [];
          tagMap[clean].push(id);
        });
      });
      const existingOrder = cfg.orderedFilterTags || [];
      const sortedTags = Object.keys(tagMap).sort((a, b) => {
        const idxA = existingOrder.indexOf(a);
        const idxB = existingOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return tagMap[b].length - tagMap[a].length;
      });
      modal.innerHTML = `
      <div class="matcha-modal-backdrop" id="filter-modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:999999;"></div>
      <div class="matcha-modal-box" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);max-width:500px;width:92vw;max-height:86vh;background:#151a16;border:1px solid var(--st-border-subtle);border-radius:12px;display:flex;flex-direction:column;z-index:1000000;box-shadow:0 25px 60px rgba(0,0,0,0.8);overflow:hidden;font-family:var(--st-font);">
        
        <!-- Compact Modal Header -->
        <div class="matcha-modal-header" style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:28px;height:28px;border-radius:8px;background:rgba(77,164,104,0.16);border:1px solid rgba(77,164,104,0.35);color:#5ec27f;display:flex;align-items:center;justify-content:center;">
              ${Icons.filter}
            </div>
            <div>
              <h3 style="margin:0;font-size:14px;color:#f2f5f3;font-weight:700;letter-spacing:-0.01em;">Gallery Filter Manager</h3>
              <p style="margin:1px 0 0;font-size:11px;color:#9aa79d;">Drag to reorder pills, toggle visibility, or edit tags.</p>
            </div>
          </div>
          <button type="button" class="matcha-modal-close" id="filter-modal-close" style="background:none;border:none;color:#9aa79d;cursor:pointer;font-size:20px;line-height:1;padding:2px 4px;" title="Close">\u2715</button>
        </div>

        <!-- Modal Body -->
        <div class="matcha-modal-body" style="padding:12px 18px;overflow-y:auto;flex:1;">
          ${sortedTags.length === 0 ? `
            <div style="text-align:center;padding:40px 16px;color:#9aa79d;">
              <div style="font-size:28px;margin-bottom:8px;opacity:0.6;display:flex;justify-content:center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
              <p style="font-size:14px;color:#f2f5f3;font-weight:600;margin:0 0 4px;">No tags found in this gallery</p>
              <p style="font-size:11px;margin:0;max-width:320px;margin-inline:auto;">Click "AI Enhance" in the sidebar to auto-generate smart tags.</p>
            </div>
          ` : `
            <!-- Dense Utility Subheader -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px;flex-wrap:wrap;">
              <input type="search" id="filter-mgr-search" placeholder="Find tag..." style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:5px;padding:3px 8px;font-size:11px;width:130px;outline:none;" />
              <div style="display:flex;align-items:center;gap:5px;">
                <button type="button" id="btn-select-all-tags" class="matcha-exit-btn" style="padding:2px 7px;font-size:10px;font-weight:600;color:#5ec27f;border:1px solid rgba(94,194,127,0.3);border-radius:4px;background:rgba(94,194,127,0.08);cursor:pointer;" title="Select all tags">Select All</button>
                <button type="button" id="btn-deselect-all-tags" class="matcha-exit-btn" style="padding:2px 7px;font-size:10px;font-weight:600;color:#9aa79d;border:1px solid rgba(255,255,255,0.15);border-radius:4px;background:none;cursor:pointer;" title="Deselect all tags">Deselect</button>
                <button type="button" id="btn-clear-all-gallery-tags" style="padding:2px 7px;font-size:10px;font-weight:600;color:#ef4444;border:1px solid rgba(239,68,68,0.25);border-radius:4px;background:rgba(239,68,68,0.08);cursor:pointer;" title="Delete all tags from photos">Clear All</button>
              </div>
            </div>

            <!-- Ultra-Compact Draggable Tag Rows -->
            <div style="display:flex;flex-direction:column;gap:3px;max-height:55vh;overflow-y:auto;padding-right:2px;" id="filter-manager-tags-list">
              ${sortedTags.map((tag) => {
        const count = tagMap[tag].length;
        const isChecked = visibleFilterTags.length === 0 || visibleFilterTags.includes(tag);
        return `
                  <div class="filter-manager-row filter-mgr-row" data-tag="${escapeHtml(tag)}" style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:3px 8px;gap:8px;min-height:27px;">
                    <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;">
                      <span class="filter-drag-handle" title="Drag to reorder tag" style="cursor:grab;color:var(--st-text-muted);display:flex;align-items:center;justify-content:center;width:16px;height:16px;flex-shrink:0;">${Icons.drag}</span>
                      <input type="checkbox" class="tag-vis-check" data-tag="${escapeHtml(tag)}" ${isChecked ? "checked" : ""} style="cursor:pointer;accent-color:#4da468;width:13px;height:13px;flex-shrink:0;" title="Show as category pill on frontend" />
                      <span class="tag-badge" style="background:rgba(77,164,104,0.14);border:1px solid rgba(77,164,104,0.25);color:#5ec27f;font-size:10px;font-weight:700;padding:1px 5px;border-radius:999px;flex-shrink:0;">${count}</span>
                      <span class="tag-name" style="font-size:12px;font-weight:500;color:#f2f5f3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(tag)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:3px;flex-shrink:0;">
                      <button type="button" class="btn-rename-tag matcha-row-icon-btn" data-tag="${escapeHtml(tag)}" title="Rename tag globally">
                        ${Icons.edit}
                      </button>
                      <button type="button" class="btn-delete-tag-global matcha-row-icon-btn matcha-row-icon-btn--danger" data-tag="${escapeHtml(tag)}" title="Delete from all photos in this gallery">
                        ${Icons.trash}
                      </button>
                    </div>
                  </div>
                `;
      }).join("")}
            </div>
          `}
        </div>

        <!-- Modal Footer -->
        <div class="matcha-modal-footer" style="display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-top:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.3);">
          <span style="font-size:11px;color:#647367;">Drag to order pills. Uncheck to hide.</span>
          <button type="button" class="matcha-cta-btn" id="filter-modal-done" style="padding:6px 16px;font-size:12px;background:linear-gradient(135deg, #4da468, #377d4f);color:#fff;border-radius:6px;border:1px solid #2e6942;cursor:pointer;font-weight:700;box-shadow:0 2px 8px rgba(55,125,79,0.35);">
            Apply & Save
          </button>
        </div>
      </div>
    `;
      modal.style.display = "block";
      const searchInput = modal.querySelector("#filter-mgr-search");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const q = e.target.value.toLowerCase().trim();
          modal.querySelectorAll(".filter-mgr-row").forEach((row) => {
            const t = (row.dataset.tag || "").toLowerCase();
            row.style.display = !q || t.includes(q) ? "flex" : "none";
          });
        });
      }
      modal.querySelector("#btn-select-all-tags")?.addEventListener("click", () => {
        modal.querySelectorAll(".tag-vis-check").forEach((cb) => {
          cb.checked = true;
        });
      });
      modal.querySelector("#btn-deselect-all-tags")?.addEventListener("click", () => {
        modal.querySelectorAll(".tag-vis-check").forEach((cb) => {
          cb.checked = false;
        });
      });
      const tagListEl = modal.querySelector("#filter-manager-tags-list");
      if (tagListEl && window.Sortable) {
        new window.Sortable(tagListEl, {
          handle: ".filter-drag-handle",
          animation: 150,
          ghostClass: "matcha-sortable-ghost",
          onEnd: () => {
            const currentRows = Array.from(modal.querySelectorAll(".filter-mgr-row"));
            const orderedFilterTags = currentRows.map((row) => row.dataset.tag);
            patchConfig({ orderedFilterTags });
            autosaveSoon();
            renderCanvas();
          }
        });
      }
      const saveAndClose = () => {
        const currentRows = Array.from(modal.querySelectorAll(".filter-mgr-row"));
        const orderedFilterTags = currentRows.map((row) => row.dataset.tag);
        const checkedBoxes = modal.querySelectorAll(".tag-vis-check:checked");
        if (checkedBoxes.length > 0 && checkedBoxes.length < sortedTags.length) {
          visibleFilterTags = [...checkedBoxes].map((cb) => cb.dataset.tag);
        } else {
          visibleFilterTags = [];
        }
        patchConfig({ visibleFilterTags, orderedFilterTags });
        modal.style.display = "none";
        renderCanvas();
        renderRightPanel();
        autosaveSoon();
      };
      modal.querySelector("#filter-modal-close").addEventListener("click", saveAndClose);
      modal.querySelector("#filter-modal-backdrop").addEventListener("click", saveAndClose);
      modal.querySelector("#filter-modal-done").addEventListener("click", saveAndClose);
      modal.querySelectorAll(".btn-delete-tag-global").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tagToDelete = btn.dataset.tag;
          if (!confirm(`Delete tag "${tagToDelete}" from all photos in this gallery?`)) return;
          allIds.forEach((id) => {
            const m = metaCache.get(id);
            if (m?.keywords) {
              m.keywords = m.keywords.filter((k) => k !== tagToDelete);
              metaCache.set(id, m);
              dirtyMetaIds.add(id);
            }
          });
          autosaveSoon();
          openFilterManagerModal();
        });
      });
      modal.querySelectorAll(".btn-rename-tag").forEach((btn) => {
        btn.addEventListener("click", () => {
          const oldTag = btn.dataset.tag;
          const newTag = prompt(`Rename tag "${oldTag}" to:`, oldTag);
          if (!newTag || newTag.trim() === "" || newTag.trim() === oldTag) return;
          const cleanNew = newTag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
          allIds.forEach((id) => {
            const m = metaCache.get(id);
            if (m?.keywords) {
              m.keywords = m.keywords.map((k) => k === oldTag ? cleanNew : k);
              m.keywords = [...new Set(m.keywords)];
              metaCache.set(id, m);
              dirtyMetaIds.add(id);
            }
          });
          autosaveSoon();
          openFilterManagerModal();
        });
      });
      modal.querySelector("#btn-clear-all-gallery-tags")?.addEventListener("click", () => {
        if (!confirm("Are you sure you want to remove ALL tags from ALL photos in this gallery?")) return;
        allIds.forEach((id) => {
          const m = metaCache.get(id);
          if (m) {
            m.keywords = [];
            metaCache.set(id, m);
            dirtyMetaIds.add(id);
          }
        });
        patchConfig({ visibleFilterTags: [], orderedFilterTags: [] });
        autosaveSoon();
        openFilterManagerModal();
      });
    }, capitalize = function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
    }, stripHtml = function(h) {
      const d = document.createElement("div");
      d.innerHTML = h;
      return d.textContent || d.innerText || "";
    }, escapeHtml = function(s) {
      return (s || "").replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[m]);
    }, autosaveSoon = function() {
      clearTimeout(autosaveTimer);
      document.getElementById("save-status").textContent = "\u2026";
      autosaveTimer = setTimeout(autosave, 800);
    };
    const initialId = parseInt(root.dataset.galleryId || "0");
    const initialConfig = (() => {
      try {
        return JSON.parse(root.dataset.config || "{}");
      } catch (e) {
        return window.MatchaStudio?.config || {};
      }
    })();
    const initialTitle = root.dataset.title || window.MatchaStudio?.title || "";
    setState({ galleryId: initialId, title: initialTitle, config: initialConfig });
    const isPro = Boolean(window.MatchaStudio && window.MatchaStudio.isPro);
    const isWooActive = Boolean(window.MatchaStudio && window.MatchaStudio.isWooActive);
    const upgradeUrl = window.MatchaStudio && window.MatchaStudio.upgradeUrl || "https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/";
    const metaCache = /* @__PURE__ */ new Map();
    const mediaCache = /* @__PURE__ */ new Map();
    const dirtyMetaIds = /* @__PURE__ */ new Set();
    let selectedPhotoId = null;
    let activeSectionId = "*";
    let canvasZoom = 100;
    let traySearchQuery = "";
    let trayViewMode = (() => {
      try {
        const saved = localStorage.getItem("matcha_studio_tray_density");
        if (saved && ["list", "grid-2", "grid-3"].includes(saved)) {
          return saved;
        }
      } catch (e) {
      }
      return "grid-2";
    })();
    let traySortBy = initialConfig.sortBy || "manual";
    let trayFilterBy = "all";
    let trayPage = 1;
    const trayBatchSize = 60;
    let isLoadingMore = false;
    root.innerHTML = `
    <div class="matcha-studio">
      <!-- Top Navigation Bar -->
      <header class="matcha-studio__topbar">
        <div style="display:flex;gap:12px;align-items:center;">
          <a href="${window.location.origin + window.location.pathname + "?page=matcha-ai-hub"}" class="matcha-exit-btn">\u2190 Exit Studio</a>
          <a href="#" class="matcha-brand-badge">
            <span class="brand-leaf" style="background:transparent;padding:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:6px;width:24px;height:24px;">
              <img src="${window.MatchaStudio?.iconUrl || ""}" width="24" height="24" style="border-radius:6px;display:block;object-fit:cover;" alt="Matcha" />
            </span>
            <span>Matcha Studio</span>
            <span class="matcha-pro-tag" style="background:rgba(77,164,104,0.18);color:#5ec27f;border-color:rgba(77,164,104,0.35);font-weight:700;">STUDIO</span>
          </a>
          <input id="studio-title" class="matcha-studio__title" value="${escapeHtml(initialTitle || "Untitled Gallery")}" placeholder="Gallery Title..." />
          <span id="save-status" style="font-size:11px;color:#ffffff;font-weight:700;"></span>
        </div>
        <div class="matcha-studio__actions">
          <!-- SEO & ADA Accessibility Scorecard Widget -->
          <div id="studio-ada-scorecard" class="matcha-ada-pill" title="Inspect SEO & Accessibility alt-text">
            <span>${Icons.bolt}</span>
            <span id="studio-ada-text">SEO Score: 0%</span>
          </div>

          <div class="matcha-viewport">
            <button data-vp="desktop" class="is-active" title="Desktop view">${Icons.desktop} Desktop</button>
            <button data-vp="tablet" title="Tablet preview">${Icons.tablet} Tablet</button>
            <button data-vp="mobile" title="Mobile preview">${Icons.mobile} Mobile</button>
          </div>

          <!-- Export Presentation / Snapshot Menu -->
          <div class="matcha-export-wrap">
            <button type="button" id="btn-export-menu" class="matcha-export-btn">
              <span>${Icons.camera}</span>
              <span>Export</span>
              <span style="font-size:8px;opacity:0.6;">\u25BC</span>
            </button>
            <div id="export-dropdown" class="matcha-export-dropdown">
              <button type="button" id="export-action-png" class="matcha-export-item">
                <span style="color:#8da993;">${Icons.camera}</span>
                <div>
                  <div style="font-weight:700;display:flex;align-items:center;gap:6px;">
                    Wall Snapshot (PNG)
                    
                  </div>
                  <div style="font-size:9px;color:var(--st-text-muted);">2x High-Res visual rendering of wall layout</div>
                </div>
              </button>
              <button type="button" id="export-action-pdf" class="matcha-export-item">
                <span style="color:#38bdf8;">${Icons.fileText}</span>
                <div>
                  <div style="font-weight:700;display:flex;align-items:center;gap:6px;">
                    Client Proofing Sheet (Print / PDF)
                    <span class="matcha-pro-badge">PRO</span>
                  </div>
                  <div style="font-size:9px;color:var(--st-text-muted);">Itemized presentation with dimensions & prices</div>
                </div>
              </button>
              <button type="button" id="export-action-md" class="matcha-export-item">
                <span style="color:#cbd5e1;">${Icons.copy}</span>
                <div>
                  <div style="font-weight:700;">Copy Proposal Markdown</div>
                  <div style="font-size:9px;color:var(--st-text-muted);">Formatted list of photos and metadata</div>
                </div>
              </button>
            </div>
          </div>

          <span id="studio-shortcode" class="matcha-pill" title="Click to copy shortcode">[matcha_gallery id="${initialId || "\u2014"}"]</span>
          <button id="studio-publish" class="matcha-publish-btn">${initialId ? "Update Gallery" : "Publish Gallery"}</button>
        </div>
      </header>

      <!-- 3-Zone Workspace Body -->
      <div class="matcha-studio__body">
        <!-- Left Sidebar: Library, Blueprints & AI -->
        <aside class="matcha-studio__sidebar-left">
          <div class="matcha-tabs">
            <button data-tab="images" class="is-active">${Icons.image} Photos</button>
            <button data-tab="blueprints">${Icons.layoutGrid} Layouts</button>
            <button data-tab="superpowers">${Icons.sparkles} Superpowers</button>
          </div>
          <div id="studio-left-tabpanel" class="matcha-tabpanel"></div>
        </aside>

        <!-- Center Workspace: Infinite Canvas Viewport -->
        <main class="matcha-canvas-wrap">
          <div id="studio-canvas-container">
            <div id="studio-canvas" class="matcha-canvas"></div>
          </div>

          <!-- Floating Canvas HUD Bar -->
          <div class="matcha-canvas-hud">
            <button type="button" id="hud-zoom-out" class="matcha-hud-btn" title="Zoom Out">-</button>
            <span id="hud-zoom-label" style="font-weight:800;min-width:38px;text-align:center;font-size:11px;">100%</span>
            <button type="button" id="hud-zoom-in" class="matcha-hud-btn" title="Zoom In">+</button>
            <button type="button" id="hud-zoom-fit" class="matcha-hud-btn" title="Reset Zoom">\u22A1 Fit</button>
            <span style="opacity:0.25;">|</span>
            <span style="font-size:11px;color:var(--st-text-secondary);">Wall:</span>
            <span class="matcha-hud-dot is-active" data-bg="white" style="background:#ffffff;" title="Museum White"></span>
            <span class="matcha-hud-dot" data-bg="cream" style="background:#fbf9f4;" title="Linen Cream"></span>
            <span class="matcha-hud-dot" data-bg="sage" style="background:#eef4ed;" title="Sage Green"></span>
            <span class="matcha-hud-dot" data-bg="charcoal" style="background:#22252a;" title="Charcoal Dark"></span>
            <span class="matcha-hud-dot" data-bg="transparent" style="background:#11141a;" title="Transparent Canvas"></span>
          </div>
        </main>

        <!-- Right Sidebar: Live Wall & Photo Properties Inspector -->
        <aside class="matcha-studio__sidebar-right">
          <div style="padding:14px 16px;border-bottom:1px solid var(--st-border-subtle);display:flex;align-items:center;justify-content:space-between;">
            <div id="right-panel-header-title" style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:var(--st-text-secondary);">
              Wall & Gallery Properties
            </div>
            <button type="button" id="btn-deselect-photo" class="matcha-exit-btn" style="display:none;padding:2px 8px;font-size:10px;">\u2715 Wall</button>
          </div>
          <div id="studio-right-panel" class="matcha-tabpanel"></div>
        </aside>
      </div>
    </div>
  `;
    const titleEl = document.getElementById("studio-title");
    let titleDebounce;
    titleEl.addEventListener("input", () => {
      clearTimeout(titleDebounce);
      const v = titleEl.value;
      setState({ title: v });
      document.getElementById("save-status").textContent = "\u2026";
      titleDebounce = setTimeout(() => autosave(), 800);
    });
    document.querySelectorAll(".matcha-viewport button").forEach((b) => {
      b.addEventListener("click", () => {
        document.querySelectorAll(".matcha-viewport button").forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        setViewport(b.dataset.vp);
        const canvas = document.getElementById("studio-canvas");
        canvas.className = "matcha-canvas" + (b.dataset.vp === "tablet" ? " is-tablet" : b.dataset.vp === "mobile" ? " is-mobile" : "");
        renderCanvas();
      });
    });
    document.getElementById("studio-shortcode").addEventListener("click", (e) => {
      const text = e.target.textContent;
      navigator.clipboard.writeText(text);
      e.target.textContent = "\u2713 Copied!";
      setTimeout(() => {
        e.target.textContent = text;
      }, 1400);
    });
    document.getElementById("studio-publish").addEventListener("click", () => publish());
    const exportBtn = document.getElementById("btn-export-menu");
    const exportDropdown = document.getElementById("export-dropdown");
    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle("is-open");
    });
    window.addEventListener("click", () => exportDropdown.classList.remove("is-open"));
    document.getElementById("export-action-png").addEventListener("click", () => {
      exportPNG();
    });
    document.getElementById("export-action-pdf").addEventListener("click", () => {
      if (!isPro) {
        showProModal("Client Proposal PDF Export", "Generate high-resolution printable client proposals and dimension spec sheets. Available in Matcha Gallery Pro.");
        return;
      }
      exportPDFSheet();
    });
    document.getElementById("export-action-md").addEventListener("click", copyProposalMarkdown);
    const zoomContainer = document.getElementById("studio-canvas-container");
    const zoomLabel = document.getElementById("hud-zoom-label");
    document.getElementById("hud-zoom-in").addEventListener("click", () => updateZoom(canvasZoom + 10));
    document.getElementById("hud-zoom-out").addEventListener("click", () => updateZoom(canvasZoom - 10));
    document.getElementById("hud-zoom-fit").addEventListener("click", () => {
      const wrap = document.querySelector(".matcha-canvas-wrap");
      const canvas = document.getElementById("studio-canvas");
      if (wrap && canvas) {
        const availW = wrap.clientWidth - 80;
        const canvasW = canvas.offsetWidth;
        if (availW > 0 && canvasW > 0 && availW < canvasW) {
          const fitScale = Math.max(50, Math.min(100, Math.round(availW / canvasW * 100)));
          updateZoom(fitScale);
          return;
        }
      }
      updateZoom(100);
    });
    document.querySelectorAll(".matcha-hud-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        document.querySelectorAll(".matcha-hud-dot").forEach((d) => d.classList.remove("is-active"));
        dot.classList.add("is-active");
        const bg = dot.dataset.bg;
        patchConfig({ canvasBackdrop: bg });
        renderCanvas();
        autosaveSoon();
      });
    });
    document.getElementById("studio-ada-scorecard").addEventListener("click", () => {
      const ids = getState().config.imageIds || [];
      if (ids.length) selectPhoto(ids[0]);
    });
    document.getElementById("btn-deselect-photo").addEventListener("click", () => {
      selectedPhotoId = null;
      renderRightPanel();
      document.querySelectorAll(".matcha-img-card").forEach((c) => c.classList.remove("is-selected"));
    });
    async function exportPNG() {
      const canvas = document.getElementById("studio-canvas");
      if (!canvas || !window.html2canvas) return alert("Snapshot engine loading, please try again.");
      const btn = document.getElementById("btn-export-menu");
      const origText = btn.innerHTML;
      btn.innerHTML = "<span>Rendering 2x PNG...</span>";
      try {
        const currentTransform = zoomContainer.style.transform;
        zoomContainer.style.transform = "none";
        const captured = await window.html2canvas(canvas, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false
        });
        zoomContainer.style.transform = currentTransform;
        const link = document.createElement("a");
        const title = (getState().title || "gallery").toLowerCase().replace(/[^a-z0-9_-]/g, "-");
        link.download = `Matcha-${title}-${Date.now()}.png`;
        link.href = captured.toDataURL("image/png");
        link.click();
      } catch (e) {
        alert("Snapshot creation failed: " + e.message);
      } finally {
        btn.innerHTML = origText;
        exportDropdown?.classList.remove("is-open");
      }
    }
    const leftPanel = document.getElementById("studio-left-tabpanel");
    document.querySelectorAll(".matcha-tabs button").forEach((b) => {
      b.addEventListener("click", () => {
        document.querySelectorAll(".matcha-tabs button").forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        renderLeftTab(b.dataset.tab);
      });
    });
    async function runAI() {
      const ids = getState().config.imageIds || [];
      if (!ids.length) return alert("Please add images first.");
      const btn = document.getElementById("matcha-run-ai");
      const progressWrap = document.querySelector(".matcha-progress");
      const bar = document.getElementById("matcha-ai-bar");
      const statusText = document.getElementById("matcha-ai-status");
      const queue = ids.filter((attId) => {
        const m = metaCache.get(attId);
        return !(m && m.ai_generated && m.keywords && m.keywords.length > 0);
      });
      if (!queue.length) {
        if (statusText) statusText.textContent = "All images are already enriched!";
        if (bar) bar.style.width = "100%";
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `<span>${Icons.bolt}</span> Analyzing with Gemini\u2026`;
      if (progressWrap) progressWrap.style.display = "block";
      let done = 0;
      let errors = 0;
      const totalToEnrich = queue.length;
      let processedCount = 0;
      while (queue.length) {
        const attId = queue.shift();
        let retries = 0;
        let success = false;
        while (retries < 3 && !success) {
          try {
            const res = await fetch(`${window.MatchaStudio.root}matcha-gallery/v1/ai/analyze`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": window.MatchaStudio.nonce
              },
              body: JSON.stringify({ attachment_id: attId, overwrite: false })
            });
            if (res.status === 429) {
              retries++;
              const waitSec = retries * 3;
              if (statusText) statusText.textContent = `Rate limited by Gemini. Retrying in ${waitSec}s (${retries}/3)\u2026`;
              await new Promise((r) => setTimeout(r, waitSec * 1e3));
              continue;
            }
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            if (json.metadata) {
              metaCache.set(attId, {
                keywords: json.metadata.keywords || [],
                ai_generated: true,
                alt: json.metadata.alt_text || "",
                title: json.metadata.title || "",
                caption: json.metadata.caption || "",
                colors: json.metadata.colors || [],
                focal_point: json.metadata.focal_point || { x: 50, y: 50, zoom: 1 }
              });
              updateSingleCardMeta(attId);
            }
            success = true;
          } catch (e) {
            retries++;
            if (retries >= 3) {
              errors++;
            } else {
              await new Promise((r) => setTimeout(r, 2e3));
            }
          }
        }
        processedCount++;
        if (bar) bar.style.width = `${Math.round(processedCount / totalToEnrich * 100)}%`;
        if (statusText) statusText.textContent = `${processedCount}/${totalToEnrich} processed (${errors} errors)`;
        updateScorecard();
        await new Promise((r) => setTimeout(r, 800));
      }
      btn.disabled = false;
      btn.innerHTML = `<span>${Icons.bolt}</span> AI Enhance`;
      if (statusText) statusText.textContent = `Done! Enriched ${processedCount - errors} images.`;
      updateScorecard();
      renderCanvas();
      renderImageList();
    }
    window.__matchaTrayLoadMore = () => {
      const list = document.getElementById("matcha-image-list");
      if (!list || isLoadingMore) return;
      const cfg = getState().config;
      const allIds = cfg.imageIds || [];
      const sections = cfg.sections || [];
      const currentSection = sections.find((s) => s.id === activeSectionId);
      let displayIds = currentSection ? currentSection.imageIds || [] : allIds;
      if (trayPage * trayBatchSize < displayIds.length) {
        trayPage++;
        renderImageList();
      }
    };
    async function renderImageList() {
      const list = document.getElementById("matcha-image-list");
      if (!list) return;
      const cfg = getState().config;
      const allIds = cfg.imageIds || [];
      const sections = cfg.sections || [];
      const currentSection = sections.find((s) => s.id === activeSectionId);
      let displayIds = currentSection ? currentSection.imageIds || [] : allIds;
      if (!displayIds.length) {
        list.innerHTML = `<p style="font-size:11px;color:var(--st-text-muted);text-align:center;grid-column:1 / -1;margin-top:16px;">${currentSection ? `No photos in "${escapeHtml(currentSection.title)}" yet.<br>Click "+ Add Photos" above or select photos from "All Photos" to assign them.` : 'No photos added.<br>Click "+ Add Photos" to start.'}</p>`;
        const pag = document.getElementById("matcha-tray-pagination");
        if (pag) pag.style.display = "none";
        return;
      }
      if (trayFilterBy === "ai") {
        displayIds = displayIds.filter((id) => {
          const m = metaCache.get(id);
          return m?.ai_generated && (m.keywords?.length > 0 || m.alt?.length > 3);
        });
      } else if (trayFilterBy === "no-alt") {
        displayIds = displayIds.filter((id) => {
          const m = metaCache.get(id);
          return !m?.alt || m.alt.trim().length === 0;
        });
      } else if (trayFilterBy === "untagged") {
        displayIds = displayIds.filter((id) => {
          const kw = metaCache.get(id)?.keywords || [];
          return kw.length === 0;
        });
      }
      if (traySearchQuery) {
        displayIds = displayIds.filter((id) => {
          const m = metaCache.get(id) || {};
          const media = mediaCache.get(id) || {};
          const title = (m.title || media.title?.rendered || "").toLowerCase();
          const alt = (m.alt || media.alt_text || "").toLowerCase();
          const kw = (m.keywords || []).join(" ").toLowerCase();
          const fname = (media.source_url || media.slug || "").toLowerCase();
          return title.includes(traySearchQuery) || alt.includes(traySearchQuery) || kw.includes(traySearchQuery) || fname.includes(traySearchQuery) || ("#" + id).includes(traySearchQuery);
        });
      }
      const totalMatches = displayIds.length;
      if (!totalMatches) {
        list.innerHTML = `<p style="font-size:11px;color:var(--st-text-muted);text-align:center;grid-column:1 / -1;margin-top:16px;">No photos match your search or filter.</p>`;
        const pag = document.getElementById("matcha-tray-pagination");
        if (pag) pag.style.display = "none";
        return;
      }
      const visibleCount = Math.min(totalMatches, trayPage * trayBatchSize);
      const visibleIds = displayIds.slice(0, visibleCount);
      const is3Col = trayViewMode === "grid-3";
      list.innerHTML = visibleIds.map((id) => {
        const cached = metaCache.get(id);
        const media = mediaCache.get(id);
        const thumbUrl = media?.media_details?.sizes?.thumbnail?.source_url || media?.source_url || "";
        const isAi = cached?.ai_generated && cached.keywords?.length > 0;
        const isSelected = selectedPhotoId === id;
        return `
        <div class="matcha-img-card ${isSelected ? "is-selected" : ""}" data-id="${id}" title="${escapeHtml(cached?.title || media?.title?.rendered || "#" + id)}">
          <img src="${escapeHtml(thumbUrl)}" data-id="${id}" loading="lazy" />
          <div class="matcha-img-card__meta">
            <div class="matcha-img-card__title">${escapeHtml(cached?.title || media?.title?.rendered || "#" + id)}</div>
            ${!is3Col ? `
              <span class="matcha-badge ${isAi ? "matcha-badge--ai" : "matcha-badge--missing"}" title="${escapeHtml((cached?.keywords || []).join(", "))}">
                ${isAi ? "\u2713 " + escapeHtml(cached.keywords[0] || "AI Tagged") : "Needs AI"}
              </span>
            ` : isAi ? `<span class="matcha-badge matcha-badge--ai" style="font-size:8px;padding:1px 4px;">\u2713 AI</span>` : ""}
          </div>
          <button type="button" class="remove" data-remove="${id}" title="${currentSection ? "Remove from this chapter" : "Remove photo from gallery"}">\xD7</button>
        </div>
      `;
      }).join("");
      const pagBar = document.getElementById("matcha-tray-pagination");
      if (pagBar) {
        if (totalMatches > visibleCount) {
          pagBar.style.display = "flex";
          const nextBatch = Math.min(trayBatchSize, totalMatches - visibleCount);
          pagBar.innerHTML = `
          <div class="matcha-tray-count-label">Showing <strong>${visibleCount}</strong> of <strong>${totalMatches}</strong> photos</div>
          <button type="button" id="btn-tray-load-more" class="matcha-tray-load-more-btn">
            <span>Load Next ${nextBatch} Photos \u25BE</span>
          </button>
          ${totalMatches > visibleCount + trayBatchSize ? `
            <button type="button" id="btn-tray-load-all" style="background:none;border:none;color:var(--st-text-secondary);font-size:10px;cursor:pointer;text-decoration:underline;margin-top:4px;">
              Show All (${totalMatches} photos)
            </button>
          ` : ""}
        `;
          document.getElementById("btn-tray-load-more")?.addEventListener("click", () => {
            trayPage++;
            renderImageList();
          });
          document.getElementById("btn-tray-load-all")?.addEventListener("click", () => {
            trayPage = Math.ceil(totalMatches / trayBatchSize);
            renderImageList();
          });
        } else if (totalMatches > trayBatchSize) {
          pagBar.style.display = "flex";
          pagBar.innerHTML = `<div class="matcha-tray-count-label">All ${totalMatches} photos loaded \u2713</div>`;
        } else {
          pagBar.style.display = "none";
        }
      }
      const missingIds = visibleIds.filter((id) => !mediaCache.has(id));
      if (missingIds.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < missingIds.length; i += chunkSize) {
          const chunk = missingIds.slice(i, i + chunkSize);
          try {
            const [mediaRes, metaRes] = await Promise.all([
              fetch(`${window.MatchaStudio.root}wp/v2/media?include=${chunk.join(",")}&per_page=${chunkSize}`, {
                headers: { "X-WP-Nonce": window.MatchaStudio.nonce }
              }),
              fetch(`${window.MatchaStudio.root}matcha-gallery/v1/attachments-meta?ids=${chunk.join(",")}`, {
                headers: { "X-WP-Nonce": window.MatchaStudio.nonce }
              })
            ]);
            const medias = await mediaRes.json();
            const metas = await metaRes.json();
            if (metas && typeof metas === "object") {
              Object.entries(metas).forEach(([idStr, m]) => {
                const numId = parseInt(idStr);
                if (!dirtyMetaIds.has(numId)) {
                  metaCache.set(numId, m);
                }
              });
            }
            if (Array.isArray(medias)) {
              medias.forEach((m) => mediaCache.set(m.id, m));
            }
            chunk.forEach((id) => {
              const card = list.querySelector(`.matcha-img-card[data-id="${id}"]`);
              if (card) {
                const img = card.querySelector("img");
                const m = mediaCache.get(id);
                if (img && m) {
                  if (m.media_details?.sizes?.thumbnail?.source_url) {
                    img.src = m.media_details.sizes.thumbnail.source_url;
                  } else if (m.source_url) {
                    img.src = m.source_url;
                  }
                }
                updateSingleCardMeta(id);
              }
            });
          } catch (e) {
          }
        }
        updateScorecard();
      }
      list.querySelectorAll(".matcha-img-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (didJustDrag || e.target.closest(".remove")) return;
          selectPhoto(parseInt(card.dataset.id));
        });
      });
      list.querySelectorAll("[data-remove]").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(b.dataset.remove);
          const cfg2 = getState().config;
          const sections2 = [...cfg2.sections || []];
          const currentSection2 = sections2.find((s) => s.id === activeSectionId);
          if (currentSection2) {
            currentSection2.imageIds = (currentSection2.imageIds || []).filter((x) => x !== id);
            patchConfig({ sections: sections2 });
          } else {
            const newSections = sections2.map((sec) => ({
              ...sec,
              imageIds: (sec.imageIds || []).filter((x) => x !== id)
            }));
            patchConfig({
              imageIds: (cfg2.imageIds || []).filter((x) => x !== id),
              sections: newSections
            });
            if (selectedPhotoId === id) selectedPhotoId = null;
          }
          renderRightPanel();
          renderLeftTab("images");
          renderCanvas();
          autosaveSoon();
        });
      });
      initSortable();
    }
    let studioSortableInstance = null;
    let didJustDrag = false;
    async function renderCanvas() {
      const canvas = document.getElementById("studio-canvas");
      if (!canvas) return;
      const cfg = getState().config;
      const allIds = cfg.imageIds || [];
      const sections = cfg.sections || [];
      const imageSpans = cfg.imageSpans || {};
      const imageLinks = cfg.imageLinks || {};
      const focalPoints = cfg.focalPoints || {};
      const frameStyle = cfg.frameStyle || "none";
      const shadowElevation = cfg.shadowElevation || "soft";
      const hoverEffect = cfg.hoverEffect || "zoom";
      const canvasBackdrop = cfg.canvasBackdrop || "white";
      const hasSections = isPro && sections.length > 0 && cfg.sectionsEnabled !== false;
      if (!allIds.length) {
        canvas.innerHTML = '<div class="matcha-empty" style="text-align:center;padding:80px 20px;color:var(--st-text-muted);"><h3 style="color:#f8fafc;">Your gallery canvas is empty</h3><p>Add photos from the sidebar to preview layouts, frames & live filters.</p></div>';
        return;
      }
      let medias = allIds.map((id) => mediaCache.get(id) || { id, source_url: "", title: { rendered: "#" + id } });
      try {
        const missingIds = allIds.filter((id) => !mediaCache.has(id));
        if (missingIds.length > 0) {
          const res = await fetch(`${window.MatchaStudio.root}wp/v2/media?include=${missingIds.join(",")}&per_page=100`, {
            headers: { "X-WP-Nonce": window.MatchaStudio.nonce }
          });
          const fetched = await res.json();
          if (Array.isArray(fetched)) {
            fetched.forEach((m) => mediaCache.set(m.id, m));
          }
        }
        medias = allIds.map((id) => mediaCache.get(id) || { id, source_url: "", title: { rendered: "#" + id } });
      } catch (e) {
        medias = allIds.map((id) => mediaCache.get(id) || { id, source_url: "", title: { rendered: "#" + id } });
      }
      const imgSectionsMap = {};
      sections.forEach((s) => {
        (s.imageIds || []).forEach((imgId) => {
          if (!imgSectionsMap[imgId]) imgSectionsMap[imgId] = [];
          imgSectionsMap[imgId].push(s.id);
        });
      });
      const tagCounts = {};
      const uniqueColors = /* @__PURE__ */ new Set();
      medias.forEach((m) => {
        const meta = metaCache.get(m.id);
        const keywords = meta?.keywords || [];
        keywords.forEach((kw) => {
          const slug = kw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
          if (slug) {
            tagCounts[slug] = (tagCounts[slug] || 0) + 1;
          }
        });
        (meta?.colors || []).forEach((c) => uniqueColors.add(c.toLowerCase()));
      });
      let allTags = [];
      if (cfg.visibleFilterTags && cfg.visibleFilterTags.length > 0) {
        allTags = cfg.visibleFilterTags.filter((t) => tagCounts[t]);
      } else {
        const sortedByFreq = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
        const maxTags = cfg.maxFilterTags ?? 8;
        allTags = sortedByFreq.slice(0, maxTags);
      }
      if (cfg.orderedFilterTags && cfg.orderedFilterTags.length > 0) {
        const ordered = [];
        cfg.orderedFilterTags.forEach((t) => {
          if (allTags.includes(t)) ordered.push(t);
        });
        allTags.forEach((t) => {
          if (!ordered.includes(t)) ordered.push(t);
        });
        allTags = ordered;
      }
      const sortedColors = Array.from(uniqueColors).slice(0, 8);
      const hoverFrameCss = cfg.hoverFrameColor ? `--matcha-hover-frame-color:${cfg.hoverFrameColor};` : "";
      const cardBgCss = cfg.cardBackground ? `--matcha-card-bg:${cfg.cardBackground};` : "";
      const style = `--matcha-columns:${cfg.columns || 3};--matcha-columns-tablet:${cfg.columnsTablet || 2};--matcha-columns-mobile:${cfg.columnsMobile || 1};--matcha-gutter:${cfg.gutterSize ?? 16}px;--matcha-radius:${cfg.borderRadius ?? 10}px;--matcha-row-height:${cfg.rowHeight || 240}px;--matcha-matting:${cfg.mattingSize ?? 0}px;--matcha-accent:${cfg.accentColor || "#607d66"};${hoverFrameCss}${cardBgCss}`;
      const stylePreset = cfg.stylePreset || "custom";
      const activeCardTheme = !isPro && ["glass", "glow"].includes(cfg.cardTheme) ? "clean" : cfg.cardTheme || "clean";
      const activeFrameStyle = !isPro && ["black-metal", "natural-oak", "gold-brass", "glass-float"].includes(cfg.frameStyle) ? "none" : cfg.frameStyle || "none";
      const activeLayout = !isPro && ["pinwheel", "bento"].includes(cfg.layout) ? "grid" : cfg.layout || "grid";
      const activePagination = !isPro && ["infinite", "pages"].includes(cfg.paginationType) ? "load-more" : cfg.paginationType || "none";
      const isMultiSelect = isPro && Boolean(cfg.filterMultiSelect);
      canvas.style.background = canvasBackdrop === "cream" ? "#fbf9f4" : canvasBackdrop === "sage" ? "#eef4ed" : canvasBackdrop === "charcoal" ? "#22252a" : canvasBackdrop === "transparent" ? "transparent" : "#ffffff";
      canvas.innerHTML = `
      <div class="matcha-gallery matcha-gallery--${activeLayout} matcha-gallery--theme-${activeCardTheme} matcha-gallery--frame-${activeFrameStyle} matcha-gallery--shadow-${shadowElevation} matcha-gallery--hover-${hoverEffect} ${stylePreset !== "custom" ? `matcha-gallery--preset-${stylePreset}` : ""}" data-mobile-tap="${cfg.hoverMobileTap || "lightbox"}" style="${style}">
        ${hasSections ? `
          <div class="matcha-gallery__section-tabs" role="tablist">
            <button type="button" class="matcha-section-tab ${activeSectionId === "*" ? "matcha-section-tab--active" : ""}" data-section="*">
              <span class="tab-icon">${Icons.folder}</span>
              <span>All Chapters</span>
              <span class="matcha-section-tab__count">${allIds.length}</span>
            </button>
            ${sections.map((s) => `
              <button type="button" class="matcha-section-tab ${activeSectionId === s.id ? "matcha-section-tab--active" : ""}" data-section="${s.id}">
                <span class="tab-icon">${Icons.folder}</span>
                <span>${escapeHtml(s.title)}</span>
                <span class="matcha-section-tab__count">${(s.imageIds || []).length}</span>
              </button>
            `).join("")}
          </div>
        ` : ""}

        ${cfg.searchEnabled !== false || cfg.filtersEnabled || isPro && cfg.colorFilterEnabled && sortedColors.length > 0 || isPro && cfg.frontendSortEnabled ? `
          <div class="matcha-gallery__toolbar matcha-gallery__toolbar--skin-${escapeHtml(cfg.toolbarSkin || cfg.filterStyle || "capsule")}">
            ${cfg.searchEnabled !== false ? `
              <div class="matcha-gallery__search-wrap">
                <span class="matcha-search-icon" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;display:flex;align-items:center;pointer-events:none;">
                  ${Icons.search}
                </span>
                <input type="search" class="matcha-gallery__search-input" placeholder="Search gallery..." aria-label="Search images" style="padding-left:34px;" />
              </div>
            ` : ""}

            ${isPro && cfg.frontendSortEnabled ? `
              <div class="matcha-gallery__sort-wrap">
                <select class="matcha-gallery__sort-select" style="pointer-events:none;">
                  <option>Default Order</option>
                  <option>Title (A \u2192 Z)</option>
                  <option>Title (Z \u2192 A)</option>
                  <option>Date Added (Newest)</option>
                  <option>Date Added (Oldest)</option>
                  <option>Random Shuffle</option>
                </select>
              </div>
            ` : ""}

            ${isPro && cfg.colorFilterEnabled && sortedColors.length > 0 ? `
              <div class="matcha-gallery__color-swatches">
                <span class="matcha-color-label" style="display:flex;align-items:center;color:#64748b;">${Icons.palette}</span>
                ${sortedColors.map((c) => `
                  <button type="button" class="matcha-color-dot" data-color="${c}" style="background:${c};" title="Filter by color ${c}"></button>
                `).join("")}
              </div>
            ` : ""}

            ${cfg.filtersEnabled && allTags.length > 0 ? `
              <div class="matcha-gallery__filters matcha-gallery__filters--skin-${escapeHtml(cfg.toolbarSkin || cfg.filterStyle || "capsule")} matcha-gallery__filters--style-${cfg.filterStyle || "pills"} matcha-gallery__filters--align-${cfg.filterAlign || "left"} ${cfg.showFilterCount === false ? "matcha-gallery__filters--hide-count" : ""}" data-filter-logic="${cfg.filterLogic || "or"}" data-filter-multiselect="${isMultiSelect ? "true" : "false"}" role="toolbar">
                ${cfg.showAllFilter !== false ? `
                  <button type="button" class="matcha-filter matcha-filter--active" data-filter="*">
                    ${escapeHtml(cfg.allFilterLabel || "All")}
                    ${cfg.showFilterCount !== false ? `<span class="matcha-filter__count">${medias.length}</span>` : ""}
                  </button>
                ` : ""}
                ${allTags.map((tag) => `
                  <button type="button" class="matcha-filter" data-filter="${escapeHtml(tag)}">
                    ${escapeHtml(capitalize(tag))}
                    ${cfg.showFilterCount !== false ? `<span class="matcha-filter__count">${tagCounts[tag]}</span>` : ""}
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>
        ` : ""}
        <div class="matcha-gallery__grid">
          ${medias.map((m, idx) => {
        const meta = metaCache.get(m.id);
        const keywords = (meta?.keywords || []).map((k) => k.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-"));
        const tagStr = keywords.join(" ");
        const secStr = (imgSectionsMap[m.id] || []).join(" ");
        const colorStr = (meta?.colors || []).join(",");
        const imgTitle = meta?.title || stripHtml(m.title?.rendered || "");
        const imgCaption = meta?.caption || "";
        const isAi = meta?.ai_generated && keywords.length > 0;
        const mosaicRhythm = ["2x2", "1x1", "1x1", "2x1", "1x1", "1x2", "1x1", "2x1"];
        const currentSpan = isPro && imageSpans[m.id] ? imageSpans[m.id] : cfg.layout === "mosaic" ? mosaicRhythm[idx % mosaicRhythm.length] : imageSpans[m.id] || "1x1";
        const spanClass = cfg.layout === "mosaic" || cfg.layout === "pinwheel" ? `matcha-gallery__item--span-${currentSpan}` : "";
        const link = imageLinks[m.id] || {};
        const videoUrl = (cfg.imageVideos || {})[m.id] || "";
        const hasVideo = !!videoUrl;
        const fp = focalPoints[m.id] || meta?.focal_point || { x: 50, y: 50, zoom: 1 };
        const zoom = isPro ? fp.zoom || 1 : 1;
        const imgStyle = `object-position: ${fp.x}% ${fp.y}%; transform: scale(${zoom}); transform-origin: ${fp.x}% ${fp.y}%;`;
        const imgSrc = m.media_details?.sizes?.large?.source_url || m.media_details?.sizes?.medium_large?.source_url || m.media_details?.sizes?.medium?.source_url || m.media_details?.sizes?.full?.source_url || m.source_url || "";
        let itemStyle = "cursor:pointer;";
        if (cfg.layout === "justified") {
          const w = m.media_details?.width || 800;
          const h = m.media_details?.height || 600;
          const ratio = (w / h).toFixed(3);
          itemStyle += `flex:${ratio} 1 calc(${cfg.rowHeight || 240}px * ${ratio});max-width:calc(${cfg.rowHeight || 240}px * ${ratio} * 2);`;
        }
        const isShop = !!(link.url && (link.price || link.productId || link.label && /shop/i.test(link.label) || link.url.includes("/product/")));
        return `
              <div class="matcha-gallery__item ${isAi ? "matcha-gallery__item--ai" : ""} ${hasVideo ? "matcha-gallery__item--video" : ""} ${spanClass}" data-tags="${escapeHtml(tagStr)}" data-sections="${escapeHtml(secStr)}" data-colors="${escapeHtml(colorStr)}" data-title="${escapeHtml(imgTitle)}" data-caption="${escapeHtml(imgCaption)}" data-id="${m.id}" data-video-url="${escapeHtml(videoUrl)}" style="${itemStyle}">
                  <div class="matcha-gallery__item-inner">
                    <img src="${imgSrc}" alt="${escapeHtml(meta?.alt || m.alt_text || "")}" style="${imgStyle}" />
                    ${hasVideo ? `
                      <div class="matcha-item-video-badge" aria-hidden="true" title="Watch Video">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 3 20 12 6 21 6 3"></polygon>
                        </svg>
                      </div>
                    ` : ""}
                    ${isAi ? '<span class="matcha-gallery__ai-badge">AI</span>' : ""}
                    ${isPro && cfg.proofingEnabled ? `<button type="button" class="matcha-gallery__proof-btn" title="Client Favorite"><span class="matcha-heart-icon">${Icons.heart}</span></button>` : ""}

                    ${isPro && (cfg.layout === "mosaic" || cfg.layout === "pinwheel") ? `
                      <div class="matcha-mosaic-spans" style="position:absolute;top:8px;right:8px;display:flex;gap:3px;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);padding:3px 5px;border-radius:6px;z-index:4;">
                        <button type="button" class="matcha-span-btn ${currentSpan === "1x1" ? "is-active" : ""}" data-id="${m.id}" data-span="1x1" title="Standard (1x1)">1x1</button>
                        <button type="button" class="matcha-span-btn ${currentSpan === "2x1" ? "is-active" : ""}" data-id="${m.id}" data-span="2x1" title="Wide (2x1)">2x1 \u2194</button>
                        <button type="button" class="matcha-span-btn ${currentSpan === "1x2" ? "is-active" : ""}" data-id="${m.id}" data-span="1x2" title="Tall (1x2)">1x2 \u2195</button>
                        <button type="button" class="matcha-span-btn ${currentSpan === "2x2" ? "is-active" : ""}" data-id="${m.id}" data-span="2x2" title="Hero Tile (2x2)">2x2 \u2922</button>
                      </div>
                    ` : ""}

                    ${cfg.showTitle && imgTitle || cfg.showCaption && imgCaption || link.url || cfg.lightboxEnabled !== false ? `
                      <div class="matcha-item-overlay"></div>
                      <div class="matcha-item-frame" aria-hidden="true"></div>
                      <div class="matcha-item-content">
                        ${cfg.showTitle && imgTitle ? `<h4 class="matcha-item-title">${escapeHtml(imgTitle)}</h4>` : ""}

                        ${cfg.lightboxEnabled !== false || link.url ? `
                          <div class="matcha-item-actions">
                            ${cfg.lightboxEnabled !== false ? `
                              <button type="button" class="matcha-action-btn matcha-action-btn--media" title="${hasVideo ? "Play Video" : "View Photo"}" aria-label="${hasVideo ? "Play Video" : "View Photo"}">
                                ${hasVideo ? `
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                                  </svg>
                                ` : `
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                  </svg>
                                `}
                              </button>
                            ` : ""}

                            ${link.url ? `
                              <span class="matcha-action-btn matcha-action-btn--link ${isShop ? "matcha-action-btn--shop" : ""}" title="${escapeHtml(link.label || (link.price ? `Shop (${link.price})` : isShop ? "Shop Product" : "Visit Link"))}">
                                ${isShop ? `
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                ` : `
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                `}
                              </span>
                            ` : ""}
                          </div>
                        ` : ""}

                        ${link.price || cfg.showCaption && imgCaption || meta?.tags && meta.tags[0] ? `
                          <div class="matcha-item-meta">
                            ${link.price ? `
                              <span class="matcha-item-price">${escapeHtml(link.price)}</span>
                            ` : cfg.showCaption && imgCaption ? `
                              <p class="matcha-item-caption">${escapeHtml(imgCaption)}</p>
                            ` : meta?.tags && meta.tags[0] ? `
                              <span class="matcha-item-category">${escapeHtml(meta.tags[0])}</span>
                            ` : ""}
                          </div>
                        ` : ""}
                      </div>
                    ` : ""}
                  </div>
              </div>
            `;
      }).join("")}
          ${cfg.layout === "justified" ? '<div style="flex-grow:99999;min-width:100px;height:0;margin:0;padding:0;"></div>' : ""}
        </div>

        ${activePagination && activePagination !== "none" ? `
          ${activePagination === "load-more" || isPro && activePagination === "infinite" ? `
            <div class="matcha-gallery__load-more-wrap" style="display:flex;justify-content:center;margin-top:24px;">
              <button type="button" id="studio-canvas-load-more" class="matcha-gallery__load-more-btn matcha-gallery__load-more-btn--${cfg.loadMoreStyle || "pill"}">
                <span>${escapeHtml(cfg.loadMoreLabel || "Load More Photos")}</span>
              </button>
            </div>
          ` : `
            <div class="matcha-gallery__pagination" id="studio-canvas-pagination" style="display:flex;justify-content:center;gap:6px;margin-top:24px;"></div>
          `}
        ` : ""}
      </div>
    `;
      canvas.querySelectorAll(".matcha-gallery__item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.classList.contains("matcha-span-btn")) return;
          selectPhoto(parseInt(item.dataset.id));
        });
      });
      if (cfg.layout === "mosaic" || cfg.layout === "pinwheel") {
        canvas.querySelectorAll(".matcha-span-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const span = btn.dataset.span;
            const currentSpans = { ...getState().config.imageSpans || {} };
            currentSpans[id] = span;
            patchConfig({ imageSpans: currentSpans });
            renderCanvas();
            if (selectedPhotoId === parseInt(id)) renderRightPanel();
            autosaveSoon();
          });
        });
      }
      let currentFilter = "*";
      const activeFilterSet = /* @__PURE__ */ new Set();
      let currentSearch = "";
      let currentColor = "";
      let canvasPage = 1;
      function applyCanvasFilter() {
        const allItems = Array.from(canvas.querySelectorAll(".matcha-gallery__item"));
        const matchingItems = [];
        allItems.forEach((item) => {
          const tags = (item.dataset.tags || "").toLowerCase().split(" ").filter(Boolean);
          const secs = (item.dataset.sections || "").split(" ").filter(Boolean);
          const colors = (item.dataset.colors || "").toLowerCase().split(",").filter(Boolean);
          const title = (item.dataset.title || "").toLowerCase();
          const caption = (item.dataset.caption || "").toLowerCase();
          const alt = (item.querySelector("img")?.alt || "").toLowerCase();
          const matchesSection = activeSectionId === "*" || secs.includes(activeSectionId);
          let matchesTag = true;
          if (isMultiSelect && activeFilterSet.size > 0) {
            if ((cfg.filterLogic || "or") === "and") {
              matchesTag = Array.from(activeFilterSet).every((t) => tags.includes(t));
            } else {
              matchesTag = Array.from(activeFilterSet).some((t) => tags.includes(t));
            }
          } else if (!isMultiSelect) {
            matchesTag = currentFilter === "*" || tags.includes(currentFilter);
          }
          const matchesSearch = !currentSearch || tags.some((t) => t.includes(currentSearch)) || title.includes(currentSearch) || caption.includes(currentSearch) || alt.includes(currentSearch);
          const matchesColor = !currentColor || colors.includes(currentColor.toLowerCase());
          if (matchesSection && matchesTag && matchesSearch && matchesColor) {
            matchingItems.push(item);
          } else {
            item.style.display = "none";
          }
        });
        const pagType = cfg.paginationType || "none";
        const perPage = cfg.itemsPerPage || 12;
        if (pagType === "none") {
          matchingItems.forEach((item) => {
            item.style.display = "";
            item.style.opacity = "1";
          });
          const loadWrap = canvas.querySelector(".matcha-gallery__load-more-wrap");
          if (loadWrap) loadWrap.style.display = "none";
        } else if (pagType === "load-more" || pagType === "infinite") {
          const limit = canvasPage * perPage;
          const hasMore = limit < matchingItems.length;
          matchingItems.forEach((item, idx) => {
            if (idx < limit) {
              item.style.display = "";
              item.style.opacity = "1";
            } else {
              item.style.display = "none";
            }
          });
          const loadWrap = canvas.querySelector(".matcha-gallery__load-more-wrap");
          if (loadWrap) {
            loadWrap.style.display = hasMore ? "flex" : "none";
          }
        } else if (pagType === "pages") {
          const totalPages = Math.ceil(matchingItems.length / perPage) || 1;
          if (canvasPage > totalPages) canvasPage = 1;
          const start = (canvasPage - 1) * perPage;
          const end = start + perPage;
          matchingItems.forEach((item, idx) => {
            if (idx >= start && idx < end) {
              item.style.display = "";
              item.style.opacity = "1";
            } else {
              item.style.display = "none";
            }
          });
          const pagContainer = canvas.querySelector("#studio-canvas-pagination");
          if (pagContainer) {
            if (totalPages <= 1) {
              pagContainer.innerHTML = "";
            } else {
              let phtml = "";
              for (let p = 1; p <= totalPages; p++) {
                phtml += `<button type="button" class="matcha-page-btn ${p === canvasPage ? "is-active" : ""}" data-page="${p}">${p}</button>`;
              }
              pagContainer.innerHTML = phtml;
              pagContainer.querySelectorAll(".matcha-page-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                  canvasPage = parseInt(btn.dataset.page);
                  applyCanvasFilter();
                });
              });
            }
          }
        }
        const grid = canvas.querySelector(".matcha-gallery__grid");
        let emptyMsg = canvas.querySelector(".matcha-canvas-empty-state");
        if (matchingItems.length === 0) {
          if (!emptyMsg && grid) {
            emptyMsg = document.createElement("div");
            emptyMsg.className = "matcha-canvas-empty-state";
            grid.parentNode.insertBefore(emptyMsg, grid.nextSibling);
          }
          if (emptyMsg) {
            emptyMsg.style.display = "block";
            const sections2 = cfg.sections || [];
            const currentSection = sections2.find((s) => s.id === activeSectionId);
            if (currentSection) {
              emptyMsg.innerHTML = `
              <div style="text-align:center;padding:50px 20px;max-width:440px;margin:24px auto;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);border-radius:12px;">
                <div style="width:42px;height:42px;border-radius:50%;background:rgba(94,194,127,0.15);color:#5ec27f;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">${Icons.folder}</div>
                <h4 style="font-size:14px;color:#ffffff;margin:0 0 6px;font-weight:700;">Chapter "${escapeHtml(currentSection.title)}" is Empty</h4>
                <p style="font-size:11px;color:#94a3b8;margin:0 0 16px;line-height:1.5;">Click "+ Add Photos" in the sidebar, or switch to "All Photos" to assign existing photos to this chapter.</p>
                <div style="display:flex;gap:8px;justify-content:center;">
                  <button type="button" id="btn-canvas-add-to-chapter" class="matcha-publish-btn" style="padding:6px 14px;font-size:11px;cursor:pointer;">+ Add Photos</button>
                  <button type="button" id="btn-canvas-view-all" class="matcha-exit-btn" style="padding:6px 14px;font-size:11px;cursor:pointer;">View All Photos</button>
                </div>
              </div>
            `;
              emptyMsg.querySelector("#btn-canvas-add-to-chapter")?.addEventListener("click", () => {
                document.getElementById("matcha-add-images")?.click();
              });
              emptyMsg.querySelector("#btn-canvas-view-all")?.addEventListener("click", () => {
                document.querySelector('.matcha-studio-section-pill[data-sec="*"]')?.click();
                canvas.querySelector('.matcha-section-tab[data-section="*"]')?.click();
              });
            } else {
              emptyMsg.innerHTML = `
              <div style="text-align:center;padding:50px 20px;max-width:400px;margin:24px auto;color:#94a3b8;">
                <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.05);color:#94a3b8;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">${Icons.search}</div>
                <h4 style="font-size:13px;color:#ffffff;margin:0 0 4px;font-weight:700;">No matching photos</h4>
                <p style="font-size:11px;margin:0 0 14px;">No photos match the selected filter criteria.</p>
                <button type="button" id="btn-canvas-reset-filters" class="matcha-exit-btn" style="padding:6px 14px;font-size:11px;cursor:pointer;">Reset Filters</button>
              </div>
            `;
              emptyMsg.querySelector("#btn-canvas-reset-filters")?.addEventListener("click", () => {
                currentFilter = "*";
                activeFilterSet.clear();
                currentSearch = "";
                currentColor = "";
                const sInp = canvas.querySelector(".matcha-gallery__search-input");
                if (sInp) sInp.value = "";
                canvas.querySelectorAll(".matcha-color-dot").forEach((d) => d.classList.remove("is-active"));
                updateFilterButtonsState();
                applyCanvasFilter();
              });
            }
          }
        } else {
          if (emptyMsg) emptyMsg.style.display = "none";
        }
      }
      applyCanvasFilter();
      canvas.querySelector("#studio-canvas-load-more")?.addEventListener("click", () => {
        canvasPage++;
        applyCanvasFilter();
      });
      canvas.querySelectorAll(".matcha-section-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          canvas.querySelectorAll(".matcha-section-tab").forEach((b) => b.classList.remove("matcha-section-tab--active"));
          btn.classList.add("matcha-section-tab--active");
          activeSectionId = btn.dataset.section;
          canvasPage = 1;
          renderLeftTab("images");
          applyCanvasFilter();
        });
      });
      function updateFilterButtonsState() {
        if (isMultiSelect) {
          canvas.querySelectorAll(".matcha-filter").forEach((btn) => {
            if (btn.dataset.filter === "*") {
              const isActive = activeFilterSet.size === 0;
              btn.classList.toggle("matcha-filter--active", isActive);
              btn.setAttribute("aria-pressed", isActive ? "true" : "false");
            } else {
              const isActive = activeFilterSet.has(btn.dataset.filter);
              btn.classList.toggle("matcha-filter--active", isActive);
              btn.setAttribute("aria-pressed", isActive ? "true" : "false");
            }
          });
        } else {
          canvas.querySelectorAll(".matcha-filter").forEach((btn) => {
            const isActive = btn.dataset.filter === currentFilter;
            btn.classList.toggle("matcha-filter--active", isActive);
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
        }
      }
      canvas.querySelectorAll(".matcha-filter").forEach((btn) => {
        btn.addEventListener("click", () => {
          const f = btn.dataset.filter;
          if (isMultiSelect) {
            if (f === "*") {
              activeFilterSet.clear();
            } else {
              if (activeFilterSet.has(f)) {
                activeFilterSet.delete(f);
              } else {
                activeFilterSet.add(f);
              }
            }
            updateFilterButtonsState();
          } else {
            currentFilter = f;
            updateFilterButtonsState();
          }
          canvasPage = 1;
          applyCanvasFilter();
        });
      });
      canvas.querySelectorAll(".matcha-color-dot").forEach((btn) => {
        btn.addEventListener("click", () => {
          const color = btn.dataset.color;
          if (currentColor === color) {
            currentColor = "";
            btn.classList.remove("is-active");
          } else {
            canvas.querySelectorAll(".matcha-color-dot").forEach((b) => b.classList.remove("is-active"));
            currentColor = color;
            btn.classList.add("is-active");
          }
          canvasPage = 1;
          applyCanvasFilter();
        });
      });
      const searchInput = canvas.querySelector(".matcha-gallery__search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          currentSearch = e.target.value.toLowerCase().trim();
          canvasPage = 1;
          applyCanvasFilter();
        });
      }
    }
    let lastSubscribedImageIds = null;
    subscribe((s) => {
      const curIds = (s.config?.imageIds || []).join(",");
      if (lastSubscribedImageIds !== null && curIds !== lastSubscribedImageIds && !didJustDrag) {
        renderImageList();
      }
      lastSubscribedImageIds = curIds;
      renderCanvas();
      updateScorecard();
      const sc = document.getElementById("studio-shortcode");
      if (sc) sc.textContent = s.galleryId ? `[matcha_gallery id="${s.galleryId}"]` : `[matcha_gallery id="\u2014"]`;
    });
    let autosaveTimer;
    async function publish() {
      await autosave(true);
    }
    async function autosave(manual = false) {
      const st = getState();
      const statusEl = document.getElementById("save-status");
      if (statusEl) statusEl.textContent = "Saving\u2026";
      try {
        if (dirtyMetaIds.size > 0) {
          const updates = {};
          dirtyMetaIds.forEach((id) => {
            const m = metaCache.get(id);
            if (m) {
              updates[id] = {
                keywords: m.keywords || [],
                alt: m.alt || "",
                title: m.title || "",
                caption: m.caption || ""
              };
            }
          });
          dirtyMetaIds.clear();
          try {
            await fetch(`${window.MatchaStudio.root}matcha-gallery/v1/attachments-meta/update`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": window.MatchaStudio.nonce
              },
              body: JSON.stringify({ updates })
            });
          } catch (e) {
          }
        }
        const url = st.galleryId ? `${window.MatchaStudio.root}matcha-gallery/v1/galleries/${st.galleryId}` : `${window.MatchaStudio.root}matcha-gallery/v1/galleries`;
        const method = st.galleryId ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": window.MatchaStudio.nonce
          },
          body: JSON.stringify({
            title: st.title || "Untitled Gallery",
            config: st.config
          })
        });
        const data = await res.json();
        if (data.id && !st.galleryId) {
          setState({ galleryId: data.id });
          history.replaceState(null, "", `?page=matcha-studio&id=${data.id}`);
          document.getElementById("studio-shortcode").textContent = `[matcha_gallery id="${data.id}"]`;
          document.getElementById("studio-publish").textContent = "Update Gallery";
        }
        if (statusEl) {
          statusEl.textContent = "Saved \u2713";
          setTimeout(() => {
            statusEl.textContent = "";
          }, 1500);
        }
      } catch (e) {
        if (statusEl) statusEl.textContent = "Save failed";
      }
    }
    renderLeftTab("images");
    renderRightPanel();
    renderCanvas();
    updateScorecard();
  }
})();
