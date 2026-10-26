<script setup lang="ts">
/* One stone of the term: its 9 steps as big buttons in three groups (maths, English, thinking), each showing the item it
   gives (a silhouette until won). Steps open in order; the next one glows. Grown-ups get the stone's two sheets. */
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import * as L from '@/learn/learner';
import {REWARDS,SESSION_STEPS,STEP_INFO,stoneDef,stoneReady,type Part,type SessionStep} from '@/term';
import {audio,say,sfx,shake} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import {itemUrl} from '@/components/gifts';

const props=defineProps<{n:number}>();
const P=useProgress(),router=useRouter(),p=computed(()=>P.hero!);
const S=stoneDef(P.st,props.n);
if(!stoneReady(S)||!L.stoneOpen(p.value,props.n,SESSION_STEPS,P.st.unlockAll))router.replace('/term');
setHeader({title:`Stone ${props.n}`,back:()=>router.push('/term'),backLabel:'Map',backIcon:'map'});

const PARTS:{part:Part;name:string}[]=[{part:'maths',name:'Maths'},{part:'english',name:'English'},{part:'thinking',name:'Thinking'}];
const reward=REWARDS.stones.find(s=>s.stone===props.n);
const isDone=(k:SessionStep)=>L.sessionStepDone(p.value,props.n,k);
const cur=computed(()=>SESSION_STEPS.find(k=>!isDone(k))??null);
const open=(k:SessionStep)=>!!P.st.unlockAll||SESSION_STEPS.slice(0,SESSION_STEPS.indexOf(k)).every(isDone);
const steps=computed(()=>SESSION_STEPS.map(k=>({k,...STEP_INFO[k],item:reward?.small[k]??'',state:isDone(k)?'done':k===cur.value?'cur':open(k)?'open':'lock'})));
const sheet=(s:'maths'|'english')=>`worksheets/term/stone-${props.n}-${s}.pdf`;
say(cur.value?'Tap the glowing step.':'You finished this stone! Play any step again.');

function go(st:{k:SessionStep;state:string},e:Event){
  audio();
  if(st.state==='lock'){shake(e.currentTarget as Element);say('Finish the step before it first!');return}
  sfx.pop();router.push(`/sp/${props.n}/${st.k}`);
}
</script>

<template>
  <div class="sess">
    <section v-for="g in PARTS" :key="g.part" class="sgroup" :class="g.part">
      <h2>{{ g.name }}</h2>
      <div class="srow2">
        <button v-for="st in steps.filter(x=>x.part===g.part)" :key="st.k" class="sstep" :class="st.state" :data-k="st.k" :aria-label="`${st.label}: ${st.state}`" @click="go(st,$event)">
          <img class="sitem" :class="{sil:st.state!=='done'}" :src="itemUrl(st.item)" alt="">
          <span class="slab">{{ st.label }}</span>
          <span v-if="st.state==='done'" class="stick"><Icon name="check"/></span>
        </button>
      </div>
    </section>
    <div class="sheets">For grown-ups:
      <a :href="sheet('maths')" target="_blank" rel="noopener">Maths sheet</a>
      <a :href="sheet('english')" target="_blank" rel="noopener">English sheet</a>
    </div>
  </div>
</template>

<style scoped>
.sess{flex:1;min-height:0;width:100%;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:clamp(8px,1.8vh,18px) clamp(10px,2vw,20px)}
.sgroup{border:4px solid var(--ink);border-radius:var(--rd);background:var(--card);padding:clamp(6px,1.2vh,12px) clamp(8px,1.5vw,14px);display:flex;flex-direction:column;gap:6px}
.sgroup.maths{flex:1 1 100%;max-width:760px;border-color:var(--ink);background:color-mix(in srgb,var(--lane-m) 12%,var(--card))}
.sgroup.english{background:color-mix(in srgb,var(--lane-e) 14%,var(--card))}
.sgroup.thinking{background:color-mix(in srgb,var(--lav) 22%,var(--card))}
.sgroup h2{margin:0;font-family:var(--disp);font-weight:400;font-size:clamp(20px,2.8vh,28px);letter-spacing:.3px}
.srow2{display:flex;gap:clamp(6px,1.4vw,12px);justify-content:center}
.sstep{--t:clamp(60px,min(16.5vw,16vh),124px);position:relative;width:var(--t);min-height:calc(var(--t)*1.25);border:4px solid var(--ink);border-radius:var(--rd-s);background:var(--card);
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;padding:6px 3px;box-shadow:0 5px 0 var(--ink);color:var(--ink)}
.sstep:active{transform:translateY(4px);box-shadow:0 1px 0 var(--ink)}
.sitem{width:78%;aspect-ratio:1;object-fit:contain}
.sitem.sil{filter:brightness(0) opacity(.45)}
.slab{font-weight:700;font-size:clamp(13px,min(3.3vw,2vh),18px);line-height:1.1}
.sstep.done{background:#fff3c4;color:#1d2140}
.sstep.cur{background:#fff;animation:glow 1.6s ease-in-out infinite}
.sstep.lock{border-style:dashed;box-shadow:none;opacity:.55}
.stick{position:absolute;top:-10px;right:-10px;width:30px;height:30px;border-radius:50%;border:3px solid var(--ink);background:var(--ok);color:#fff;display:grid;place-items:center}
.stick :deep(.ic){width:18px;height:18px}
.sheets{flex:1 1 100%;font-size:15px;color:var(--muted);display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap}
.sheets a{color:var(--muted);font-weight:600}
@media (prefers-reduced-motion:reduce){.sstep.cur{animation:none;box-shadow:0 0 0 6px var(--gold),0 5px 0 var(--ink)}}
</style>
