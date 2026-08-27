export function LayoutTab(config, patchConfig){
  return `
    <div class="matcha-card">
      <label style="font-weight:700;font-size:12px;">Layout</label>
      <select id="st-layout" class="widefat" style="margin-top:6px;">
        <option value="grid" ${config.layout==='grid'?'selected':''}>Grid</option>
        <option value="masonry" ${config.layout==='masonry'?'selected':''}>Masonry (Columns)</option>
      </select>
    </div>
    <div class="matcha-card">
      <div class="range-row"><label>Columns Desktop</label><input id="st-col" type="range" min="1" max="6" value="${config.columns}"><span>${config.columns}</span></div>
      <div class="range-row"><label>Columns Tablet</label><input id="st-colt" type="range" min="1" max="4" value="${config.columnsTablet}"><span>${config.columnsTablet}</span></div>
      <div class="range-row"><label>Columns Mobile</label><input id="st-colm" type="range" min="1" max="2" value="${config.columnsMobile}"><span>${config.columnsMobile}</span></div>
      <div class="range-row"><label>Gutter (px)</label><input id="st-gut" type="range" min="0" max="48" step="4" value="${config.gutterSize}"><span>${config.gutterSize}px</span></div>
    </div>
  `;
}
export function bindLayout(patchConfig){
  document.getElementById('st-layout')?.addEventListener('change', e=>patchConfig({layout:e.target.value}));
  document.getElementById('st-col')?.addEventListener('input', e=>{ e.target.nextElementSibling.textContent=e.target.value; patchConfig({columns:parseInt(e.target.value)}); });
  document.getElementById('st-colt')?.addEventListener('input', e=>{ e.target.nextElementSibling.textContent=e.target.value; patchConfig({columnsTablet:parseInt(e.target.value)}); });
  document.getElementById('st-colm')?.addEventListener('input', e=>{ e.target.nextElementSibling.textContent=e.target.value; patchConfig({columnsMobile:parseInt(e.target.value)}); });
  document.getElementById('st-gut')?.addEventListener('input', e=>{ e.target.nextElementSibling.textContent=e.target.value+'px'; patchConfig({gutterSize:parseInt(e.target.value)}); });
}
