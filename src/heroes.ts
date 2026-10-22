/* Heroes and worlds a child can pick. None is labelled for boys or girls, and colours aren't coded by gender. */
export const AVATARS:Record<string,{name:string;bg:string;d:string}>={
  dragon:{name:'Dragon',bg:'#fdebe7',d:'M8 34c0-10 7-18 16-18s16 8 16 18M14 20l-4-8 8 4M34 20l4-8-8 4M18 30h2M28 30h2M20 38c2 2 6 2 8 0'},
  owl:{name:'Owl',bg:'#e3f6f8',d:'M10 14l6 4h16l6-4v20c0 6-6 10-14 10S10 40 10 34zM18 26h.1M30 26h.1M22 32l2 3 2-3'},
  robot:{name:'Robot',bg:'#fff3c4',d:'M12 16h24v22H12zM24 8v8M20 26h2M28 26h2M18 33h12M8 24v8M40 24v8'},
  fox:{name:'Fox',bg:'#ffe8cc',d:'M8 10l8 12h16l8-12-4 22-12 10-12-10zM19 28h2M27 28h2M22 34h4'},
  unicorn:{name:'Unicorn',bg:'#ece9ff',d:'M14 42V26c0-8 6-14 14-14l4-8 2 9c4 2 6 6 6 11v4l-6 2-4-4v16M24 22h2'},
  explorer:{name:'Explorer',bg:'#e9f6ec',d:'M10 20h28M14 20c0-6 4-10 10-10s10 4 10 10M16 20v4c0 6 4 10 8 10s8-4 8-10v-4M20 26h2M26 26h2M14 44c2-5 6-8 10-8s8 3 10 8'}
};
export const WORLDS:Record<string,{name:string;c:string}>={castle:{name:'Castle',c:'#5b4bc4'},ocean:{name:'Ocean',c:'#0c8599'},space:{name:'Space',c:'#3a2f6b'},jungle:{name:'Jungle',c:'#2f9e44'}};
