/**
 * Zustand-like minimal store without dependency (keeps bundle <30KB).
 * Simple pub/sub so tabs/canvas stay synced.
 */
let state = {
  galleryId: window.MatchaStudio?.galleryId || 0,
  title: window.MatchaStudio?.title || '',
  config: window.MatchaStudio?.config || { imageIds:[], aiTags:[], layout:'grid', columns:3, columnsTablet:2, columnsMobile:1, gutterSize:16, filtersEnabled:true, showAllFilter:true, showTitle:true, showCaption:false, lightboxEnabled:true },
  viewport: 'desktop', // desktop|tablet|mobile
  saving: false,
  ai: { running:false, done:0, total:0, errors:[] },
};
const listeners = new Set();
export const getState = () => state;
export const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l)=>l(state));
};
export const subscribe = (fn) => { listeners.add(fn); return ()=>listeners.delete(fn); };
export const patchConfig = (patch) => setState({ config: { ...state.config, ...patch } });
export const setViewport = (v) => setState({ viewport: v });
