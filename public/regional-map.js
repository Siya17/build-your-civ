// Physical map layers are bundled, simplified Natural Earth 1:50m data (public domain).
// This is a modern geographical reference, not a reconstruction of ancient coastlines.
import { regionalGeography } from './regional-geography.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const plain = value => String(value ?? '').replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g,'$1').replace(/\{([^{}|]+)\|[^{}]+\}/g,'$1');

export function regionalMap(region, lang = 'en') {
  if (!region?.mapBounds || !region.mapKey) return '';
  const data = regionalGeography[region.mapKey];
  if (!data) return '';
  const [west,south,east,north] = region.mapBounds, width = 800;
  const height = Math.round(width*(north-south)/((east-west)*Math.cos((north+south)/2*Math.PI/180)));
  // Tall regional views are capped in the page; keep their labels readable at that size.
  const labelScale = Math.max(1,height/650);
  const x = lon => (lon-west)/(east-west)*width;
  const y = lat => (north-lat)/(north-south)*height;
  const path = lines => lines.map(line => line.map(([lon,lat],i)=>`${i?'L':'M'}${x(lon).toFixed(1)},${y(lat).toFixed(1)}`).join(' ')).join(' ');
  const polygons = list => list.map(polygon=>`<path d="${path(polygon)} Z"/>`).join('');
  const title = `${plain(region.name[lang])} — ${lang==='ja'?'地域の地形と水系':'regional land and water'}`;
  const labels = (region.mapLabels ?? []).map(item => {
    const px = x(item.lon), py = y(item.lat), text = esc(plain(item.label[lang]));
    const ocean = item.kind==='water', mountain = item.kind==='mountain';
    const marker = item.kind==='site' ? `<circle cx="${px}" cy="${py}" r="5" fill="#9a3d23" stroke="#fff7e6" stroke-width="2"/>` : mountain ? `<path d="M${px-6},${py+4} L${px},${py-6} L${px+6},${py+4} Z" fill="#826b4c"/>` : '';
    const anchor = px > width-150 ? 'end' : px < 110 ? 'start' : 'middle';
    const offset = item.kind==='site' || mountain ? 18*labelScale : 0;
    return `<g>${marker}<text x="${Math.max(12,Math.min(width-12,px))}" y="${Math.max(20,Math.min(height-16,py+offset))}" text-anchor="${anchor}" fill="${ocean?'#245d78':'#423c2d'}" font-size="${(item.kind==='area'?18:14)*labelScale}" font-weight="${item.kind==='site'?700:500}" stroke="#faf4e5" stroke-width="3" paint-order="stroke" font-family="system-ui,sans-serif">${text}</text></g>`;
  }).join('');
  const [siteLat,siteLon] = region.site;
  const marker = `<circle cx="${x(siteLon)}" cy="${y(siteLat)}" r="8" fill="#c87635" stroke="#fff8e7" stroke-width="3"/><circle cx="${x(siteLon)}" cy="${y(siteLat)}" r="3" fill="#713919"/>`;
  const km = (east-west)*111.32*Math.cos((north+south)/2*Math.PI/180);
  const scaleKm = km>2200 ? 500 : km>700 ? 200 : km>250 ? 100 : 20;
  const scaleWidth = scaleKm/km*width;
  const caption = lang==='ja' ? '現代の地形を参考にした地図。茶色は高地、砂色は砂漠、白は氷を示すおおよその範囲です。川・湖・海岸線は簡略化しています。目印は活動の開始地点です。' : 'Modern physical geography for reference. Brown shows generalized highlands, sand shows deserts, white shows ice. Rivers, lakes and coastlines are simplified. The marker locates your starting area.';
  return `<figure class="regional-map"><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="regional-map-svg"><title>${esc(title)}</title><defs><clipPath id="regional-${region.mapKey}"><rect width="${width}" height="${height}" rx="12"/></clipPath></defs><g clip-path="url(#regional-${region.mapKey})"><g fill="#e8dfbd" stroke="#a69b76" stroke-width=".7" fill-rule="evenodd">${polygons(data.land)}</g><g fill="#d8bd96" opacity=".75" fill-rule="evenodd">${polygons(data.highlands)}</g><g fill="#f2dda9" opacity=".8" fill-rule="evenodd">${polygons(data.deserts)}</g><g fill="#bcc9a5" opacity=".65" fill-rule="evenodd">${polygons(data.wetlands)}</g><g fill="#f5f9f6" stroke="#cad5d4" stroke-width=".7" fill-rule="evenodd">${polygons(data.ice)}</g><g fill="#bddce5" stroke="#699db0" stroke-width=".7" fill-rule="evenodd">${polygons(data.lakes)}</g><path d="${path(data.rivers)}" fill="none" stroke="#4d91ab" stroke-width="1.7" stroke-linejoin="round"/>${labels}${marker}<g fill="#423c2d" stroke="#faf4e5" stroke-width="3" paint-order="stroke"><text x="755" y="28" font-size="16" font-family="system-ui,sans-serif">N ↑</text><path d="M24,${height-32}h${scaleWidth.toFixed(1)}m-${scaleWidth.toFixed(1)},-4v8m${scaleWidth.toFixed(1)},-8v8" stroke="#423c2d" stroke-width="2" fill="none"/><text x="24" y="${height-43}" font-size="12" font-family="system-ui,sans-serif">${scaleKm} km</text></g></g></svg><figcaption class="regional-map-caption">${caption} <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener">Natural Earth · ${lang==='ja'?'地理データ':'map data'}</a></figcaption></figure>`;
}
