/* Hash routes: GitHub Pages serves one file, and the address bar never needs to change for a child. */
import {createRouter,createWebHashHistory} from 'vue-router';
import {useProgress} from '@/stores/progress';

export const router=createRouter({
  history:createWebHashHistory(),
  routes:[
    {path:'/',redirect:()=>{const p=useProgress();return Object.keys(p.st.profiles).length===1&&p.hero?'/term':'/who'}},
    {path:'/who',component:()=>import('@/views/WhoView.vue')},
    {path:'/new',component:()=>import('@/views/NewHeroView.vue')},
    // the term: 20 stones, one session each (the home once a hero is chosen); /hub is the free quest picker
    {path:'/term',component:()=>import('@/views/TermView.vue'),meta:{hero:true}},
    {path:'/session/:n',component:()=>import('@/views/SessionView.vue'),props:r=>({n:Number(r.params.n)}),meta:{hero:true}},
    {path:'/sp/:n/:key',component:()=>import('@/views/SessionPlayView.vue'),props:r=>({n:Number(r.params.n),step:r.params.key}),meta:{hero:true}},
    {path:'/hub',component:()=>import('@/views/HubView.vue'),meta:{hero:true}},
    {path:'/wardrobe',component:()=>import('@/views/WardrobeView.vue'),meta:{hero:true}},
    {path:'/play-area',component:()=>import('@/views/PlayAreaView.vue'),meta:{hero:true}},
    {path:'/quest/:id',component:()=>import('@/views/QuestView.vue'),props:true,meta:{hero:true}},
    {path:'/quest/:id/paper',redirect:to=>`/quest/${to.params.id}`},   // the old paper step: the worksheet is a button on the map now
    {path:'/play/:id/:step',component:()=>import('@/views/PlayView.vue'),props:r=>({id:r.params.id,step:r.params.step,rematch:r.query.rematch==='1'}),meta:{hero:true}},
    {path:'/:p(.*)*',redirect:'/'}
  ]
});
router.beforeEach(to=>{if(to.meta.hero&&!useProgress().hero)return '/who'});
