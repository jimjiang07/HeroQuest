<script setup lang="ts">
/* For grown-ups (opened by press-and-hold): skills per hero, quick feedback, heroes and backup, voice settings. */
import {computed,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {QUESTS} from '@/content';
import {AVATARS,WORLDS} from '@/heroes';
import * as L from '@/learn/learner';
import {say,vRank,voices} from '@/services/audio';
import HeroAvatar from './HeroAvatar.vue';
import BackupCode from './BackupCode.vue';

const emit=defineEmits<{close:[]}>();
const P=useProgress(),router=useRouter();
const tab=ref<'skills'|'feedback'|'heroes'|'settings'>('skills');
const TABS={skills:'Skills',feedback:'How did it go?',heroes:'Heroes',settings:'Settings'} as const;
const hero=computed(()=>P.hero);
const CHIP:Record<L.Status,string>={secure:'Secure',growing:'Growing',notyet:'Not yet'};

// feedback form: rating rows pick one, tags toggle
const fb=ref({quest:QUESTS[0]?.id??'',level:null as string|null,fun:null as string|null,tags:[] as string[],note:''});
const LEVELS=['too easy','just right','too hard'],FUN=['loved it','it was OK','not keen'];
const TAGS=['picture confusing','voice too fast','wanted more','got tired','word unfamiliar','theme didn’t suit','something broke'];
const fmsg=ref('Saved on this device only. “Copy” gives ratings and notes, never names or answers.');
const toggleTag=(t:string)=>{const a=fb.value.tags;fb.value.tags=a.includes(t)?a.filter(x=>x!==t):[...a,t]};
function saveFb(){
  if(!hero.value)return;
  L.addFeedback(hero.value,{...fb.value,note:fb.value.note.trim()});
  fb.value={...fb.value,level:null,fun:null,tags:[],note:''};fmsg.value='Saved on this device. Thank you!';
}
async function copyFb(){
  const name=(id:string)=>QUESTS.find(q=>q.id===id)?.name??id;
  const text=Object.values(P.st.profiles).flatMap(x=>x.feedback||[]).map(f=>`${f.day} · ${name(f.quest)}: ${f.level??'-'}, ${f.fun??'-'}${f.tags.length?' · '+f.tags.join(', '):''}${f.note?' · '+f.note:''}`).join('\n')||'No feedback yet.';
  try{await navigator.clipboard.writeText(text);fmsg.value='Copied. Paste it into a message to the Hero Quest team.'}catch{fmsg.value=text}
}

// heroes and backup
const sure=ref<string|null>(null),imsg=ref('Progress is saved on this device only. Back it up to move to another device. On iPhone and iPad, add Hero Quest to the Home Screen so Safari keeps it.');
function del(id:string){if(sure.value!==id){sure.value=id;return}L.removeProfile(P.st,id);sure.value=null}
function backup(){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(P.st,null,1)],{type:'application/json'}));
  a.download=`hero-quest-backup-${L.today()}.json`;a.click();
}
async function restore(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;
  try{P.replace(JSON.parse(await f.text()));imsg.value='Progress restored.'}catch{imsg.value='That file is not a Hero Quest backup.'}
}
// screens read the store reactively; only a deleted hero needs somewhere else to go
function close(){emit('close');if(!P.hero)router.push('/who')}
</script>

<template>
  <div class="ov show" role="dialog" aria-modal="true" aria-label="For grown-ups" @click.self="close">
    <div class="panel">
      <h2>For grown-ups</h2>
      <div class="gtabs" role="tablist">
        <button v-for="(v,k) in TABS" :key="k" role="tab" class="gtab" :aria-selected="tab===k" @click="tab=k">{{ v }}</button>
      </div>

      <div v-if="tab==='skills'">
        <template v-if="hero">
          <p class="tip">{{ AVATARS[hero.avatar]?.name }}’s skills. Secure = boss beaten, then a rematch won on a later day.</p>
          <div v-for="q in QUESTS" :key="q.id" class="srow">
            <div><b>{{ q.name }}</b><small>{{ q.subject==='maths'?'Maths':'English' }} · last played {{ hero.skills[q.id]?.last??'never' }}</small></div>
            <span class="schip" :class="L.statusOf(hero,q.id)">{{ CHIP[L.statusOf(hero,q.id)] }}</span>
            <div class="sact">
              <button class="mini" @click="L.setOverride(hero,q.id,'secure')">Treat as secure</button>
              <button class="mini" @click="L.practiseAgain(hero,q.id)">Practise again</button>
            </div>
          </div>
        </template>
        <p v-else>No hero yet.</p>
      </div>

      <div v-else-if="tab==='feedback'">
        <label class="stack">Which quest? <select v-model="fb.quest"><option v-for="q in QUESTS" :key="q.id" :value="q.id">{{ q.name }}</option></select></label>
        <div class="optrow"><button v-for="v in LEVELS" :key="v" class="opt" :aria-pressed="fb.level===v" @click="fb.level=fb.level===v?null:v">{{ v }}</button></div>
        <div class="optrow"><button v-for="v in FUN" :key="v" class="opt" :aria-pressed="fb.fun===v" @click="fb.fun=fb.fun===v?null:v">{{ v }}</button></div>
        <p class="tip">Anything stand out? Tap any.</p>
        <div class="optrow wrap"><button v-for="t in TAGS" :key="t" class="opt" :aria-pressed="fb.tags.includes(t)" @click="toggleTag(t)">{{ t }}</button></div>
        <label class="stack">A note (optional) <textarea v-model="fb.note" rows="2"></textarea></label>
        <div class="row"><button class="btn alt" @click="copyFb">Copy all feedback</button><button class="btn" @click="saveFb">Save</button></div>
        <p class="tip">{{ fmsg }}</p>
      </div>

      <div v-else-if="tab==='heroes'">
        <div v-for="(h,id) in P.st.profiles" :key="id" class="srow">
          <div><HeroAvatar :avatar="h.avatar" :size="40"/> <b>{{ AVATARS[h.avatar]?.name }}</b> <small>{{ WORLDS[h.world]?.name }} · since {{ h.created }}</small></div>
          <div class="sact">
            <button class="mini" @click="P.st.active=String(id)">{{ id===P.st.active?'Playing now':'Switch' }}</button>
            <button class="mini" @click="del(String(id))">{{ sure===id?'Tap again to delete':'Delete' }}</button>
          </div>
        </div>
        <div class="row"><button class="btn alt" @click="backup">Back up progress</button><label class="btn alt filebtn">Restore backup<input type="file" accept="application/json" hidden @change="restore"></label></div>
        <p class="tip">{{ imsg }}</p>
        <BackupCode/>
      </div>

      <div v-else>
        <label>Voice reads aloud <input v-model="P.cfg.voice" type="checkbox"></label>
        <label>Voice <select v-model="P.cfg.voiceName" @change="say('Hello! This is my voice.')"><option value="">Natasha (recorded)</option><option v-for="v in voices" :key="v.name" :value="v.name">{{ vRank(v)>=4?'⭐ ':'' }}{{ v.name }} ({{ v.lang }})</option></select></label>
        <p class="tip">Natasha is recorded, so she sounds the same on every device. The other voices come from this device; ⭐ marks the natural ones.</p>
        <label>Speed <input v-model.number="P.cfg.rate" type="range" min="0.6" max="1.2" step="0.05"></label>
        <label>Sound effects <input v-model="P.cfg.sfx" type="checkbox"></label>
        <label>Unlock every quest and step <input v-model="P.st.unlockAll" type="checkbox"></label>
        <p class="tip">No timers and no buzzers: a wrong tap just says “try again”. After each one, ask “How did you work that out?”. Fingers are welcome.</p>
        <div class="row"><button v-if="hero" class="btn alt" @click="hero.quests={};hero.skills={}">Clear this hero’s progress</button></div>
      </div>

      <div class="row"><button class="btn" @click="close">Done</button></div>
    </div>
  </div>
</template>
