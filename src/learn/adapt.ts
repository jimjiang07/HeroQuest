/* Help ladder for one practice run. Pure: no DOM, no storage (tested in tests/unit).
   help: 0 worked example · 1 labelled picture · 2 picture · 3 no picture · 4 stretch. A higher number means less help. */
export const HELP={WORKED:0,LABELLED:1,PICTURE:2,PLAIN:3,STRETCH:4} as const;
export const RULES={fadeAfter:2,raiseAfter:3,workedAfter:3,roughAfter:2,giveUpAfter:2};
export type Rules=typeof RULES;

export interface LadderState{help:number;diff:number;maxDiff:number;minHelp:number;maxHelp:number;streak:number;rough:number;worked:number}

const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));

export function start({help=2,diff=0,maxDiff=0,minHelp=1,maxHelp=4}:Partial<LadderState>={}):LadderState{
  return {help:clamp(help,minHelp,maxHelp),diff:clamp(diff,0,maxDiff),maxDiff,minHelp,maxHelp,streak:0,rough:0,worked:0};
}

/* After one answered question. tries counts taps until the right one (1 = right first time).
   Returns the next state plus what the screen should do: new numbers (raised) or a kind early finish (stop). */
export function next(s:LadderState,tries:number,R:Rules=RULES):{s:LadderState;raised:boolean;stop:boolean}{
  const n={...s};
  let raised=false,stop=false;
  if(tries===1){
    n.streak++;n.rough=0;n.worked=0;
    if(n.help>=HELP.PLAIN&&n.streak>=R.raiseAfter){
      // fade help before raising difficulty; at the top difficulty, stretch instead
      if(n.diff<n.maxDiff){n.diff++;n.help=clamp(HELP.PICTURE,n.minHelp,n.maxHelp);raised=true}
      else n.help=clamp(HELP.STRETCH,n.minHelp,n.maxHelp);
      n.streak=0;
    }else if(n.help<HELP.PLAIN&&n.streak>=R.fadeAfter){n.help=clamp(n.help+1,n.minHelp,n.maxHelp);n.streak=0}
  }else{
    n.streak=0;n.rough++;
    if(tries>=R.workedAfter){n.worked++;n.help=clamp(n.help-1,n.minHelp,n.maxHelp);n.rough=0}
    else if(n.rough>=R.roughAfter||n.help===HELP.STRETCH){n.help=clamp(n.help-1,n.minHelp,n.maxHelp);n.rough=0}
    // a kind early finish beats grinding: more help comes next time
    if(n.worked>=R.giveUpAfter)stop=true;
  }
  return {s:n,raised,stop};
}
