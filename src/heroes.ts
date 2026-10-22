/* Heroes and worlds a child can pick. Heroes are kids in different gear; none is labelled for boys or girls. Art: public/art (npm run art). */
export const AVATARS:Record<string,{name:string;bg:string}>={
  knight:{name:'Knight',bg:'#e9eef6'},
  ranger:{name:'Ranger',bg:'#e9f6ec'},
  wizard:{name:'Wizard',bg:'#ece9ff'},
  explorer:{name:'Explorer',bg:'#fdf2dc'},
  astronaut:{name:'Astronaut',bg:'#e6f3ff'},
  builder:{name:'Builder',bg:'#fff3c4'}
};
export const WORLDS:Record<string,{name:string;c:string}>={castle:{name:'Castle',c:'#9d8af0'},ocean:{name:'Ocean',c:'#4aa9ae'},space:{name:'Space',c:'#3a2f6b'},jungle:{name:'Jungle',c:'#7cc05e'}};
// relative to the page, so it works on Pages and localhost (vite base './')
export const art=(name:string)=>`art/${name}.svg`;
