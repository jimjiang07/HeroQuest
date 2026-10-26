<script setup lang="ts">
/* The item reveal at the end of a term step: for each new item a gift appears (pouch, wooden chest or the land's gold
   chest), wobbles twice, bursts open with a chime, the item rises and Natasha names it, then it flies onto the hero, who
   hops. Last, the next item shows as a silhouette. Not skippable: the parent keeps Next off until "done". */
import {computed,onBeforeUnmount,onMounted,ref} from 'vue';
import {ITEMS} from '@/art/wear';
import type {Kit} from '@/learn/learner';
import {sayDone,sfx,sleep} from '@/services/audio';
import {SAY} from '@/voice/say';
import HeroAvatar from './HeroAvatar.vue';
import {giftOf,itemUrl,GIFT_SVG} from './gifts';

const props=defineProps<{items:string[];avatar:string;kit?:Kit;next?:string|null}>();
const emit=defineEmits<{done:[]}>();

type Phase='appear'|'wobble'|'open'|'rise'|'fly'|'worn'|'next';
const idx=ref(0),phase=ref<Phase>('appear'),worn=ref<Kit>({...(props.kit??{})}),fly=ref({x:0,y:0});
const cur=computed(()=>props.items[Math.min(idx.value,props.items.length-1)]);
const it=computed(()=>ITEMS[cur.value]);
const gift=computed(()=>giftOf(cur.value));
// pets and places only draw on the hero's wide scene
const scene=computed(()=>!!(worn.value.pet||worn.value.bg));
const itemEl=ref<HTMLElement>(),heroEl=ref<HTMLElement>();
let gone=false;

/* small about 4 s, medium about 6 s, big about 8 s */
async function reveal(id:string){
  const k={pouch:1,wood:1.5,gold:2}[giftOf(id)];
  const step=async(p:Phase,ms:number)=>{phase.value=p;await sleep(ms*k);return !gone};
  if(!await step('appear',350))return;sfx.pop();
  if(!await step('wobble',1000))return;
  sfx.ding();if(!await step('open',450))return;
  phase.value='rise';
  await Promise.all([sayDone(SAY.found(ITEMS[id]?.name??'treasure')),sleep(800*k)]);if(gone)return;
  // fly from where the item is to the hero's middle
  const a=itemEl.value?.getBoundingClientRect(),b=heroEl.value?.getBoundingClientRect();
  if(a&&b)fly.value={x:b.left+b.width/2-(a.left+a.width/2),y:b.top+b.height/2-(a.top+a.height/2)};
  if(!await step('fly',650))return;
  const slot=ITEMS[id]?.slot;if(slot)worn.value={...worn.value,[slot]:id};
  sfx.hop();await step('worn',600);
}
onMounted(async()=>{
  for(let i=0;i<props.items.length;i++){idx.value=i;await reveal(props.items[i]);if(gone)return}
  phase.value='next';await sleep(700);if(!gone)emit('done');
});
onBeforeUnmount(()=>{gone=true});
</script>

<template>
  <div class="reveal" :class="[phase,gift]" :data-item="cur" :data-phase="phase" aria-live="polite">
    <div class="rv-stage">
      <div class="rv-gift">
        <span v-if="phase!=='next'" class="rv-box" :class="{opened:['open','rise','fly','worn'].includes(phase)}" v-html="GIFT_SVG[gift]"></span>
        <span v-if="['open','rise'].includes(phase)" class="rv-sparks" aria-hidden="true">
          <svg v-for="i in 8" :key="i" class="spk" viewBox="-12 -12 24 24" :style="{'--a':i*45+'deg','--c':['#ffd166','#ff8a6b','#6cc5c9','#c3b4ff'][i%4]}"><path d="M0 -10Q1.6 -1.6 10 0Q1.6 1.6 0 10Q-1.6 1.6 -10 0Q-1.6 -1.6 0 -10Z" fill="var(--c)" stroke="#2b2d42" stroke-width="2"/></svg>
        </span>
        <img v-if="['rise','fly'].includes(phase)" ref="itemEl" class="rv-item" :src="itemUrl(cur)" alt="" :style="{'--dx':fly.x+'px','--dy':fly.y+'px'}">
      </div>
      <div ref="heroEl" class="rv-hero" :class="{hop:phase==='worn'}"><HeroAvatar :avatar="avatar" :kit="worn" :size="150" :scene="scene" full/></div>
    </div>
    <div class="rv-name">{{ ['rise','fly','worn'].includes(phase)&&it?SAY.found(it.name):'' }}</div>
    <div v-if="phase==='next'&&next" class="rv-next" :data-next="next"><img class="sil" :src="itemUrl(next)" alt=""><span>Coming next</span></div>
  </div>
</template>

<style scoped>
.reveal{display:flex;flex-direction:column;align-items:center;gap:clamp(6px,1.5vh,14px);width:100%}
.rv-stage{display:flex;align-items:flex-end;justify-content:center;gap:clamp(10px,4vw,48px);height:clamp(200px,42vh,380px);width:100%}
.rv-gift{position:relative;width:clamp(150px,38vw,300px);height:100%;display:flex;align-items:flex-end;justify-content:center}
.rv-box{display:block;width:62%;animation:rv-in .35s ease-out both}
.gold .rv-box{width:82%}.wood .rv-box{width:72%}
.rv-box :deep(svg){width:100%;height:auto;overflow:visible}
.rv-box :deep(.lid){transform-box:fill-box;transform-origin:0% 100%;transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
.wobble .rv-box{animation:rv-wob 1s ease-in-out both}
.wood.wobble .rv-box{animation-duration:1.5s}.gold.wobble .rv-box{animation-duration:2s}
.rv-box.opened :deep(.lid){transform:translate(-6%,-30%) rotate(-38deg)}
.pouch .rv-box.opened :deep(.lid){transform:translateY(-40%) rotate(-20deg)}
.rv-sparks{position:absolute;left:50%;bottom:45%;width:0;height:0}
.spk{position:absolute;left:-14px;top:-14px;width:28px;height:28px;animation:rv-spark .9s ease-out both}
.rv-item{position:absolute;left:50%;bottom:28%;width:64%;max-height:70%;object-fit:contain;transform:translate(-50%,0) scale(.2);opacity:0;z-index:2;
  filter:drop-shadow(0 0 14px #ffd166);animation:rv-rise .8s cubic-bezier(.3,1.4,.5,1) forwards}
.fly .rv-item{animation:rv-fly .65s ease-in forwards}
.rv-hero{flex:none;display:flex;align-items:flex-end}
.rv-hero :deep(.av){--avs:clamp(110px,min(30vw,32vh),220px)!important}
.rv-hero.hop{animation:rv-hop .6s cubic-bezier(.3,1.6,.5,1)}
.rv-name{min-height:1.3em;font-size:clamp(22px,calc(3.6*var(--v)),34px);font-weight:700;color:var(--c)}
.rv-next{display:flex;align-items:center;gap:10px;font-weight:600;color:var(--muted);font-size:clamp(17px,2.4vh,22px);animation:rv-in .5s ease-out both}
.sil{width:clamp(48px,8vh,72px);height:clamp(48px,8vh,72px);object-fit:contain;filter:brightness(0) opacity(.55)}
@keyframes rv-in{from{opacity:0;transform:translateY(20px) scale(.6)}to{opacity:1;transform:none}}
@keyframes rv-wob{0%,50%,100%{transform:none}10%,60%{transform:rotate(-9deg) translateY(-4px)}25%,75%{transform:rotate(9deg) translateY(-6px)}40%,90%{transform:rotate(-4deg)}}
@keyframes rv-spark{from{transform:rotate(var(--a)) translateY(0) scale(.2);opacity:1}to{transform:rotate(var(--a)) translateY(-120px) scale(1.2);opacity:0}}
@keyframes rv-rise{to{transform:translate(-50%,-55%) scale(1);opacity:1}}
@keyframes rv-fly{from{transform:translate(-50%,-55%) scale(1);opacity:1}to{transform:translate(calc(-50% + var(--dx)),calc(-55% + var(--dy))) scale(.3);opacity:.2}}
@keyframes rv-hop{40%{transform:translateY(-22px)}}
/* reduced motion: the same steps, with fades instead of wobbles, sparks and flying */
@media (prefers-reduced-motion:reduce){
  .rv-box,.wobble .rv-box,.rv-next{animation:rv-fade .4s ease-out both}
  .rv-box :deep(.lid){transition:opacity .3s}
  .rv-box.opened :deep(.lid),.pouch .rv-box.opened :deep(.lid){transform:none;opacity:0}
  .spk{display:none}
  .rv-item{transform:translate(-50%,-55%);animation:rv-fade .5s ease-out forwards}
  .fly .rv-item{animation:rv-fadeout .5s ease-in forwards}
  .rv-hero.hop{animation:rv-fade .5s ease-out}
}
@keyframes rv-fade{from{opacity:0}to{opacity:1}}
@keyframes rv-fadeout{from{opacity:1}to{opacity:0}}
</style>
