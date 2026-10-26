<script setup lang="ts">
/* Make a hero: pick a hero, then a world. No names needed. */
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {AVATARS,WORLDS,art} from '@/heroes';
import {addProfile} from '@/learn/learner';
import {audio,say,sfx} from '@/services/audio';
import HeroAvatar from '@/components/HeroAvatar.vue';

const P=useProgress(),router=useRouter(),avatar=ref<string|null>(null);
setHeader({title:'New hero',back:()=>avatar.value?(avatar.value=null):router.push('/who')});
say('Pick your hero.');
function pickHero(a:string){audio();sfx.pop();avatar.value=a;say('Now pick your world.')}
function pickWorld(w:string){audio();sfx.ding();addProfile(P.st,{avatar:avatar.value!,world:w});router.push('/hub')}
</script>

<template>
  <template v-if="!avatar">
    <div class="prompt">Pick your hero</div>
    <div class="heroes six">
      <button v-for="(a,k) in AVATARS" :key="k" class="herob" :data-a="k" @click="pickHero(k)"><HeroAvatar :avatar="k" :size="96" full/><span>{{ a.name }}</span></button>
    </div>
  </template>
  <template v-else>
    <div class="prompt">Pick your world</div>
    <div class="worlds">
      <button v-for="(w,k) in WORLDS" :key="k" class="worldb" :data-w="k" :style="{'--wc':w.c}" @click="pickWorld(k)"><img :src="art('world-'+k)" alt=""><span>{{ w.name }}</span></button>
    </div>
  </template>
</template>
