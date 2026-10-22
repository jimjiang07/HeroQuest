/* What a step inside a run can do: set the spoken prompt, say it's finished, or put the next question behind Next. */
import {inject,type InjectionKey} from 'vue';

export interface RunApi{
  setPrompt(text:string):void;   // shows nothing; the voice reads it and 🔊 repeats it
  setOK(v?:boolean):void;        // the step is complete: Next moves on
  onNext(fn:()=>void):void;      // Next runs fn (e.g. the next question) instead of leaving the step
  finish(say?:string):void;      // cheer, confetti, optional words, then setOK
  alive():boolean;               // false once the child has left: async steps stop after a wait
}
export const RUN:InjectionKey<RunApi>=Symbol('run');
export function useRun():RunApi{
  const r=inject(RUN);if(!r)throw new Error('useRun() outside a StepRunner');
  return r;
}
