<script setup lang="ts">
/* Grown-ups > Plan: what each of the 20 stones holds (warm-up, maths, English, thinking), a land (4 stones) per page.
   Changes are saved per device in st.plan and win over the term file; "Back to the term plan" drops a stone's changes. */
import {computed,ref} from 'vue';
import {useProgress} from '@/stores/progress';
import {STONES,TERM,englishUnits,mathsUnits,stoneDef,thinkUnits} from '@/term';
import type {StonePlan} from '@/learn/learner';
import termFile from '../../data/term/2026-t4.json';

const P=useProgress();
const page=ref(0),PAGES=Math.ceil(STONES/4);
const shown=computed(()=>Array.from({length:4},(_,i)=>page.value*4+i+1).filter(n=>n<=STONES));
const FIELDS:{k:keyof StonePlan;name:string;opts:()=>{id:string;data:{title:string}}[]}[]=[
  {k:'warmup',name:'Warm-up',opts:mathsUnits},{k:'maths',name:'Maths',opts:mathsUnits},
  {k:'english',name:'English',opts:englishUnits},{k:'think',name:'Thinking',opts:thinkUnits}];
const M=TERM.minutes,total=M.warmup+M.maths+M.english+M.thinking;

const val=(n:number,k:keyof StonePlan)=>stoneDef(P.st,n)[k]??'';
const changed=(n:number)=>!!P.st.plan?.[n]&&Object.keys(P.st.plan[n]).length>0;
function set(n:number,k:keyof StonePlan,v:string){
  const base=(termFile.stones.find(s=>s.stone===n) as StonePlan|undefined)?.[k]??'';
  const plan=(P.st.plan??={}),s={...plan[n]};
  if(v===base)delete s[k];else s[k]=v;
  if(Object.keys(s).length)plan[n]=s;else delete plan[n];
}
function reset(n:number){if(P.st.plan)delete P.st.plan[n]}
</script>

<template>
  <div class="plan">
    <p class="tip">What each stone holds. The child’s map shows numbers only. A guide for one session (never shown as a timer):
      warm-up {{ M.warmup }} min, maths {{ M.maths }} min, English {{ M.english }} min, thinking {{ M.thinking }} min, about {{ total }} min in all.</p>
    <div class="pnav">
      <button class="mini" :disabled="page===0" @click="page--">‹ Back</button>
      <b>{{ TERM.lands[page] ?? '' }} · stones {{ shown[0] }}–{{ shown[shown.length-1] }}</b>
      <button class="mini" :disabled="page>=PAGES-1" @click="page++">More ›</button>
    </div>
    <div v-for="n in shown" :key="n" class="pstone" :data-n="n">
      <div class="phead"><b>Stone {{ n }}</b>
        <button v-if="changed(n)" class="mini" @click="reset(n)">Back to the term plan</button></div>
      <div class="pgrid">
        <label v-for="f in FIELDS" :key="f.k" class="stack">{{ f.name }}
          <select :value="val(n,f.k)" :data-f="f.k" @change="set(n,f.k,($event.target as HTMLSelectElement).value)">
            <option value="">Not set</option>
            <option v-for="u in f.opts()" :key="u.id" :value="u.id">{{ u.data.title }}</option>
            <option v-if="val(n,f.k)&&!f.opts().some(u=>u.id===val(n,f.k))" :value="val(n,f.k)">{{ val(n,f.k) }} (coming soon)</option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan{display:flex;flex-direction:column;gap:8px}
.pnav{display:flex;align-items:center;justify-content:space-between;gap:8px}
.pstone{border:3px solid var(--ink);border-radius:var(--rd-s);padding:6px 10px;display:flex;flex-direction:column;gap:4px}
.phead{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:32px}
.pgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
@media (max-width:640px){.pgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.pgrid select{width:100%;min-width:0}
</style>
