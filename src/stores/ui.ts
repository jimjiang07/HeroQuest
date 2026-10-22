/* The header: title, back button and subject colour, set by whichever screen is showing. */
import {reactive} from 'vue';
import type {Subject} from '@/types';

export const header=reactive<{title:string;back:null|(()=>void);backLabel:string;backIcon:string;subject:Subject|null}>({title:'Hero Quest',back:null,backLabel:'Back',backIcon:'back',subject:null});
export function setHeader(h:{title:string;back?:null|(()=>void);backLabel?:string;backIcon?:string;subject?:Subject|null}){
  Object.assign(header,{back:null,backLabel:'Back',backIcon:'back',subject:null},h);
}
