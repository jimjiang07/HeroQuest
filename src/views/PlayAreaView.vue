<script setup lang="ts">
/* Play area: the hero's place fills the screen; the hero and every pet they own stand in it. Drag them about,
   tap one to make it hop, or pick a pose. Where each one stands is saved per hero (p.pose). */
import {computed,reactive,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {GEAR_SAY,QUESTS} from '@/content';
import {ITEMS,dressAll,itemSvg} from '@/art/wear';
import {REWARDS} from '@/rewards';
import * as L from '@/learn/learner';
import {audio,say,sfx} from '@/services/audio';
import HeroAvatar from '@/components/HeroAvatar.vue';

const P=useProgress(),router=useRouter();
setHeader({title:'Play area',back:()=>router.push('/wardrobe'),backLabel:'Wardrobe'});
const p=computed(()=>P.hero!);
const svg=(id:string)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(itemSvg(id));

const place=computed(()=>dressAll(p.value.avatar,p.value.kit).bg as string|undefined);
const bgSrc=computed(()=>place.value?svg(place.value):null);
const owned=computed(()=>new Set([...L.gearWon(p.value,QUESTS),...L.itemsWon(p.value,REWARDS)]));
const pets=computed(()=>Object.values(ITEMS).filter(i=>i.slot==='pet'&&owned.value.has(i.id)).map(i=>({id:i.id,name:i.name,src:svg(i.id)})));

// where each one stands: x across, y down to their feet, in % of the place
const home=(id:string,i:number)=>id==='hero'?{x:32,y:94}:{x:58+(i%4)*11,y:97-Math.floor(i/4)*9};
const pos=reactive<Record<string,{x:number;y:number}>>({});
for(const [i,id] of ['hero',...pets.value.map(q=>q.id)].entries())pos[id]={...home(id,i-1),...p.value.pose?.[id]};

const area=ref<HTMLElement>();
let drag:{id:string;el:HTMLElement;sx:number;sy:number;moved:boolean}|null=null;
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
function down(id:string,e:PointerEvent){
  audio();const el=e.currentTarget as HTMLElement;
  el.setPointerCapture?.(e.pointerId);drag={id,el,sx:e.clientX,sy:e.clientY,moved:false};
}
function move(e:PointerEvent){
  if(!drag||!area.value)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<8)return;
  drag.moved=true;
  const r=area.value.getBoundingClientRect();
  pos[drag.id]={x:clamp((e.clientX-r.left)/r.width*100,6,94),y:clamp((e.clientY-r.top)/r.height*100,25,99)};
}
function up(){
  if(!drag)return;const d=drag;drag=null;
  if(!d.moved){hop(d.el.querySelector('.pa-body'));return}
  const {x,y}=pos[d.id];
  p.value.pose={...p.value.pose,[d.id]:{x:Math.round(x*10)/10,y:Math.round(y*10)/10}};
}
// restart the CSS animation even when the same one is still on
function play(el:Element|null,cls:string){if(!el)return;el.classList.remove('hop','wave','jump','spin');void (el as HTMLElement).offsetWidth;el.classList.add(cls)}
function hop(el:Element|null){sfx.hop();play(el,'hop')}
const heroBody=ref<HTMLElement|null>(null),setHero=(el:unknown)=>{heroBody.value=el as HTMLElement|null};
const POSES=[{k:'wave',label:'Wave'},{k:'jump',label:'Jump'},{k:'spin',label:'Spin'}];
function pose(k:string){audio();k==='jump'?sfx.hop():sfx.pop();play(heroBody.value??null,k)}
say(GEAR_SAY.play);
</script>

<template>
  <div class="pa">
    <div ref="area" class="pa-place" :class="{plain:!bgSrc}" :data-place="place??'none'" @pointermove="move" @pointerup="up" @pointercancel="up">
      <img v-if="bgSrc" class="pa-bg" :src="bgSrc" alt="" draggable="false">
      <div v-for="a in [{id:'hero'},...pets]" :key="a.id" class="pa-actor" :class="{me:a.id==='hero'}" :data-id="a.id"
        :style="{left:pos[a.id].x+'%',top:pos[a.id].y+'%',zIndex:Math.round(pos[a.id].y)}"
        :aria-label="a.id==='hero'?'Your hero':(a as {name:string}).name" role="img" @pointerdown="down(a.id,$event)">
        <div v-if="a.id==='hero'" :ref="setHero" class="pa-body"><HeroAvatar :avatar="p.avatar" :kit="p.kit" :size="200" full/></div>
        <div v-else class="pa-body"><img :src="(a as {src:string}).src" alt="" draggable="false"></div>
      </div>
    </div>
    <div class="pa-poses">
      <button v-for="b in POSES" :key="b.k" class="btn alt" :data-pose="b.k" @click="pose(b.k)">{{ b.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.pa{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;gap:clamp(8px,1.4vh,14px);padding-bottom:4px}
.pa-place{position:relative;flex:1;min-height:0;overflow:hidden;border:4px solid var(--ink);border-radius:var(--rd);background:var(--soft);container-type:size;touch-action:none;user-select:none;-webkit-user-select:none}
.pa-place.plain{background:linear-gradient(var(--soft) 68%,var(--mid) 68%)}
.pa-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.pa-actor{position:absolute;width:min(17cqh,16cqw);aspect-ratio:1;transform:translate(-50%,-100%);touch-action:none;cursor:grab}
.pa-actor.me{width:min(46cqh,40cqw)}
.pa-body{width:100%;height:100%;transform-origin:50% 100%}
.pa-body img,.pa-body :deep(.av){width:100%;height:100%;display:block}
.pa-body :deep(.av img){width:100%;height:100%;pointer-events:none}
.pa-body.hop{animation:pahop .5s ease-out}
.pa-body.jump{animation:pahop .7s cubic-bezier(.3,1.4,.5,1)}
.pa-body.wave{animation:pawave 1s ease-in-out}
.pa-body.spin{animation:paspin .8s ease-in-out;transform-origin:50% 50%}
@keyframes pahop{40%{transform:translateY(-28%) scale(1.04,.96)}70%{transform:translateY(0) scale(1.06,.92)}}
@keyframes pawave{20%,60%{transform:rotate(-9deg)}40%,80%{transform:rotate(9deg)}}
@keyframes paspin{to{transform:rotateY(360deg)}}
.pa-poses{flex:none;display:flex;justify-content:center;gap:clamp(8px,2vw,18px)}
.pa-poses .btn{min-height:60px;padding:8px clamp(14px,3vw,28px)}
@media (max-height:520px){.pa-poses .btn{min-height:52px}}
@media (prefers-reduced-motion:reduce){.pa-body.hop,.pa-body.jump,.pa-body.wave,.pa-body.spin{animation:none}}
</style>
