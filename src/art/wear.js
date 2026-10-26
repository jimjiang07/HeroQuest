/* The full wardrobe: the rig's starter and boss gear plus the reward items (src/art/items/), on twelve slots.
   Plain JS like rig.js so scripts can import it; wear.d.ts declares it. Item order and unlocks: data/rewards.json. */
import {INK,SKIN,HAIR,HAIRS,OUTFITS,HEADS,MAIN,OFF,BACK,GEAR,STARTER,eye,cheek,tube,FILTER,gearBody} from './rig.js';
import * as a from './items/head-face.js';
import * as b from './items/neck-badge-gloves-feet.js';
import * as c from './items/hands-back.js';
import * as d from './items/body-pets-scenes.js';
import * as e from './items/land-scenes.js';
import * as f from './items/head-face-2.js';
import * as g from './items/neck-badge-gloves-feet-2.js';
import * as h from './items/hands-2.js';
import * as i from './items/back-pets-2.js';

// the wardrobe's tabs, in order; "outfit" is the body slot (item files call it "body")
export const WEAR_SLOTS=['head','face','neck','badge','outfit','back','main','off','gloves','feet','pet','bg'];
export const SLOT_NAME={head:'Head',face:'Face',neck:'Neck',badge:'Badge',outfit:'Body',back:'Back',main:'Hand',off:'Shield',gloves:'Gloves',feet:'Feet',pet:'Pet',bg:'Place'};

/** every reward item by id: {id, name, slot, size, kind?, vb, art pieces} */
export const ITEMS=Object.fromEntries([a,b,c,d,e,f,g,h,i].flatMap(m=>m.ITEMS).map(it=>[it.id,{...it,slot:it.slot==='body'?'outfit':it.slot}]));

const RIG={head:HEADS,main:MAIN,off:OFF,back:BACK,outfit:OUTFITS};
/* a starter hero wearing a kit: a slot left out keeps the starter's piece (old slots) or nothing (new slots); null takes it off */
export function dressAll(avatar,kit={}){
  const out={...(STARTER[avatar]??STARTER.knight)};
  for(const s of WEAR_SLOTS){
    const v=kit[s];if(v===undefined)continue;
    if(v===null){if(s!=='outfit')out[s]=undefined;continue}
    if(ITEMS[v]?.slot===s||RIG[s]?.[v])out[s]=v;
  }
  return out;
}
// one slot's art: a reward item's pieces, or the rig's own (strings for hands, {back,front} for head and back)
const piece=(s,id)=>{if(!id)return null;const it=ITEMS[id];if(it)return it;const t=RIG[s]?.[id];return t==null?null:typeof t==='string'?{art:t}:t};

/** the rig's heroBody with every slot; pet and place draw only when withScene (they need the wide canvas) */
export function heroFullBody(kit,withScene=false){
  const s=SKIN[kit.skin],hs=HAIRS[kit.style];
  const oi=ITEMS[kit.outfit],o=oi?oi.outfit:OUTFITS[kit.outfit]??OUTFITS.tunic;
  const hg=piece('head',kit.head),bk=piece('back',kit.back),mn=piece('main',kit.main),of=piece('off',kit.off);
  const fc=piece('face',kit.face),nk=piece('neck',kit.neck),bd=piece('badge',kit.badge),gl=piece('gloves',kit.gloves),ft=piece('feet',kit.feet);
  const pet=withScene&&piece('pet',kit.pet),bg=withScene&&piece('bg',kit.bg);
  const legs=o.robe?'':`<rect x="80" y="154" width="17" height="30" rx="6" fill="${o.legs}"/><rect x="103" y="154" width="17" height="30" rx="6" fill="${o.legs}"/>`;
  const boots=ft?ft.art:`<ellipse cx="88" cy="187" rx="14" ry="8" fill="${o.boots}"/><ellipse cx="112" cy="187" rx="14" ry="8" fill="${o.boots}"/>`;
  const torso=o.robe?`<path d="M64 186C62 140 76 112 100 112C124 112 138 140 136 186Z" fill="${o.torso}"/>`:`<path d="M70 162C68 130 78 112 100 112C122 112 132 130 130 162Z" fill="${o.torso}"/>`;
  const hands=gl?gl.art:`<circle cx="50" cy="152" r="9.5" fill="${s}"/><circle cx="150" cy="150" r="9.5" fill="${s}"/>`;
  return `${bg?bg.art:''}${bk?.back??''}${hg?.back??''}${hs.back?.(HAIR[kit.hair])??''}
${legs}${boots}${torso}${o.extra}${bk?.front??''}${nk?.art??''}${bd?.art??''}
${tube('M74 122Q60 132 52 148',o.sleeve,12)}${tube('M126 122Q140 132 148 148',o.sleeve,12)}
${mn?.art??''}${hands}${of?.art??''}
<circle cx="60" cy="78" r="9" fill="${s}"/><circle cx="140" cy="78" r="9" fill="${s}"/><circle cx="100" cy="74" r="40" fill="${s}"/>
<path d="M78 66L92 64M108 64L122 66" fill="none" stroke-width="4"/>${fc?.under??''}
${eye(86,80)}${eye(114,80)}${cheek(74,94)}${cheek(126,94)}<path d="M88 96Q100 108 112 96Z" fill="#8a3b3b" stroke-width="4"/>
${fc?.art??''}${hs.front(HAIR[kit.hair])}${hg?.front??''}${pet?pet.art:''}`;
}
/* one item on its own, in rig coordinates (crop with its vb) */
export function itemBody(it){
  if(it.slot==='outfit'){const o=it.outfit;return `${o.robe?'':`<rect x="80" y="154" width="17" height="30" rx="6" fill="${o.legs}"/><rect x="103" y="154" width="17" height="30" rx="6" fill="${o.legs}"/>`}<ellipse cx="88" cy="187" rx="14" ry="8" fill="${o.boots}"/><ellipse cx="112" cy="187" rx="14" ry="8" fill="${o.boots}"/>
${o.robe?`<path d="M64 186C62 140 76 112 100 112C124 112 138 140 136 186Z" fill="${o.torso}"/>`:`<path d="M70 162C68 130 78 112 100 112C122 112 132 130 130 162Z" fill="${o.torso}"/>`}${o.extra}${tube('M74 122Q60 132 52 148',o.sleeve,12)}${tube('M126 122Q140 132 148 148',o.sleeve,12)}`;}
  if(it.slot==='face')return (it.under??'')+(it.art??'');
  if(it.slot==='head'||it.slot==='back')return (it.back??'')+(it.front??'');
  return it.art;
}
export const SCENE_VB='-40 -10 280 212';
const doc=(body,vb)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${FILTER}</defs><g filter="url(#doodle)" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
/** a dressed hero as an SVG document; scene adds the pet and the place on a wider canvas */
export const heroFullSvg=(kit,scene=false)=>doc(heroFullBody(kit,scene),scene?SCENE_VB:'0 0 200 200');
/** a reward item's picture, or a boss/starter piece's (GEAR) */
export function itemSvg(id){
  const it=ITEMS[id];if(it)return doc(itemBody(it),it.vb);
  return GEAR[id]?doc(gearBody(id),GEAR[id].vb):'';
}
/** name and slot for any wearable id */
export const wearInfo=id=>ITEMS[id]?{name:ITEMS[id].name,slot:ITEMS[id].slot,size:ITEMS[id].size}:GEAR[id]?{name:GEAR[id].name,slot:GEAR[id].slot,size:'boss'}:null;
