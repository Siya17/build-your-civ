// Original artwork is loaded per selected region, with a still-image fallback.
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pointKey=point=>/^[A-K]$/.test(point)?point:null;
export function sceneMarkup(point,alt,playing=true){
  const key=pointKey(point);
  return `<div class="cinematic ${playing&&key?'playing':'still'}" data-scene="${key||'world'}"><img class="scene-photo" data-scene-image src="${key?`/assets/lands/${key}.webp`:'/assets/world-hero.webp'}" alt="${safe(alt)}" decoding="async" /></div>`;
}
export function portraitMarkup(point,alt=''){
  return `<img class="portrait" src="/assets/portraits/${pointKey(point)||'guide'}.webp?v=ancient-1" alt="${safe(alt)}" decoding="async" />`;
}
const icons={
 pottery:'M10 3h12M12 3v6c-8 5-7 17 4 20 11-3 12-15 4-20V3M9 15h14',
 husbandry:'M8 13c-4-5 2-9 6-6 4-5 10-2 9 3 5 0 7 6 3 9H8c-5 0-6-6 0-6M10 19v8m12-8v8M25 10l4-2',
 mining:'M5 7c9-5 16-3 23 4M17 7 7 28M7 5l-3 6',
 sailing:'M4 22h25l-6 7H10zM16 3v19M14 5 5 19h9M19 9l7 10h-7',
 astrology:'M16 8v16M8 16h16M10 10l12 12m0-12L10 22M16 2v3m0 22v3M2 16h3m22 0h3',
 irrigation:'M16 3c-2 5-9 11-9 17a9 9 0 0 0 18 0c0-6-7-12-9-17ZM12 22q1 3 4 3',
 writing:'M8 4h14v24H8zM12 10h6m-6 5h6m-6 5h6M24 8l4-4',
 archery:'M8 3q25 13 0 26L8 3ZM4 16h25m-5-5 5 5-5 5',
 bronze:'m6 4 7 7-4 4-7-7m9 5 16 16m-6-26 8 8m-4-4L5 27',
 masonry:'M3 6h26v22H3zM3 13h26M3 21h26M12 6v7m8 0v8M12 21v7',
 wheel:'M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24ZM16 4v24M4 16h24M8 8l16 16M8 24 24 8',
 navigation:'M16 3 20 12l9 4-9 4-4 9-4-9-9-4 9-4zM16 12v8',
 currency:'M16 3a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM13 7h6v12h-6zM6 23c4 8 17 8 22 0',
 horseback:'M6 26V14l7-7 2-5 5 5 5 5-3 4-6-2-1 12M16 9h1',
 iron:'M6 11h20l-4 6H11zM13 17v8h8M3 25h26M9 6h14',
 math:'M4 5h10M9 1v9M20 5h9M5 20l8 8m0-8-8 8M20 22h9m-9 5h9',
 construction:'M3 11 16 3l13 8zM6 13v13m7-13v13m7-13v13m6-13v13M3 29h26',
 engineering:'M12 3h8l1 6 5 3h3v8l-6 1-3 5v3h-8l-1-6-5-3H3v-8l6-1 3-5zM16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
 preservation:'M9 3h14v5H9zM8 8h16v21H8zM8 14h16m-16 9h16',
 route_mapping:'m3 7 8-3 10 3 8-3v21l-8 3-10-3-8 3zM11 4v21M21 7v21',
 laws:'M16 3v25M7 29h18M5 9h22M7 9l-5 12h10zM25 9l-5 12h10z',
 craft:'M6 5c22-9 25 25 4 22M8 3l-3 7 8-2M14 13l14 14M22 13l-9 10',
 trade:'M3 11h22l-5-5m5 5-5 5M29 23H7l5-5m-5 5 5 5',
 workforce:'M16 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M8 27v-9q8-10 16 0v9M3 13v10m26-10v10',
 tradition:'M5 5 16 2l11 3v10c0 7-6 11-11 15C5 24 5 19 5 15zM16 8v14M11 14h10',
 empire:'M3 29V12h8v17M11 29V3h10v26m0 0V12h8v17M6 17h2m7-8h2m7 8h2',
 mysticism:'M16 2v8m0 12v8M2 16h8m12 0h8M16 9l7 7-7 7-7-7z',
 games:'M5 5h22v22H5zM10 11h2m8 0h2m-7 5h2m-7 5h2m8 0h2',
 philosophy:'M3 4h26v17H15l-8 7v-7H3zM8 10h16M8 15h11',
 poetry:'M4 3h24v12c0 8-6 12-12 15C9 27 4 23 4 15zM8 11h4m8 0h4M10 19q6 6 12 0',
 training:'M16 3a13 13 0 1 0 0 26 13 13 0 0 0 0-26ZM16 9a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l13-13',
 defense:'M4 29V6h5v5h5V6h5v5h5V6h5v23M13 29v-9h7v9',
 history:'M4 5q6-3 12 1 6-4 12-1v23q-6-3-12 0-6-3-12 0zM16 6v22M8 11h4m-4 5h4m8-5h4m-4 5h4',
 theology:'M23 3a13 13 0 1 0 6 20A13 13 0 0 1 23 3Z',
 mutual_aid:'M2 20l8-7 6 4 6-4 8 7M6 23l10 6 10-6M16 17v12M5 4h8v6H5m14-6h8v6h-8',
 resource_council:'M16 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10M4 5h6m12 0h6M4 27h6m12 0h6M3 13v7m26-7v7',
 trade_accord:'M5 3h22v26H5zM10 9h12m-12 5h12M11 22l3 3 7-7',
 route_stewards:'M6 29 13 3h6l7 26M16 7v4m0 5v4m0 5v4'
};
icons.shipbuilding=icons.sailing;
export const iconPath=id=>icons[id]||icons.navigation;
export function cardIcon(id){return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPath(id)}"/></svg>`;}
