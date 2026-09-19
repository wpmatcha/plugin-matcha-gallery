/**
 * Images/Content Tab
 */
export function ImagesTab({ config, patchConfig, mediaNonce }) {
  const onAdd = () => {
    const frame = wp.media({ title: 'Select Images', multiple: true, library: { type: 'image' } });
    frame.on('select', () => {
      const sel = frame.state().get('selection').toJSON();
      const ids = sel.map((s)=>s.id);
      const merged = [...new Set([...(config.imageIds||[]), ...ids])].slice(0,150);
      patchConfig({ imageIds: merged });
    });
    frame.open();
  };
  const remove = (id) => patchConfig({ imageIds: config.imageIds.filter((x)=>x!==id) });

  // AI queue runner: concurrency 2, 800ms delay
  const runAI = async () => {
    const ids = config.imageIds || [];
    if (!ids.length) return;
    const btn = document.getElementById('matcha-run-ai');
    btn.disabled = true; btn.textContent = 'Running...';
    const bar = document.getElementById('matcha-ai-bar');
    let done=0, errors=0;
    const total = ids.length;
    const queue = [...ids];
    const concurrency = 2;
    const workers = Array.from({length: concurrency}, async () => {
      while(queue.length){
        const attId = queue.shift();
        try{
          const res = await fetch(`${window.MatchaStudio.root}matcha-gallery/v1/ai/analyze`, {
            method:'POST',
            headers:{ 'Content-Type':'application/json', 'X-WP-Nonce': window.MatchaStudio.nonce },
            body: JSON.stringify({ attachment_id: attId })
          });
          if(!res.ok) throw new Error(await res.text());
        }catch(e){ errors++; }
        done++;
        if(bar) bar.style.width = `${Math.round(done/total*100)}%`;
        document.getElementById('matcha-ai-status').textContent = `${done}/${total} • ${errors} errors`;
        await new Promise(r=>setTimeout(r, 800));
      }
    });
    await Promise.all(workers);
    btn.disabled=false; btn.textContent='Run AI Auto-Enhance';
  };

  return `
    <div>
      <button type="button" class="button button-primary" id="matcha-add-images" style="width:100%">+ Add Images (wp.media)</button>
      <div style="margin:10px 0;display:flex;gap:8px;">
        <button type="button" class="button" id="matcha-run-ai" style="flex:1">Run AI Auto-Enhance</button>
      </div>
      <div class="matcha-progress"><div id="matcha-ai-bar" class="matcha-progress__bar"></div></div>
      <div id="matcha-ai-status" style="font-size:11px;color:#646970;text-align:center;"></div>
      <p style="font-size:11px;color:#646970;">Cap 150 images • Uses 512px resize + detail:low (~$0.002/10 imgs). Keep tab open for Free queue.</p>
      <div id="matcha-image-list" class="matcha-image-grid" style="margin-top:10px;"></div>
    </div>
  `;
}
export function bindImagesTab(patchConfig, config){
  document.getElementById('matcha-add-images')?.addEventListener('click', ()=>{
    const frame = wp.media({ title:'Select Images', multiple:true, library:{type:'image'}});
    frame.on('select', ()=>{
      const sel = frame.state().get('selection').toJSON();
      const ids = sel.map(s=>s.id);
      const merged=[...new Set([...(config.imageIds||[]),...ids])].slice(0,150);
      patchConfig({imageIds: merged});
    });
    frame.open();
  });
  document.getElementById('matcha-run-ai')?.addEventListener('click', async ()=>{
    const ids=getComputedConfig()?.imageIds||[];
    if(!ids.length) return alert('Add images first');
    const btn=document.getElementById('matcha-run-ai'); const bar=document.getElementById('matcha-ai-bar');
    btn.disabled=true; btn.textContent='Running...';
    let done=0, errors=0; const total=ids.length; const q=[...ids];
    const conc=2;
    const workers=Array.from({length:conc}, async ()=>{
      while(q.length){
        const attId=q.shift();
        try{ const r=await fetch(`${window.MatchaStudio.root}matcha-gallery/v1/ai/analyze`,{method:'POST',headers:{'Content-Type':'application/json','X-WP-Nonce':window.MatchaStudio.nonce},body:JSON.stringify({attachment_id:attId})}); if(!r.ok) throw new Error(await r.text()); }catch(e){errors++;}
        done++; if(bar) bar.style.width=`${Math.round(done/total*100)}%`; document.getElementById('matcha-ai-status').textContent=`${done}/${total} • ${errors} errors`;
        await new Promise(rr=>setTimeout(rr,800));
      }
    });
    await Promise.all(workers);
    btn.disabled=false; btn.textContent='Run AI Auto-Enhance';
  });
}
function getComputedConfig(){ return window.__matchaGetConfig?.(); }
