import {createApp} from 'vue';
import {createPinia} from 'pinia';
import './fonts';
import './styles/app.css';
import App from './App.vue';
import {router} from './router';

// no double-tap or pinch zoom and no long-press menu: a child kept zooming in by accident
const typing=(e:Event)=>(e.target as Element|null)?.closest?.('input,textarea,select');
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if((e as TouchEvent).touches.length>1)e.preventDefault()},{passive:false});
document.addEventListener('contextmenu',e=>{if(!typing(e))e.preventDefault()});

createApp(App).use(createPinia()).use(router).mount('#app');
