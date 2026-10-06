import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { regions, worldMap } from '../shared/regions.js';

mkdirSync('dist',{recursive:true});
cpSync('public','dist',{recursive:true});cpSync('shared','dist/shared',{recursive:true});
const pinX=lon=>((((lon-worldMap.left)%360)+360)%360)/360*100;
const pinY=lat=>(worldMap.top-lat)/(worldMap.top-worldMap.bottom)*100;
const css=Object.entries(regions).map(([letter,{site:[lat,lon]}])=>{
  const x=pinX(lon).toFixed(2),y=pinY(lat).toFixed(2);
  return `.map-dot[data-map="${letter}"]{left:${x}%;top:${y}%}.zoom-${letter}{transform-origin:${x}% ${y}%}`;
}).join('');
writeFileSync('dist/map-points.css',css);
await build({entryPoints:['client/firebase.js'],outfile:'dist/firebase-client.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
console.log('Built Vercel site in dist/');
