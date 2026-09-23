const C=document.querySelector('#scope'),g=C.getContext('2d'),play=document.querySelector('#play'),preset=document.querySelector('#preset'),rate=document.querySelector('#rate'),depth=document.querySelector('#depth'),seed=document.querySelector('#seed');
let ac,master,split,anL,anR,playing=false,nodes=[],rng=Math.random;
function randomSeed(){let s=(Date.now()^Math.random()*2**31)|0;rng=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function stop(){nodes.forEach(n=>{try{n.stop()}catch(e){}try{n.disconnect()}catch(e){}});nodes=[]}
function osc(type,f,pan=0,gain=.12){let o=ac.createOscillator(),v=ac.createGain(),p=ac.createStereoPanner();o.type=type;o.frequency.value=f;v.gain.value=gain;p.pan.value=pan;o.connect(v).connect(p).connect(master);o.start();nodes.push(o,v,p);return{o,v,p}}
function build(){stop();let r=+rate.value,d=+depth.value,P=preset.value;
let root=55*Math.pow(2,Math.floor(rng()*5)/12);
if(P==='ORBIT'){let a=osc('sine',root*2,-.8,.18),b=osc('sine',root*3.01,.8,.18);a.o.detune.value=-9*d;b.o.detune.value=11*d}
if(P==='LISSAJOUS'){osc('sine',root*3,-1,.2);osc('sine',root*4,.95,.2)}
if(P==='DRONE'){[1,1.5,2.01,2.5].forEach((q,i)=>osc(i%2?'triangle':'sine',root*q,(i/3)*2-1,.07+d*.03))}
if(P==='PULSE'){let a=osc('square',root*2,-.9,.07),b=osc('sine',root*2.5,.9,.12);let l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=.4+r*3;lg.gain.value=.06*d;l.connect(lg).connect(a.v.gain);l.start();nodes.push(l,lg)}
if(P==='DUST'){for(let i=0;i<7;i++)osc('sine',root*(1+rng()*7),rng()*2-1,.025+d*.012)}
if(P==='PHASE'){for(let i=0;i<3;i++){let a=osc('sine',root*(i+2),-1+i,.08);a.o.detune.value=(rng()-.5)*35*d}}
}
function init(){ac=new AudioContext();master=ac.createGain();master.gain.value=.55;split=ac.createChannelSplitter(2);anL=ac.createAnalyser();anR=ac.createAnalyser();anL.fftSize=anR.fftSize=2048;master.connect(ac.destination);master.connect(split);split.connect(anL,0);split.connect(anR,1);randomSeed();build()}
play.onclick=async()=>{if(!ac)init();await ac.resume();playing=!playing;master.gain.setTargetAtTime(playing?.55:0,ac.currentTime,.02);play.textContent=playing?'STOP':'PLAY'};
preset.onchange=()=>ac&&build();rate.oninput=()=>ac&&build();depth.oninput=()=>ac&&build();seed.onclick=()=>{randomSeed();if(ac)build()};
function draw(){requestAnimationFrame(draw);let d=devicePixelRatio||1,w=C.clientWidth,h=C.clientHeight;if(C.width!==w*d||C.height!==h*d){C.width=w*d;C.height=h*d}g.setTransform(d,0,0,d,0,0);g.fillStyle='#0a0c0a';g.fillRect(0,0,w,h);g.strokeStyle='#263026';g.lineWidth=1;g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();if(!anL)return;let L=new Float32Array(anL.fftSize),R=new Float32Array(anR.fftSize);anL.getFloatTimeDomainData(L);anR.getFloatTimeDomainData(R);g.strokeStyle='#b7c8b1';g.lineWidth=1.25;g.beginPath();for(let i=0;i<L.length;i++){let x=w/2+L[i]*w*.43,y=h/2-R[i]*h*.43;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}draw();