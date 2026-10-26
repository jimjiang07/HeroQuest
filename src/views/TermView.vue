<script setup lang="ts">
/* The term map: 20 stones (one session each) on one winding road through 5 lands, numbers only (a grown-up picks the
   content). Done stones are gold, the next one glows with the hero beside it, later ones are dim. Every 4th stone has the
   land's chest, open once the land is cleared. Portrait: lands are rows climbing upwards; wide: columns left to right. */
import {computed,onBeforeUnmount,onMounted,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import * as L from '@/learn/learner';
import {REWARDS,SESSION_STEPS,STONES,TERM,stoneDef,stoneReady} from '@/term';
import {audio,say,sfx,shake} from '@/services/audio';
import HeroAvatar from '@/components/HeroAvatar.vue';
import Icon from '@/components/Icon.vue';
import {GIFT_SVG,itemUrl} from '@/components/gifts';

const P=useProgress(),router=useRouter(),p=computed(()=>P.hero!);
setHeader({title:'Quest map',back:()=>router.push('/who'),backLabel:'',backIcon:'person'});

const box=ref<HTMLElement>(),wide=ref(false);
const done=(n:number)=>L.sessionDone(p.value,n,SESSION_STEPS);
const cur=computed(()=>{for(let n=1;n<=STONES;n++)if(!done(n))return n;return null});
// a stone's spot as % of the map: land l is a band, its 4 stones snake through it; the middle two sit a little higher
// (portrait), so the corner where the road doesn't turn stays free for the land's name
function spot(n:number){
  const l=Math.floor((n-1)/4),i=(n-1)%4,j=l%2?3-i:i;
  return wide.value?{x:10+l*20+(i%2?-2:2),y:84-j*22.6}:{x:12+j*25.3,y:91.5-l*20-(j===1||j===2?3.5:0)};
}
const stones=computed(()=>Array.from({length:STONES},(_,k)=>{
  const n=k+1,open=L.stoneOpen(p.value,n,SESSION_STEPS,P.st.unlockAll),{x,y}=spot(n);
  const land=Math.ceil(n/4),cleared=[0,1,2,3].every(i=>done((land-1)*4+1+i));
  return {n,x,y,ready:stoneReady(stoneDef(P.st,n)),state:done(n)?'done':!open?'lock':n===cur.value?'cur':'open',chest:n%4===0,cleared,side:x>70?'l':'r'};
}));
const here=computed(()=>stones.value[(cur.value??STONES)-1]);
const lands=computed(()=>TERM.lands.map((name,l)=>({name,l,side:!wide.value&&l%2?'r':'',style:wide.value?{left:l*20+'%',top:'0',width:'20%',height:'100%'}:{left:'0',top:(80-l*20)+'%',width:'100%',height:'20%'}})));

/* the road: Catmull-Rom through the stones in % (the svg stretches to the map; strokes stay in px) */
type Pt={x:number;y:number};
const curve=(p:Pt[])=>p.length<2?'':p.slice(0,-1).reduce((d,b,i)=>{const a=p[i-1]??b,c=p[i+1],e=p[i+2]??c;
  return d+` C${(b.x+(c.x-a.x)/6).toFixed(2)} ${(b.y+(c.y-a.y)/6).toFixed(2)} ${(c.x-(e.x-b.x)/6).toFixed(2)} ${(c.y-(e.y-b.y)/6).toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`},`M${p[0].x} ${p[0].y}`);
const road=computed(()=>curve(stones.value));
const walked=computed(()=>curve(stones.value.slice(0,cur.value??STONES)));

const nextItem=computed(()=>L.nextItem(p.value,REWARDS));
const msg=ref('');let msgT=0;
const note=(t:string)=>{msg.value=t;say(t);clearTimeout(msgT);msgT=window.setTimeout(()=>{msg.value=''},3000)};
say(cur.value?'Tap the glowing stone.':'You finished the term! Play any stone again.');

function go(st:{n:number;state:string;ready:boolean},e:Event){
  audio();
  if(st.state==='lock'){shake(e.currentTarget as Element);note('Finish the stone before it first!');return}
  if(!st.ready){shake(e.currentTarget as Element);note('Coming soon!');return}
  sfx.pop();router.push(`/session/${st.n}`);
}
const measure=()=>{const r=box.value?.getBoundingClientRect();if(r)wide.value=r.width>r.height*1.15};
let ro:ResizeObserver|null=null;
onMounted(()=>{measure();ro=new ResizeObserver(measure);if(box.value)ro.observe(box.value)});
onBeforeUnmount(()=>{ro?.disconnect();clearTimeout(msgT)});
</script>

<template>
  <div ref="box" class="tmap" :class="{wide}">
    <div v-for="ld in lands" :key="ld.l" class="land" :class="['land'+(ld.l+1),ld.side]" :style="ld.style"><span>{{ ld.name }}</span></div>
    <svg class="troad" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="edge" :d="road"/><path class="lane" :d="road"/><path class="walked" :d="walked"/><path class="dash" :d="road"/>
    </svg>
    <button v-for="st in stones" :key="st.n" class="tstone" :class="[st.state,{soon:!st.ready}]" :data-n="st.n" :style="{'--x':st.x,'--y':st.y}"
      :aria-label="`Stone ${st.n}: ${st.state}`" @click="go(st,$event)">
      <span class="tf">{{ st.n }}</span>
      <span v-if="st.chest" class="tchest" :class="{opened:st.cleared}" v-html="GIFT_SVG.gold"></span>
    </button>
    <div v-if="here" class="there" :class="here.side" :style="{'--x':here.x,'--y':here.y}" aria-hidden="true"><HeroAvatar :avatar="p.avatar" :kit="p.kit" :size="56" full/></div>
  </div>
  <div class="tbar">
    <button class="btn alt tward" aria-label="Wardrobe" @click="audio();sfx.pop();router.push('/wardrobe')"><Icon name="hanger"/><span>Wardrobe</span></button>
    <div class="tnext" :class="{msg:!!msg}">
      <template v-if="msg">{{ msg }}</template>
      <template v-else-if="nextItem"><img class="sil" :src="itemUrl(nextItem)" alt="" :data-next="nextItem"><span>Coming next</span></template>
    </div>
    <button class="btn alt tmore" @click="audio();sfx.pop();router.push('/hub')"><Icon name="map"/><span>More quests</span></button>
  </div>
</template>

<style scoped>
.tmap{position:relative;flex:1;min-height:0;width:100%;border:4px solid var(--ink);border-radius:var(--rd);overflow:hidden;background:var(--card);
  --st:clamp(40px,min(11vw,7vh),68px)}
.tmap.wide{--st:clamp(40px,min(7vw,10vh),68px)}
.land{position:absolute;display:flex;align-items:flex-start;justify-content:flex-start;padding:4px 10px;background:color-mix(in srgb,var(--lc) 75%,var(--card))}
.land span{font-size:clamp(12px,1.6vh,15px);font-weight:700;color:var(--muted);letter-spacing:.2px}
.wide .land{justify-content:center}
.land.r{justify-content:flex-end}
.land1{--lc:#e6e1f5}.land2{--lc:#d9f0c8}.land3{--lc:#fde0ea}.land4{--lc:#ecdfca}.land5{--lc:#ffd6c2}
.land+.land{border-top:3px dashed color-mix(in srgb,var(--ink) 25%,transparent)}
.wide .land+.land{border-top:0;border-left:3px dashed color-mix(in srgb,var(--ink) 25%,transparent)}
.troad{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.troad path{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.troad .edge{stroke:var(--ink);stroke-width:26}
.troad .lane{stroke:#f1dfb8;stroke-width:19}
.troad .walked{stroke:var(--gold);stroke-width:19}
.troad .dash{stroke:#c9a46b;stroke-width:3;stroke-dasharray:6 10}
.tstone{position:absolute;left:calc(var(--x)*1%);top:calc(var(--y)*1%);width:var(--st);height:var(--st);transform:translate(-50%,-50%);z-index:1;border:0;background:none;padding:0;color:var(--ink)}
.tf{width:100%;height:100%;border-radius:50%;border:4px solid var(--ink);background:#e4e6ef;display:grid;place-items:center;font-family:var(--disp);font-size:calc(var(--st)*.46);color:#6a6f92}
.tstone.done .tf{background:var(--gold);color:#1d2140;box-shadow:0 4px 0 var(--ink)}
.tstone.cur .tf,.tstone.open .tf{background:#fff;color:var(--c)}
.tstone.cur .tf{animation:glow 1.6s ease-in-out infinite}
.tstone.lock .tf{background:#d9dbe6;color:#9a9eb8;border-color:#6a6f92;border-style:dashed}
.tstone.open.soon .tf{border-style:dashed;color:var(--muted)}
.tchest{position:absolute;right:-42%;bottom:-30%;width:calc(var(--st)*.78);pointer-events:none}
.tchest :deep(svg){width:100%;height:auto;overflow:visible}
.tchest :deep(.lid){transform-box:fill-box;transform-origin:0% 100%}
.tchest.opened :deep(.lid){transform:translate(-6%,-30%) rotate(-38deg)}
.there{position:absolute;left:calc(var(--x)*1%);top:calc(var(--y)*1%);z-index:2;pointer-events:none;transform:translate(calc(var(--st)*.45),calc(-100% + var(--st)*.5))}
.there.l{transform:translate(calc(-100% - var(--st)*.45),calc(-100% + var(--st)*.5))}
.there :deep(.av){--avs:calc(var(--st)*1.15)!important}
.tbar{flex:none;width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px}
.tbar .btn{min-height:56px;padding:8px 16px;font-size:clamp(17px,2.4vh,22px)}
.tbar .btn :deep(.ic){width:28px;height:28px}
.tnext{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;color:var(--muted);font-size:clamp(14px,2vh,18px)}
.tnext.msg{color:var(--c);font-size:clamp(17px,2.4vh,22px)}
.sil{width:clamp(40px,6.5vh,60px);height:clamp(40px,6.5vh,60px);object-fit:contain;filter:brightness(0) opacity(.55)}
@media (max-width:560px){.tbar .btn span{display:none}.tbar .btn{width:64px;padding:0}}
@media (prefers-reduced-motion:reduce){.tstone.cur .tf{animation:none;box-shadow:0 0 0 6px var(--gold)}}
</style>
