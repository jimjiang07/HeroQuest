import {$,$$,say,sfx,audio,sleep,dot,confetti,setOK,setPrompt,onNext,shuffle,NUMW,readTicks} from '../engine.js';

/* Maths activity: Groups Power (multiplication as equal groups). Content comes from data/units/groups-power-2.json ("app"). */
export default function make(data){
  const RG={};
  // dots per bag laid out so 6 and 9 read as neat rectangles
  const colsOf=n=>n<=4?2:n<=6?3:n===9?3:n<=8?4:5;
  const bagH=(n,c='red',cls='')=>`<div class="bag ${cls}" style="--gc:${colsOf(n)}">${Array.from({length:n},()=>dot(c)).join('')}</div>`;
  const groupsH=(g,n,c='red',id='gp')=>`<div class="gp" id="${id}">${Array.from({length:g},()=>bagH(n,c)).join('')}</div>`;
  const emptyH=g=>`<div class="gp" id="gp">${Array.from({length:g},()=>`<div class="bag empty">?</div>`).join('')}</div>`;
  const arrH=(r,c,col)=>`<div class="arr" style="--ac:${c}">${Array.from({length:r*c},()=>dot(col)).join('')}</div>`;
  const seq=(g,n,from=0)=>Array.from({length:g},(_,i)=>from+(i+1)*n);
  function miniGroups(g,n){
    const cols=colsOf(n),rows=Math.ceil(n/cols),bw=cols*16+8,bh=rows*16+8,per=g<=3?g:Math.ceil(g/2),lines=Math.ceil(g/per);
    const W=per*(bw+8)-4,H=lines*(bh+8)-4;
    let s=`<svg class="mg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${g} groups of ${n}">`;
    for(let i=0;i<g;i++){
      const x=2+(i%per)*(bw+8),y=2+Math.floor(i/per)*(bh+8);
      s+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="7" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/>`;
      for(let k=0;k<n;k++)s+=`<circle cx="${x+12+(k%cols)*16}" cy="${y+12+Math.floor(k/cols)*16}" r="6" class="d-red" stroke="var(--ink)" stroke-width="1.5"/>`;
    }
    return s+'</svg>';
  }
  // light each bag in turn with its running total badge
  const skip=async(bags,n,from=0)=>{for(let i=0;i<bags.length;i++){bags[i].classList.add('lit');bags[i].dataset.c=from+(i+1)*n;sfx.pop();await sleep(520)}};
  const wrong=b=>{b.classList.remove('no');void b.offsetWidth;b.classList.add('no');sfx.oops();$('#msg').textContent='Try again!';say('Try again!')};
  const moreOr=(i,len,next)=>{if(i<len-1)onNext(next);else setOK()};

  RG.trick=el=>{
    const {g,n}=data.trick,known=g*n,ans=known+n;
    el.innerHTML=`<div class="prompt">Secret trick: start from a fact you know!</div>
      ${groupsH(g,n)}
      <div class="eq" id="teq">${g} × ${n} = ${known}</div><div class="msg" id="msg">${g} groups of ${n} is ${known}. You know that one!</div>
      <div class="row"><button class="btn red" id="add">Add a bag!</button><button class="btn alt" id="cnt" disabled>Count on</button></div>`;
    setPrompt(`${g} groups of ${n} is ${known}. You know that one! Tap Add a bag.`);
    $('#add').onclick=()=>{
      if($('#add').disabled)return;audio();$('#add').disabled=true;
      $('#gp').insertAdjacentHTML('beforeend',bagH(n,'gd','new'));sfx.hop();
      $('#teq').textContent=`${known} + ${n}`;$('#msg').textContent=`One more group of ${n}.`;
      say(`One more group of ${n}. Don’t count them all again! Start from ${known}. Tap Count on.`);$('#cnt').disabled=false;
    };
    $('#cnt').onclick=async()=>{
      if($('#cnt').disabled)return;$('#cnt').disabled=true;audio();
      const bags=$$('#gp .bag');say(`${known}... and ${n} more makes ${ans}!`);
      bags.slice(0,g).forEach(b=>b.classList.add('lit'));bags[g-1].dataset.c=known;sfx.pop();await sleep(1100);
      bags[g].classList.add('lit');bags[g].dataset.c=ans;sfx.pop();await sleep(700);
      $('#teq').textContent=`${g+1} × ${n} = ${ans}`;$('#msg').textContent=`${g+1} groups of ${n} is ${ans}!`;sfx.cheer();confetti();setOK();
    };
  };
  RG.read=el=>{
    const F=data.read.facts;
    el.innerHTML=`<div class="prompt">Tap 🔊 to hear a card. Say it too, then tick it!</div>
      <div class="cards">${F.map(([g,n],i)=>`<div class="rc" id="rc${i}">
        <button class="pic" data-i="${i}" aria-label="Hear ${g} groups of ${n}">${miniGroups(g,n)}<span class="sum">${g} × ${n} = <b>${g*n}</b></span></button>
        <div class="acts"><button class="hr" data-i="${i}" aria-label="Hear ${g} groups of ${n}">🔊</button><button class="tick" data-i="${i}" aria-label="Tick ${g} times ${n}">✓</button></div></div>`).join('')}</div>`;
    setPrompt('Tap the speaker to hear a card. Say it too, then tick it.');
    const heard=readTicks(el,F.length,'You read them all! Great reading!');
    $$('.pic,.hr',el).forEach(b=>b.onclick=()=>{audio();const i=+b.dataset.i,[g,n]=F[i];sfx.pop();say(`${g} groups of ${n} is ${g*n}`);heard(i)});
  };
  RG.same=el=>{
    const Q=data.same.questions;let q=0;
    const draw=()=>{
      const [a,b,ch]=Q[q],p=a*b;
      el.innerHTML=`<div class="prompt">Turn it around. Is it the same?</div>
        <div class="pair2"><div class="side">${arrH(a,b,'red')}<div class="cap">${a} × ${b} = ${p}</div></div>
          <div class="side">${arrH(b,a,'or')}<div class="cap" id="cap">${b} × ${a} = <span class="q"></span></div></div></div>
        <div class="choices">${ch.map(c=>`<button class="ch" data-v="${c}">${c}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt(`${a} rows of ${b} is ${p}. Turn it around. What is ${b} rows of ${a}?`);
      $$('.ch',el).forEach(c=>c.onclick=()=>{
        audio();
        if(+c.dataset.v!==p)return wrong(c);
        c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);sfx.ding();
        $('#cap').textContent=`${b} × ${a} = ${p}`;$('#msg').textContent=`Same dots, turned around! ${a} × ${b} = ${b} × ${a}`;
        say(`Yes! Same dots, turned around. ${b} rows of ${a} is ${p} too!`);
        moreOr(q,Q.length,()=>{q++;draw()});
      });
    };
    draw();
  };
  RG.howmany=el=>{
    const Q=data.howmany.questions;let q=0;
    const draw=()=>{
      const [g,n,ch]=Q[q],p=g*n;
      el.innerHTML=`<div class="prompt">How many dots altogether?</div>${groupsH(g,n)}
        <div class="eq" id="eq">${g} × ${n} = <span class="q"></span></div>
        <div class="choices">${ch.map(c=>`<button class="ch" data-v="${c}">${c}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      setPrompt(`${NUMW[g]} groups of ${NUMW[n]}. How many altogether?`);
      $$('.ch',el).forEach(c=>c.onclick=async()=>{
        audio();
        if(+c.dataset.v!==p)return wrong(c);
        c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);
        say(seq(g,n).join(', ')+'!');await skip($$('#gp .bag'),n);
        sfx.ding();$('#eq').textContent=`${g} × ${n} = ${p}`;$('#msg').textContent=`${g} groups of ${n} is ${p}!`;
        moreOr(q,Q.length,()=>{q++;draw()});
      });
    };
    draw();
  };
  RG.missing=el=>{
    const Q=data.missing.questions;let q=0;
    const draw=()=>{
      const [g,n,hide,ch]=Q[q],p=g*n,right=hide==='g'?g:n;
      const ask=hide==='g'?`How many groups of ${n} make ${p}?`:`Share ${p} into ${g} groups. How many in each?`;
      el.innerHTML=`<div class="prompt">Power-up: ${ask}</div>
        <div class="gp" id="gp">${hide==='g'?bagH(n,'gd'):''}</div><div class="goal">${hide==='g'?'Make':'Share'} ${p}</div>
        <div class="eq" id="eq">${hide==='g'?`<span class="q"></span> × ${n}`:`${g} × <span class="q"></span>`} = ${p}</div>
        <div class="choices">${ch.map(c=>`<button class="ch" data-v="${c}">${c}</button>`).join('')}</div>
        <div class="msg" id="msg"></div><div class="row" id="act"></div>`;
      if(hide==='n')$('#gp').outerHTML=emptyH(g);
      setPrompt(hide==='g'?`How many groups of ${n} make ${p}? Count by ${n}s until you reach ${p}.`:`Share ${p} dots into ${g} groups, the same in each. How many in each group?`);
      $$('.ch',el).forEach(c=>c.onclick=async()=>{
        audio();
        if(+c.dataset.v!==right)return wrong(c);
        c.classList.add('right');$$('.ch',el).forEach(x=>x.disabled=true);
        $('#gp').outerHTML=groupsH(g,n,hide==='g'?'gd':'red');$$('#gp .bag').forEach(b=>b.classList.add('new'));
        say(seq(g,n).join(', ')+'!');await skip($$('#gp .bag'),n);
        sfx.ding();$('#eq').textContent=`${g} × ${n} = ${p}`;$('#msg').textContent=`${g} groups of ${n} is ${p}!`;
        moreOr(q,Q.length,()=>{q++;draw()});
      });
    };
    draw();
  };
  RG.memory=el=>{
    const cards=shuffle(data.memory.facts.flatMap(([g,n],p)=>[{p,g,n,fact:1},{p,g,n,fact:0}]));let open=[],matched=new Set(),lock=false;
    el.innerHTML=`<div class="prompt">Game: match each groups card to its answer!</div>
      <div class="mem gx" id="mem">${cards.map((c,i)=>`<button class="mc ${c.fact?'fx':''}" data-i="${i}" data-p="${c.p}" aria-label="Card ${i+1}"><span class="back">?</span><span class="front">${c.fact
        ?`<b>${c.g} × ${c.n}</b><i>${Array(c.g).fill('●'.repeat(c.n)).join(' ')}</i>`:`<b>${c.g*c.n}</b>`}</span></button>`).join('')}</div>
      <div class="msg" id="msg">Tap a card to flip it.</div>`;
    setPrompt('Game: match each groups card to its answer. Tap a card to flip it.');
    const els=$$('.mc',el);
    els.forEach(b=>b.onclick=async()=>{
      const i=+b.dataset.i;if(lock||open.includes(i)||matched.has(i))return;
      const c=cards[i];audio();b.classList.add('up');sfx.pop();say(c.fact?`${c.g} groups of ${c.n}`:`${c.g*c.n}`);open.push(i);
      if(open.length===2){
        lock=true;const [x,y]=open,A=cards[x],B=cards[y];await sleep(950);
        if(A.p===B.p){
          matched.add(x);matched.add(y);els[x].classList.add('ok');els[y].classList.add('ok');sfx.ding();
          $('#msg').textContent=`${A.g} × ${A.n} = ${A.g*A.n}!`;say(`${A.g} groups of ${A.n} is ${A.g*A.n}!`);
        }else{
          els[x].classList.remove('up');els[y].classList.remove('up');sfx.oops();$('#msg').textContent='Not a match. Try again!';say('Not a match. Try again!');
        }
        open=[];lock=false;
        if(matched.size===cards.length){await sleep(900);sfx.cheer();confetti();say('You matched them all! Brilliant!');setOK()}
      }
    });
  };
  RG.balloon=el=>{
    const Rn=data.balloon.rounds;let r=0;
    const colors=['#d6402b','#e8890c','#2f9e44','#5b4bc4','#0c8599','#c2255c'];
    const draw=()=>{
      const [g,n]=Rn[r],ans=g*n,opts=shuffle([...new Set([ans,ans-n,ans+n,ans+1,ans+2])].slice(0,4));
      el.innerHTML=`<div class="stars" id="stars" aria-label="${r} of ${Rn.length} popped">${Rn.map((_,i)=>i<r?'⭐':'☆').join('')}</div>
        <div class="prompt">Game: pop the balloon. <b>${g} × ${n}</b> = ?</div>
        <div class="balloons">${opts.map((o,k)=>`<button class="bln" data-v="${o}" style="--col:${colors[(k+r)%6]};animation-delay:${k*.45}s">${o}</button>`).join('')}</div>
        <div class="msg" id="msg"></div>
        <div class="row"><button class="btn alt" id="hint">💡 Hint</button></div><div class="hintbox" id="hb"></div>`;
      setPrompt(`Pop the balloon. ${g} groups of ${n}. How many?`);
      $('#hint').onclick=()=>{audio();$('#hb').innerHTML=miniGroups(g,n);say(`Here are ${g} groups of ${n}. Count by ${n}s: ${seq(g,n).join(', ')}.`)};
      $$('.bln',el).forEach(bl=>bl.onclick=async()=>{
        audio();
        if(+bl.dataset.v!==ans)return wrong(bl);
        $$('.bln',el).forEach(x=>x.disabled=true);bl.classList.add('pop');sfx.pop();sfx.ding();
        $('#msg').textContent=`${g} × ${n} = ${ans}!`;say(`${g} groups of ${n} is ${ans}!`);
        await sleep(1700);r++;
        if(r<Rn.length)draw();else{$('#stars').textContent='⭐'.repeat(Rn.length);sfx.cheer();confetti();say('You popped them all!');setOK()}
      });
    };
    draw();
  };

  return {id:data.id,subject:'maths',title:data.title,
    steps:['intro','trick','read','same','howmany','missing','memory','balloon','end'],games:[6,7],
    R:RG,intro:data.intro,end:data.end};
}
