export function FilterTab(config, patchConfig){
  return `
    <div class="matcha-card">
      <label><input type="checkbox" id="st-filters" ${config.filtersEnabled?'checked':''}> Enable filter bar</label><br>
      <label style="margin-top:8px;display:block;"><input type="checkbox" id="st-all" ${config.showAllFilter?'checked':''}> Show “All” button</label>
      <p style="font-size:11px;color:#646970;margin-top:8px;">Filters are pills derived from AI keywords on images in canvas — click to live-test.</p>
    </div>
  `;
}
export function bindFilter(patchConfig){
  document.getElementById('st-filters')?.addEventListener('change', e=>patchConfig({filtersEnabled:e.target.checked}));
  document.getElementById('st-all')?.addEventListener('change', e=>patchConfig({showAllFilter:e.target.checked}));
}
