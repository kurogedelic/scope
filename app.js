const C=document.querySelector('#scope'),g=C.getContext('2d'),play=document.querySelector('#play'),preset=document.querySelector('#preset'),rate=document.querySelector('#rate'),depth=document.querySelector('#depth'),seed=document.querySelector('#seed');
let ac,master,split,anL,anR,playing=false,src,rng=Math.random,phase=0;
function randomSeed(){let s=(Date.now()^Math.random()*2**31)|0;rng=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shape(P,t,d,r){let a=t*2*Math.PI,x=0,y=0;
if(P==='ROSETTE'){let k=3+Math.floor(r*2),q=.55+.35*Math.sin(k*a);x=q*Math.cos(a);y=q*Math.sin(a)}
else if(P==='KNOT'){x=.68*Math.sin(3*a)+.22*Math.sin(7*a);y=.68*Math.sin(2*a+.7)+.2*Math.sin(5*a)}
else if(P==='SPIRAL'){let u=(t%1),rr=.08+.82*u;x=rr*Math.cos(a*(4+3*d));y=rr*Math.sin(a*(4+3*d))}
else if(P==='BUTTERFLY'){let q=.42+.25*Math.sin(2*a)+.12*Math.sin(6*a);x=q*Math.sin(a)*1.35;y=q*Math.cos(a)}
else if(P==='GEAR'){let q=.58+.16*Math.cos((6+Math.floor(d*6))*a);x=q*Math.cos(a);y=q*Math.sin(a)}
else if(P==='ORBIT'){x=.62*Math.sin(2*a)+.25*Math.sin(5*a+.4);y=.62*Math.cos(3*a)+.2*Math.sin(4*a)}
else if(P==='WEAVE'){x=.7*Math.sin(3*a)+.16*Math.sin(11*a);y=.7*Math.sin(4*a+.4)+.16*Math.sin(9*a)}
else if(P==='CHAOS'){x=.55*Math.sin(3*a+1.3*Math.sin(5*a))+d*.2*Math.sin(13*a);y=.55*Math.sin(4*a+1.1*Math.sin(2*a))+d*.2*Math.cos(11*a)}
else {x=.65*Math.sin(a)+.18*Math.sin(5*a);y=.65*Math.sin(a+.35)+.18*Math.sin(7*a)}
return[Math.max(-.95,Math.min(.95,x)),Math.max(-.95,Math.min(.95,y))]}
function build(){if(!ac)return;if(src)try{src.disconnect()}catch(e){};let P=preset.value,d=+depth.value,r=+rate.value;let node=ac.createScriptProcessor(1024,0,2),sr=ac.sampleRate;node.onaudioprocess=e=>{let L=e.outputBuffer.getChannelData(0),R=e.outputBuffer.getChannelData(1);for(let i=0;i<L.length;i++){let f=38+r*70;phase=(phase+f/sr)%1;let [x,y]=shape(P,phase,d,r);let trem=.72+.2*Math.sin(phase*Math.PI*2*(.25+d));L[i]=x*.42*trem;R[i]=y*.42*trem}};node.connect(master);src=node}
function init(){ac=new AudioContext();master=ac.createGain();master.gain.value=.55;split=ac.createChannelSplitter(2);anL=ac.createAnalyser();anR=ac.createAnalyser();anL.fftSize=anR.fftSize=4096;master.connect(ac.destination);master.connect(split);split.connect(anL,0);split.connect(anR,1);randomSeed();build()}
play.onclick=async()=>{if(!ac)init();await ac.resume();playing=!playing;master.gain.setTargetAtTime(playing?.55:0,ac.currentTime,.02);play.textContent=playing?'STOP':'PLAY'};preset.onchange=()=>build();rate.oninput=()=>{};depth.oninput=()=>{};seed.onclick=()=>{randomSeed();phase=rng();build()};
function draw(){requestAnimationFrame(draw);let d=devicePixelRatio||1,w=C.clientWidth,h=C.clientHeight;if(C.width!==w*d||C.height!==h*d){C.width=w*d;C.height=h*d}g.setTransform(d,0,0,d,0,0);g.fillStyle='#0a0c0a';g.fillRect(0,0,w,h);g.strokeStyle='#202720';g.lineWidth=1;g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();if(!anL)return;let L=new Float32Array(anL.fftSize),R=new Float32Array(anR.fftSize);anL.getFloatTimeDomainData(L);anR.getFloatTimeDomainData(R);g.strokeStyle='#b7c8b1';g.lineWidth=1.15;g.beginPath();for(let i=0;i<L.length;i++){let x=w/2+L[i]*w*.72,y=h/2-R[i]*h*.72;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}draw();