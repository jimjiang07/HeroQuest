<script setup lang="ts">
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {AVATARS,WORLDS} from '@/heroes';
import {audio,say,sfx} from '@/services/audio';
import HeroAvatar from '@/components/HeroAvatar.vue';

const P=useProgress(),router=useRouter();
setHeader({title:'Hero Quest'});
const ids=Object.keys(P.st.profiles);
say(ids.length?'Who’s playing? Tap your hero.':'Hello! Let’s make your hero.');
function pick(id:string){audio();sfx.pop();P.st.active=id;router.push('/term')}
</script>

<template>
  <div class="prompt">Who’s playing?</div>
  <div class="heroes">
    <button v-for="id in ids" :key="id" class="herob" :data-id="id" :style="{'--wc':WORLDS[P.st.profiles[id].world]?.c}" @click="pick(id)">
      <HeroAvatar :avatar="P.st.profiles[id].avatar" :kit="P.st.profiles[id].kit" :size="110" full/><span>{{ AVATARS[P.st.profiles[id].avatar]?.name??'Hero' }}</span>
    </button>
    <button class="herob new" @click="audio();sfx.pop();router.push('/new')">{{ ids.length?'+ New hero':'+ Make your hero' }}</button>
  </div>
</template>
