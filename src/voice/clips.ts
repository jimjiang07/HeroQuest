/* Recorded voice clips: one clip per sentence, named by a hash of the sentence. Pure, shared by the app and make-voice. */
import {hash} from '@/learn/gen';

/* a line splits into sentences (and "Label:" parts), so lines that mix fixed and changing parts reuse each other's clips */
export const sentences=(text:string)=>text.replace(/\s+/g,' ').trim().split(/(?<=[.!?:])\s+/).filter(Boolean);
export const clipId=(sentence:string)=>hash(sentence.replace(/[’‘]/g,"'").toLowerCase()).toString(16).padStart(8,'0');
