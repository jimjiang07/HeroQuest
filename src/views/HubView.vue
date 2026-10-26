<script setup lang="ts">
/* Choose a quest: a "Keep going" card, a boss rematch when one is due, then this subject's quests (a few, no scrolling). */
import {computed,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {QUESTS} from '@/content';
import * as L from '@/learn/learner';
import type {QuestDef,Subject} from '@/types';
import {audio,say,sfx,shake} from '@/services/audio';
import {art} from '@/heroes';
import HeroAvatar from '@/components/HeroAvatar.vue';
import Icon from '@/components/Icon.vue';
import {SAY} from '@/voice/say';

const P=useProgress(),router=useRouter();
const subj=ref<Subject>((sessionStorage.getItem('hq-subj') as Subject)||'maths');
setHeader({title:'More quests',back:()=>router.push('/term'),backLabel:'Map',backIcon:'map'});
const p=computed(()=>P.hero!);

type QS='lock'|'secure'|'beaten'|'going'|'new';
const stateOf=(q:QuestDef):QS=>!L.questOpen(p.value,q.needs,P.st.unlockAll)?'lock':L.statusOf(p.value,q.id)==='secure'?'secure'
  :L.stepDone(p.value,q.id,'boss')?'beaten':L.stepsDone(p.value,q.id)?'going':'new';
const LABEL:Record<QS,string>={lock:'Locked',secure:'Secure',beaten:'Boss beaten!',going:'Keep going',new:'New quest'};
const mine=computed(()=>QUESTS.filter(q=>q.subject===subj.value));
const keep=computed(()=>QUESTS.find(q=>stateOf(q)==='going')??mine.value.find(q=>stateOf(q)==='new'));
const rematch=computed(()=>QUESTS.find(q=>L.rematchDue(p.value,q.id)));
const needName=(q:QuestDef)=>QUESTS.find(x=>x.id===q.needs[0])?.name??'another quest';
say(keep.value?SAY.keepGoing(keep.value.name):'Pick a quest.');

function setSubj(s:Subject){audio();sfx.pop();subj.value=s;sessionStorage.setItem('hq-subj',s)}
function open(q:QuestDef,e:Event){
  audio();
  if(stateOf(q)==='lock'){shake(e.currentTarget as Element);say(SAY.opensAfter(needName(q)));return}
  sfx.pop();router.push(`/quest/${q.id}`);
}
</script>

<template>
  <button v-if="keep" class="keep" :data-q="keep.id" @click="open(keep,$event)">
    <span class="kk">Keep going</span><span class="kn">{{ keep.name }}</span>
    <span class="pips"><span v-for="s in L.QUEST_STEPS" :key="s" class="qp" :class="{ok:L.stepDone(p,keep.id,s),b:s==='boss'}"></span></span>
    <span class="go">Go!</span>
  </button>
  <button v-if="rematch" class="rematch" @click="audio();sfx.pop();router.push(`/play/${rematch.id}/boss?rematch=1`)">
    <img class="rmboss" :src="art(rematch.boss.art)" alt=""><span>{{ rematch.boss.name }} is back!</span><b>Rematch</b>
  </button>
  <div class="hubtop">
    <div class="tabs" role="tablist">
      <button v-for="s in (['maths','english'] as Subject[])" :key="s" role="tab" class="tab" :class="s" :aria-selected="s===subj" @click="setSubj(s)">{{ s==='maths'?'Maths':'English' }}</button>
    </div>
    <button class="wardb" aria-label="Wardrobe" @click="audio();sfx.pop();router.push('/wardrobe')"><HeroAvatar :avatar="p.avatar" :kit="p.kit" :size="52"/><Icon name="hanger"/></button>
  </div>
  <div class="quests">
    <button v-for="q in mine" :key="q.id" class="qcard" :class="stateOf(q)" :data-q="q.id" @click="open(q,$event)">
      <img class="qart" :src="art(q.art)" alt=""><span class="qn">{{ q.name }}</span>
      <span class="qs">{{ stateOf(q)==='lock'?`Opens after ${needName(q)}`:LABEL[stateOf(q)] }}</span>
      <span class="pips"><span v-for="s in L.QUEST_STEPS" :key="s" class="qp" :class="{ok:L.stepDone(p,q.id,s),b:s==='boss'}"></span></span>
    </button>
  </div>
</template>
