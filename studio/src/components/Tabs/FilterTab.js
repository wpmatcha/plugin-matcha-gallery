export function FilterTab(config, patchConfig){
  const skin = config.toolbarSkin || 'capsule';
  return `
    <div class="matcha-card">
      <div style="font-size:12px;font-weight:700;margin-bottom:10px;color:#1e293b;">Toolbar & Controls Design</div>
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Controls Aesthetic Skin</label>
      <select id="st-toolbar-skin" style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid #d1d5db;font-size:12px;background:#fff;margin-bottom:12px;">
        <option value="capsule" ${skin==='capsule'?'selected':''}>Modern Capsule (Clean Pill)</option>
        <option value="underline" ${skin==='underline'?'selected':''}>Minimalist Hairline (Fine Art)</option>
        <option value="obsidian" ${skin==='obsidian'?'selected':''}>Obsidian Dark (Charcoal Pro)</option>
        <option value="glass" ${skin==='glass'?'selected':''}>Frosted Glass (Glassmorphism Pro)</option>
      </select>

      <div style="border-top:1px solid #f1f5f9;padding-top:10px;margin-top:4px;">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:8px;cursor:pointer;">
          <input type="checkbox" id="st-filters" ${config.filtersEnabled!==false?'checked':''}> Enable Category Filter Pills
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:8px;cursor:pointer;">
          <input type="checkbox" id="st-search" ${config.searchEnabled!==false?'checked':''}> Enable Instant Search Bar
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:8px;cursor:pointer;">
          <input type="checkbox" id="st-all" ${config.showAllFilter!==false?'checked':''}> Show “All” Button
        </label>
      </div>

      <p style="font-size:11px;color:#64748b;margin-top:10px;line-height:1.4;">
        Controls Skin automatically harmonizes the search bar, category filter buttons, sort dropdown, and palette swatches in a unified design language.
      </p>
    </div>
  `;
}

export function bindFilter(patchConfig){
  document.getElementById('st-toolbar-skin')?.addEventListener('change', e=>patchConfig({toolbarSkin:e.target.value}));
  document.getElementById('st-filters')?.addEventListener('change', e=>patchConfig({filtersEnabled:e.target.checked}));
  document.getElementById('st-search')?.addEventListener('change', e=>patchConfig({searchEnabled:e.target.checked}));
  document.getElementById('st-all')?.addEventListener('change', e=>patchConfig({showAllFilter:e.target.checked}));
}
