import {$,$$,say,sfx,audio,sleep,dot,frameHTML,miniFrame,confetti,setOK,setPrompt,onNext,readTicks,shuffle,NUMW,EMO,BL,hlw,cfg} from '../engine.js';

/* English activity: Blend Bridge (consonant blends). Content comes from a unit's "app" block; a step only appears when its block exists. */
const ORDER=['trick','blends','sound','sent','match','circle','boss','build','bridge'],GAMES=['build','bridge'];
export default function make(data){
  const RE={};
  // gentle wrong tap: shake and "Try again!"
  const oops=b=>{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();const m=$('#msg');if(m)m.textContent='Try again!';say('Try again!')};
  const pics=(right,wrong)=>shuffle([right,...wrong]).map(w=>`<button class="ch pc" data-w="${w}" aria-label="${w}">${EMO[w]}</button>`).join('');
  const bigWord=w=>{const m=$('#msg');m.innerHTML=hlw(w);m.style.cssText='font-family:var(--read);font-size:clamp(40px,8vw,72px)'};
  const next=more=>{if(more)onNext(more);else{sfx.cheer();confetti();setOK()}};
  const words=t=>t.split(' ').map(w=>{const c=w.replace(/[.,!?]/g,''),p=w.slice(c.length);return `<span>${hlw(c)}${p}</span>`}).join(' ');
  RE.trick=el=>{
    const [x,y]=data.trick.blend,rest=data.trick.rest,word=data.trick.word;
    el.innerHTML=`<div class="prompt">Secret trick: two sounds, side by side!</div>
      <div class="tiles2" id="tl" style="gap:clamp(40px,12vw,120px)"><div class="tl">${x}</div><div class="tl">${y}</div></div>
      <div id="out" style="min-height:clamp(80px,16vw,150px);display:grid;place-items:center"></div>
      <div class="msg" id="msg">Two letters. Two sounds.</div>
      <div class="row"><button class="btn red" id="sl">Slide!</button><button class="btn alt" id="add" disabled>Add the rest</button></div>`;
    setPrompt(`Two letters, two sounds. Tap Slide, and ${x} and ${y} slide together.`);
    $('#sl').onclick=async()=>{
      audio();$('#sl').disabled=true;sfx.hop();say(`${x} ... ${y} ... ${x}${y}!`);
      const tl=$('#tl');tl.style.gap='6px';$$('.tl',tl).forEach(t=>t.classList.add('bl'));
      await sleep(700);sfx.ding();$('#msg').textContent=`${x} and ${y} slide together: ${x}${y}!`;$('#add').disabled=false;
    };
    $('#add').onclick=async()=>{
      audio();$('#add').disabled=true;const tl=$('#tl');
      for(const ch of rest){const t=document.createElement('div');t.className='tl pop';t.textContent=ch;tl.appendChild(t);sfx.pop();await sleep(450)}
      $('#out').innerHTML=`<span class="big-emo">${EMO[word]}</span>`;sfx.ding();
      $('#msg').textContent=`${x}${y} + ${rest.join('')} = ${word}!`;say(`${x}${y}, ${rest.join('')}. ${word}!`);await sleep(900);sfx.cheer();confetti();setOK();
    };
  };
  RE.blends=el=>{
    const F=data.blends.families;
    el.innerHTML=`<div class="prompt">Tap 🔊 to hear a row. Say it too, then tick it!</div>
      <div class="fams">${F.map(([b,ws],i)=>`<div class="fam" id="fm${i}"><button class="fb hr" data-i="${i}" aria-label="Hear the ${b} row">${b}<small>🔊</small></button>
        <div class="ws">${ws.map(w=>`<button class="wd" data-i="${i}" data-w="${w}">${hlw(w)}</button>`).join('')}</div>
        <button class="tick" data-i="${i}" aria-label="Tick row ${b}">✓</button></div>`).join('')}</div>`;
    setPrompt('Tap the speaker to hear a row. Say it too, then tick it.');
    const heard=readTicks(el,F.length,'You read all the blends! Great reading!'),tapped=F.map(()=>new Set());
    // the row counts as heard after its speaker, or after every word in it was tapped
    $$('.wd',el).forEach(b=>b.onclick=()=>{audio();sfx.pop();say(b.dataset.w);const i=+b.dataset.i;tapped[i].add(b.dataset.w);if(tapped[i].size===F[i][1].length)heard(i)});
    $$('.fb',el).forEach(b=>b.onclick=()=>{audio();sfx.pop();const i=+b.dataset.i,[bl,ws]=F[i];say(`${bl[0]}, ${bl[1]}. ${ws.join(', ')}.`);heard(i)});
  };
  RE.sent=el=>{
    const S=data.sent.items;
    el.innerHTML=`<div class="prompt">Tap 🔊 to hear a sentence. Read along, then tick it!</div>
      <div class="sents">${S.map(([e,t],i)=>`<div class="sent" id="st${i}"><span class="em" aria-hidden="true">${EMO[e]}</span>
        <button class="tx" data-i="${i}">${words(t)}</button><button class="hr" data-i="${i}" aria-label="Hear sentence ${i+1}">🔊</button><button class="tick" data-i="${i}" aria-label="Tick sentence ${i+1}">✓</button></div>`).join('')}</div>`;
    setPrompt('Tap the speaker to hear a sentence. Read along, then tick it.');
    const heard=readTicks(el,S.length,'You read every sentence! Brilliant!');
    let run=0;
    $$('.tx,.hr',el).forEach(b=>b.onclick=async()=>{
      audio();sfx.pop();const i=+b.dataset.i,text=S[i][1];const my=++run;say(text);heard(i);
      const sp=$$(`.tx[data-i="${i}"] span`,el);const gap=430/cfg.rate;
      sp.forEach(s=>s.classList.remove('now'));
      for(let k=0;k<sp.length;k++){if(my!==run)return;sp.forEach(s=>s.classList.remove('now'));sp[k].classList.add('now');await sleep(gap)}
      sp.forEach(s=>s.classList.remove('now'));
    });
  };
  RE.circle=el=>{
    const Q=data.circle.questions;let q=0;
    const draw=()=>{
      const [w,ch,right,pos]=Q[q];
      const ask=pos==='start'?`Which blend is at the start of ${w}?`:`Which blend is at the end of ${w}?`;
      el.innerHTML=`<div class="prompt">${ask}</div><div class="pic-big" aria-hidden="true">${EMO[w]}</div>
        <div class="choices">${ch.map((c,k)=>`<button class="ch rd" data-k="${k}">${c}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt(ask);
      $$('.ch',el).forEach(b=>b.onclick=()=>{
        audio();
        if(+b.dataset.k===right){
          b.classList.add('right');$$('.ch',el).forEach(c=>c.disabled=true);sfx.ding();
          $('#msg').innerHTML=`${hlw(w)}`;$('#msg').style.fontFamily='var(--read)';$('#msg').style.fontSize='clamp(40px,8vw,72px)';
          say(`Yes! ${w}!`);
          if(q<Q.length-1)onNext(()=>{q++;draw()});else setOK();
        }else{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();$('#msg').textContent='Try again!';say('Try again!')}
      });
    };
    draw();
  };
  // sound it out: tap each sound in order (blends stay joined), then pick the picture
  RE.sound=el=>{
    const W=data.sound.items;let w=0;
    const draw=()=>{
      const [word,snd,wrong]=W[w];let n=0;
      el.innerHTML=`<div class="prompt">Tap each sound. Then say it fast!</div>
        <div class="tiles2 snds">${snd.map((s,i)=>`<button class="tl snd ${BL.includes(s)?'bl':''} ${i?'':'nx'}" data-i="${i}">${s}</button>`).join('')}</div>
        <div class="choices" id="pk" hidden>${pics(word,wrong)}</div><div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt('Tap each sound, one by one. Then say it fast!');
      $$('.snd',el).forEach(b=>b.onclick=()=>{
        audio();const i=+b.dataset.i;if(i<n)return say(snd[i]);if(i>n)return oops(b);
        b.classList.remove('nx');b.classList.add('on');sfx.pop();say(snd[i]);n++;
        if(n<snd.length)$(`.snd[data-i="${n}"]`,el).classList.add('nx');
        else{$('#msg').textContent='Say it fast! Which picture is it?';$('#pk').hidden=false;say('Say it fast! Which picture is it?')}
      });
      $$('.pc',el).forEach(b=>b.onclick=()=>{
        audio();if(b.dataset.w!==word)return oops(b);
        b.classList.add('right');$$('.pc',el).forEach(c=>c.disabled=true);sfx.ding();bigWord(word);say(`${snd.join(', ')}. ${word}!`);
        next(w<W.length-1&&(()=>{w++;draw()}));
      });
    };
    draw();
  };
  // read and match: no picture with the word, so he must read it
  RE.match=el=>{
    const W=data.match.items;let w=0;
    const draw=()=>{
      const [word,wrong]=W[w];
      el.innerHTML=`<div class="prompt">Read the word. Tap its picture!</div>
        <div class="rw">${hlw(word)}</div><div class="choices">${pics(word,wrong)}</div><div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt('Read the word by yourself. Then tap its picture.');
      $$('.pc',el).forEach(b=>b.onclick=()=>{
        audio();if(b.dataset.w!==word)return oops(b);
        b.classList.add('right');$$('.pc',el).forEach(c=>c.disabled=true);sfx.ding();$('#msg').textContent='Yes!';say(`Yes! ${word}!`);
        next(w<W.length-1&&(()=>{w++;draw()}));
      });
    };
    draw();
  };
  // boss: read the sentence out loud first, then tap the matching picture
  RE.boss=el=>{
    const S=data.boss.items;let q=0;
    const draw=()=>{
      const [t,right,wrong]=S[q];
      el.innerHTML=`<div class="prompt">Boss battle! Read it out loud first.</div>
        <div class="sent bsent"><div class="tx">${words(t)}</div></div>
        <div class="row" id="rr"><button class="btn" id="rd">I read it out loud ✓</button></div>
        <div class="choices" id="pk" hidden>${pics(right,wrong)}</div><div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt('Boss battle! Read the sentence out loud. Then tap, I read it.');
      $('#rd').onclick=()=>{audio();sfx.ding();$('#rr').hidden=true;$('#pk').hidden=false;$('.prompt',el).textContent='Which picture matches?';setPrompt('Great reading! Which picture matches the sentence?')};
      $$('.pc',el).forEach(b=>b.onclick=()=>{
        audio();if(b.dataset.w!==right)return oops(b);
        b.classList.add('right');$$('.pc',el).forEach(c=>c.disabled=true);sfx.ding();$('#msg').textContent='You beat the boss question!';say(t);
        next(q<S.length-1&&(()=>{q++;draw()}));
      });
    };
    draw();
  };
  RE.build=el=>{
    const W=data.build.words;let w=0;
    const draw=()=>{
      const word=W[w],letters=[...word];
      const extra=shuffle('abeghimoptuw'.split('').filter(c=>!letters.includes(c))).slice(0,2);
      const pool=shuffle([...letters,...extra]),sb=BL.some(b=>word.startsWith(b)),eb=BL.some(b=>word.endsWith(b)&&word.length>3);
      const isBl=i=>(sb&&i<2)||(eb&&i>=letters.length-2);
      el.innerHTML=`<div class="prompt">Game: build the word. Start with the blend!</div>
        <div class="pic-big" aria-hidden="true">${EMO[word]}</div>
        <div class="slots">${letters.map((_,i)=>`<div class="slot ${isBl(i)?'bl':''}" id="sl${i}"></div>`).join('')}</div>
        <div class="pool">${pool.map(c=>`<button class="lt" data-c="${c}">${c}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt(`Build the word ${word}. Start with the blend!`);
      let next=0;
      $$('.lt',el).forEach(b=>b.onclick=()=>{
        audio();
        if(b.dataset.c===letters[next]){
          const sl=$('#sl'+next);sl.textContent=b.dataset.c;sl.classList.add('full');b.classList.add('used');sfx.pop();next++;
          if(next===letters.length){
            sfx.ding();$('#msg').innerHTML=hlw(word);$('#msg').style.cssText='font-family:var(--read);font-size:clamp(44px,9vw,80px)';say(word+'!');
            if(w<W.length-1)onNext(()=>{w++;draw()});
            else{sfx.cheer();confetti();setOK()}
          }
        }else{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();say('Try another letter.')}
      });
    };
    draw();
  };
  RE.bridge=el=>{
    const Q=data.bridge.questions,N=Q.length+2;let q=0;
    el.innerHTML=`<div class="bridge" id="br" style="--n:${N}"><div class="hz" id="hz" style="--i:0"><svg viewBox="0 0 100 120" aria-hidden="true"><use href="#hero"/></svg></div>
        <div class="planks">${Array.from({length:N},(_,i)=>`<div class="pl ${i===0?'st':i===N-1?'end':''}" id="pl${i}">${i===N-1?'🏰':''}</div>`).join('')}</div><div class="water"></div></div>
      <div class="prompt" id="qp"></div><div class="choices" id="qc"></div><div class="msg" id="msg"></div>`;
    const ask=()=>{
      const [b,right,wrong,pos]=Q[q];const opts=shuffle([right,wrong]),where=pos==='end'?'ends':'starts';
      $('#qp').innerHTML=`Which word ${where} with <span class="bigq">${b}</span>?`;$('#msg').textContent='';
      $('#qc').innerHTML=opts.map(o=>`<button class="ch rd" data-w="${o}">${o}</button>`).join('');
      setPrompt(`Which word ${where} with ${b[0]}, ${b[1]}?`);
      $$('.ch',el).forEach(c=>c.onclick=async()=>{
        audio();
        if(c.dataset.w===right){
          $$('.ch',el).forEach(x=>x.disabled=true);c.classList.add('right');sfx.hop();say(`${right}!`);
          q++;$('#hz').style.setProperty('--i',q);$('#pl'+q).classList.add('ok');
          await sleep(1100);
          if(q<Q.length)ask();
          else{$('#hz').style.setProperty('--i',N-1);await sleep(700);$('#qp').textContent='You crossed the bridge!';$('#qc').innerHTML='';sfx.cheer();confetti();say('You crossed the bridge!');setOK()}
        }else{c.classList.remove('no');void c.offsetWidth;c.classList.add('no');sfx.oops();$('#msg').textContent='Try again!';say('Try again!')}
      });
    };
    ask();
  };

  const steps=['intro',...ORDER.filter(k=>data[k]),'end'];
  return {id:data.id,subject:'english',title:data.title,steps,games:GAMES.map(k=>steps.indexOf(k)).filter(i=>i>0),
    R:RE,intro:data.intro,end:data.end};
}
