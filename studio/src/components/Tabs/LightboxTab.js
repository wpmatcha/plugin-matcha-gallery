export function LightboxTab(config, patchConfig){
  return `
    <div class="matcha-card">
      <label><input type="checkbox" id="st-lightbox" ${config.lightboxEnabled?'checked':''}> Enable lightbox</label><br>
      <label style="margin-top:8px;display:block;"><input type="checkbox" id="st-title" ${config.showTitle?'checked':''}> Show title on hover</label>
      <label style="margin-top:8px;display:block;"><input type="checkbox" id="st-cap" ${config.showCaption?'checked':''}> Show caption</label>
      <p style="font-size:11px;color:#646970;margin-top:8px;">Same lightbox as frontend <code>frontend-gallery.js:221</code> — reused.</p>
    </div>
  `;
}
export function bindLightbox(patchConfig){
  document.getElementById('st-lightbox')?.addEventListener('change', e=>patchConfig({lightboxEnabled:e.target.checked}));
  document.getElementById('st-title')?.addEventListener('change', e=>patchConfig({showTitle:e.target.checked}));
  document.getElementById('st-cap')?.addEventListener('change', e=>patchConfig({showCaption:e.target.checked}));
}
