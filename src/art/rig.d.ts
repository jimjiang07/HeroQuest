/* Types for rig.js (the hero rig shared by scripts/make-art.mjs and the app). */
export type Slot='head'|'main'|'off'|'back'|'outfit';
/** a whole hero: looks plus one piece per slot (gear slots may be empty) */
export interface FullKit{skin:string;hair:string;style:string;outfit:string;head?:string;main?:string;off?:string;back?:string}
export interface GearDef{slot:Slot;name:string;art:string;vb:string}

export const INK:string;
export const C:Record<string,string>;
export const SLOTS:Slot[];
export const GEAR:Record<string,GearDef>;
export const STARTER:Record<string,FullKit>;
export const HEROES:[id:string,name:string,bg:string,kit:FullKit][];
export const FILTER:string;
export function dress(avatar:string,kit?:Partial<Record<Slot,string|null>>):FullKit;
export function heroBody(kit:FullKit):string;
export function gearBody(id:string):string;
export function svgDoc(a:{name:string;body:string;vb?:string}):string;
export function heroSvg(kit:FullKit,name?:string):string;
