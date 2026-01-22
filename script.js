// Personalize easily here
const CONFIG = {
  herName: "Norah", // change to her name, e.g., "Ava"
  city: "London",       // where you first met
  // If you know the exact date you started dating, set as YYYY-MM-DD (e.g. "2025-12-20").
  // Leave blank to auto-approximate ~30 days ago.
  startDate: "28/12/2025",
  question: "Will you be my Valentine?",
  subtitle: "I checked the forecast: 100% chance of us being adorable. 🐻💘",
};

// List your gallery images here (put files into assets/images and add their filenames)
// Example: 'assets/images/us-at-the-park.jpg'
const galleryImages = [
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.33.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.34 (1).jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.34.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.35.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.36.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.38.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.40.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.41.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.42.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.44.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.49.jpeg',
  'assets/images/WhatsApp Image 2026-01-23 at 02.21.50.jpeg',
];

// Optionally add captions: { src: 'assets/images/..', caption: 'cutie pie' }
const galleryItems = galleryImages.map(src => ({ src, caption: '' }));

// Helpers
function $(sel, parent=document){ return parent.querySelector(sel); }
function createEl(tag, props={}){ const el = document.createElement(tag); Object.assign(el, props); return el; }

// Setup text
(function initText(){
  const title = $(".title");
  const subtitle = $(".subtitle");
  if(title) title.textContent = CONFIG.question;
  if(subtitle) subtitle.textContent = CONFIG.subtitle;

  // London banner personalization
  const londonTitle = $(".london-title");
  if(londonTitle && CONFIG.city){
    londonTitle.textContent = `It all began in ${CONFIG.city} 🇬🇧`;
  }
  // Storybook city labels
  document.querySelectorAll('.page .city').forEach(el=>{
    if(CONFIG.city) el.textContent = CONFIG.city;
  });
})();

// Mini-map train animation through our stops
(function miniMap(){
  const map = document.getElementById('miniMap');
  if(!map) return;
  const rail = map.querySelector('.map-rail');
  const train = document.getElementById('tubeTrain');
  const progress = document.getElementById('mapProgress');
  const pins = Array.from(map.querySelectorAll('.pin'));
  if(!rail || !train || !progress || !pins.length) return;
  const explore = document.getElementById('explorePrompt');
  const exploreClose = document.getElementById('exploreClose');

  let stops = [];
  let playing = false;
  let rafId = null;

  function layout(){
    const rr = rail.getBoundingClientRect();
    const mr = map.getBoundingClientRect();
    stops = pins.map(p=>({ el:p, x: p.getBoundingClientRect().left + p.offsetWidth/2 }));
    stops.sort((a,b)=> a.x - b.x);
    // Convert absolute x to relative within rail
    stops = stops.map(s=> ({ el: s.el, x: s.x - rr.left }));
    // Place train at start
    train.style.left = (rr.left - mr.left + 0) + 'px';
    train.style.transform = 'translate(-50%,-50%)';
    progress.style.width = '0px';
  }

  function burstAt(el){
    const wrap = document.createElement('div');
    wrap.className = 'burst';
    map.appendChild(wrap);
    const pr = el.getBoundingClientRect();
    const mr = map.getBoundingClientRect();
    wrap.style.left = (pr.left - mr.left + pr.width/2) + 'px';
    for(let i=0;i<10;i++){
      const p = document.createElement('i');
      p.className = 'piece';
      p.style.background = ['#ff4f8b','#ff87b7','#ffa6c9','#ffd6e6'][i%4];
      const ang = Math.random()*Math.PI*2; const r = 24 + Math.random()*26;
      p.style.setProperty('--dx', Math.cos(ang)*r + 'px');
      p.style.setProperty('--dy', Math.sin(ang)*r + 'px');
      p.style.left = '0px'; p.style.top = '0px';
      wrap.appendChild(p);
      setTimeout(()=> p.remove(), 650);
    }
    setTimeout(()=> wrap.remove(), 700);
  }

  function ease(t){ return 1 - Math.pow(1-t, 3); }

  async function moveTo(targetX){
    return new Promise(resolve=>{
      const rr = rail.getBoundingClientRect();
      const mr = map.getBoundingClientRect();
      const startLeft = parseFloat(progress.style.width) || 0;
      const endLeft = Math.max(0, Math.min(targetX, rr.width));
      const dist = Math.abs(endLeft - startLeft);
      // slower train: larger base duration and factor
      const dur = Math.max(900, Math.min(2800, dist*7));
      const t0 = performance.now();
      cancelAnimationFrame(rafId);
      function step(now){
        const t = Math.min(1, (now - t0)/dur);
        const e = ease(t);
        const x = startLeft + (endLeft - startLeft)*e;
        progress.style.width = x + 'px';
        train.style.left = (rail.getBoundingClientRect().left - mr.left + x) + 'px';
        if(t < 1){ rafId = requestAnimationFrame(step); }
        else resolve();
      }
      rafId = requestAnimationFrame(step);
    });
  }

  async function play(){
    if(playing) return; playing = true;
    train.classList.add('bob');
    pins.forEach(p=> p.classList.remove('hit'));
    layout();
    for(const s of stops){
      await moveTo(s.x);
      s.el.classList.add('hit');
      burstAt(s.el);
    }
    playing = false;
    train.classList.remove('bob');
    if(explore){
      explore.style.display = 'flex';
      explore.setAttribute('aria-hidden','false');
    }
  }

  // Autoplay when section comes into view
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ play(); }
    });
  }, {threshold: 0.4});
  io.observe(map);

  // Resize handling
  addEventListener('resize', ()=>{ if(!playing){ layout(); } });

  // Tap to replay
  map.addEventListener('click', ()=>{ if(!playing) play(); });

  // Explore close
  exploreClose?.addEventListener('click', ()=>{
    if(!explore) return;
    explore.style.display = 'none';
    explore.setAttribute('aria-hidden','true');
  });
})();

// Background music toggle with fade in/out
(function music(){
  const btn = document.getElementById('musicToggle');
  if(!btn) return;
  const src = btn.getAttribute('data-src') || 'assets/music/theme.mp3';
  const audio = new Audio(src);
  audio.loop = true; audio.volume = 0;
  let playing = false; let fadeId=null;

  function fade(to){
    cancelAnimationFrame(fadeId);
    fadeId = requestAnimationFrame(function step(){
      const diff = to - audio.volume;
      const delta = Math.sign(diff) * 0.02;
      if(Math.abs(diff) <= 0.02){ audio.volume = to; return; }
      audio.volume = Math.max(0, Math.min(1, audio.volume + delta));
      fadeId = requestAnimationFrame(step);
    });
  }

  async function toggle(){
    try{
      if(!playing){ await audio.play(); fade(0.6); btn.classList.add('active'); btn.title='Pause music'; playing=true; }
      else { fade(0); setTimeout(()=> audio.pause(), 400); btn.classList.remove('active'); btn.title='Play music'; playing=false; }
    }catch(err){
      console.warn('Audio not available', err);
      // show quick feedback
      btn.classList.add('active'); setTimeout(()=> btn.classList.remove('active'), 400);
    }
  }
  btn.addEventListener('click', toggle);

  // Attempt to resume audio context on first user gesture anywhere
  ['pointerdown','touchstart','keydown'].forEach(ev=>{
    window.addEventListener(ev, ()=>{
      if(audio.src && audio.readyState === 0){ audio.load(); }
    }, {once:true, passive:true});
  });
})();

// Gate mini‑game: catch hearts to unlock the site
(function gateGame(){
  const gate = document.getElementById('gate');
  const canvas = document.getElementById('gateCanvas');
  const startBtn = document.getElementById('gateStart');
  const statusEl = document.getElementById('gateStatus');
  const intro = document.getElementById('gateIntro');
  const introOk = document.getElementById('introOk');
  const introAvatar = document.getElementById('introAvatar');
  const songPrompt = document.getElementById('songPrompt');
  const songYes = document.getElementById('songYes');
  const songDefYes = document.getElementById('songDefYes');
  if(!gate || !canvas || !startBtn) return;

  document.body.classList.add('gated');
  const ctx = canvas.getContext('2d');
  function resize(){
    const r = gate.querySelector('.gate-card').getBoundingClientRect();
    const w = Math.min(1000, r.width - 32);
    const h = Math.max(360, Math.min(560, Math.round(w*0.58)));
    canvas.width = w; canvas.height = h;
  }
  addEventListener('resize', resize); resize();

  // Intro: set avatar to first gallery image if present
  if(introAvatar && galleryImages && galleryImages.length){ introAvatar.src = galleryImages[0]; }
  // Disable Start until rules acknowledged
  if(intro && introOk){
    startBtn.disabled = true;
    introOk.addEventListener('click', ()=>{
      intro.style.transform = 'translateY(110%)';
      intro.style.transition = 'transform .35s ease';
      setTimeout(()=>{ intro.style.display='none'; startBtn.disabled = false; }, 360);
    });
  }

  // Game state
  let running=false, animId=null;
  let taxi={x:canvas.width*0.15, y:canvas.height*0.75, a:0, vx:0, vy:0};
  let hearts=[]; // collectibles
  let pigeons=[]; // moving obstacles
  let score=0, target=7, time=30, tLeft=time;
  const maxSpeed=3.2, accel=0.18, drag=0.96;
  const keys={ArrowUp:false,ArrowDown:false,ArrowLeft:false,ArrowRight:false};

  function rnd(min,max){ return Math.random()*(max-min)+min; }
  function placeHearts(){
    const mobile = window.innerWidth < 700;
    const count = mobile ? 8 : 12;
    hearts = Array.from({length:count}, ()=>({x:rnd(60,canvas.width-60), y:rnd(60,canvas.height-100), r: mobile? 11: 12, got:false}));
    // Adjust target for mobile (less congested)
    target = mobile ? 5 : 7;
  }
  function placePigeons(){
    const mobile = window.innerWidth < 700;
    const count = mobile ? 2 : 4;
    pigeons = Array.from({length:count}, ()=>({x:rnd(40,canvas.width-40), y:rnd(40,canvas.height-120), r: mobile? 12:14, vx:rnd(-1.0,1.0), vy:rnd(-0.9,0.9)}));
  }

  function drawHeart(cx,cy,size){
    // nice bezier heart similar to celebration icon for consistent look
    const s = size;
    ctx.save(); ctx.translate(cx,cy);
    ctx.fillStyle = '#ff6fa4';
    ctx.beginPath();
    ctx.moveTo(0, 0.3*s);
    ctx.bezierCurveTo(-0.5*s, -0.2*s, -0.5*s, -0.8*s, 0, -0.5*s);
    ctx.bezierCurveTo(0.5*s, -0.8*s, 0.5*s, -0.2*s, 0, 0.3*s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawTaxi(){
    ctx.save(); ctx.translate(taxi.x,taxi.y); ctx.rotate(taxi.a);
    // body
    ctx.fillStyle = '#ffd84d'; ctx.strokeStyle='#333'; ctx.lineWidth=2;
    ctx.fillRect(-14,-9,28,18); ctx.strokeRect(-14,-9,28,18);
    // roof sign
    ctx.fillStyle='#fff'; ctx.fillRect(-6,-12,12,6); ctx.strokeRect(-6,-12,12,6);
    // wheels
    ctx.fillStyle='#333'; ctx.fillRect(-16,-8,4,16); ctx.fillRect(12,-8,4,16);
    // center marker (aim point)
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0,0,2,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawPigeon(p){
    ctx.save(); ctx.translate(p.x,p.y);
    ctx.fillStyle='#7a7a7a'; ctx.beginPath(); ctx.ellipse(0,0, p.r, p.r*0.7, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(4,-2,2,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function update(){
    // controls
    if(keys.ArrowUp) { taxi.vx += Math.cos(taxi.a)*accel; taxi.vy += Math.sin(taxi.a)*accel; }
    if(keys.ArrowDown){ taxi.vx -= Math.cos(taxi.a)*accel*0.9; taxi.vy -= Math.sin(taxi.a)*accel*0.9; }
    if(keys.ArrowLeft) taxi.a -= 0.06;
    if(keys.ArrowRight) taxi.a += 0.06;
    // drag and clamp
    taxi.vx *= drag; taxi.vy *= drag;
    const sp = Math.hypot(taxi.vx,taxi.vy);
    if(sp > maxSpeed){ taxi.vx = taxi.vx/sp*maxSpeed; taxi.vy = taxi.vy/sp*maxSpeed; }
    taxi.x += taxi.vx; taxi.y += taxi.vy;
    // bounds bounce
    if(taxi.x<18||taxi.x>canvas.width-18){ taxi.vx*=-0.6; taxi.x = Math.max(18, Math.min(canvas.width-18,taxi.x)); }
    if(taxi.y<18||taxi.y>canvas.height-18){ taxi.vy*=-0.6; taxi.y = Math.max(18, Math.min(canvas.height-18,taxi.y)); }

    // pigeons move
    pigeons.forEach(p=>{ p.x += p.vx; p.y += p.vy; if(p.x<p.r||p.x>canvas.width-p.r) p.vx*=-1; if(p.y<p.r||p.y>canvas.height-p.r) p.vy*=-1; });
    // collisions with pigeons -> slow + cheeky status
    pigeons.forEach(p=>{ const d=Math.hypot(p.x-taxi.x,p.y-taxi.y); if(d < p.r+12){ taxi.vx*=-0.4; taxi.vy*=-0.4; statusEl.textContent = 'Honk! Silly pigeon! 🐦'; }});

    // collect hearts
    hearts.forEach(h=>{ if(!h.got && Math.hypot(h.x-taxi.x,h.y-taxi.y) < h.r+14){ h.got=true; score++; }});
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // background roads (simple)
    ctx.strokeStyle='#e9c0d2'; ctx.lineWidth=18; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(40,canvas.height*0.2); ctx.lineTo(canvas.width-40,canvas.height*0.2);
    ctx.moveTo(60,canvas.height*0.6); ctx.lineTo(canvas.width-60,canvas.height*0.85);
    ctx.moveTo(canvas.width*0.3,30); ctx.lineTo(canvas.width*0.7,canvas.height-30);
    ctx.stroke();

    // draw hearts and pigeons
    hearts.forEach(h=>{ if(!h.got) drawHeart(h.x,h.y,h.r*2.2); });
    pigeons.forEach(drawPigeon);
    drawTaxi();

    // HUD
    statusEl.textContent = `Hearts: ${score}/${target}  •  Time: ${Math.ceil(tLeft)}s`;
  }

  function loop(){
    tLeft -= 1/60; if(tLeft<0) tLeft=0;
    update(); render();
    if(score>=target){ unlock(); return; }
    if(tLeft<=0){ end(); return; }
    animId = requestAnimationFrame(loop);
  }

  function start(){
    score=0; tLeft=time; taxi={x:canvas.width*0.15, y:canvas.height*0.75, a:0, vx:0, vy:0};
    placeHearts(); placePigeons();
    cancelAnimationFrame(animId); animId = requestAnimationFrame(loop);
  }
  function end(){ cancelAnimationFrame(animId); statusEl.textContent = 'Out of time! One more try?'; }
  function unlock(){
    cancelAnimationFrame(animId);
    // Hide the game canvas/UI and show the song prompt modal
    if(songPrompt){
      songPrompt.style.display = 'flex';
      songPrompt.setAttribute('aria-hidden','false');
      // Hook up buttons once
      const onChoose = async ()=>{
        try{
          // Start music via the existing toggle button (ensures correct source)
          const btn = document.getElementById('musicToggle');
          if(btn && !btn.classList.contains('active')){ btn.click(); }
        }catch(e){ /* ignore */ }
        // Hide prompt and reveal the hero
        songPrompt.style.display = 'none';
        songPrompt.setAttribute('aria-hidden','true');
        gate.style.display='none';
        document.body.classList.remove('gated');
        // Ensure hero is in view
        const hero = document.getElementById('hero');
        hero?.scrollIntoView({behavior:'smooth', block:'start'});
      };
      songYes?.addEventListener('click', onChoose, {once:true});
      songDefYes?.addEventListener('click', onChoose, {once:true});
    } else {
      // Fallback: just close gate
      gate.style.display='none';
      document.body.classList.remove('gated');
    }
  }

  // input
  addEventListener('keydown', e=>{ if(e.key in keys){ keys[e.key]=true; }});
  addEventListener('keyup', e=>{ if(e.key in keys){ keys[e.key]=false; }});
  // touch: drag to steer toward pointer
  let touch=false;
  canvas.addEventListener('touchstart', (e)=>{ touch=true; }, {passive:true});
  canvas.addEventListener('touchend', ()=>{ touch=false; }, {passive:true});
  canvas.addEventListener('touchmove', (e)=>{
    const rect = canvas.getBoundingClientRect();
    const tx = e.touches[0].clientX - rect.left;
    const ty = e.touches[0].clientY - rect.top;
    const ang = Math.atan2(ty - taxi.y, tx - taxi.x);
    taxi.a = ang; taxi.vx += Math.cos(ang)*accel*0.8; taxi.vy += Math.sin(ang)*accel*0.8;
  }, {passive:true});

  startBtn.addEventListener('click', start);
})();

// Heart-Path Carousel
(function heartPathCarousel(){
  const wrap = document.getElementById('photoCarousel');
  const track = document.getElementById('carouselTrack');
  if(!wrap || !track) return;
  const prevBtn = document.getElementById('carPrev');
  const nextBtn = document.getElementById('carNext');

  // Build DOM
  const items = (galleryItems.length ? galleryItems : galleryImages.map(src=>({src, caption:''})));
  const els = items.map((it, idx)=>{
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.setAttribute('role','option');
    item.setAttribute('tabindex','-1');
    item.dataset.index = String(idx);
    item.innerHTML = `<div class="glow"></div><div class="car-polaroid"><div class="img"><img src="${it.src}" alt="photo ${idx+1}"></div><div class="cap">${it.caption||''}</div></div>`;
    track.appendChild(item);
    return item;
  });

  // Geometry
  const stage = wrap.querySelector('.carousel-stage');
  const TAU = Math.PI*2;
  function heart(t){
    const x = 16*Math.pow(Math.sin(t),3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return {x,y};
  }
  function layoutVals(){
    const rect = stage.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const scaleX = w/34, scaleY = h/34; // slightly larger heart for more airy spacing
    const cx = w*0.5, cy = h*0.52;
    return {w,h,scaleX,scaleY,cx,cy};
  }

  let offset = 0; // scroll position in [0,1)
  let focusIdx = 0;
  let rafId=null;

  function render(){
    const {w,h,scaleX,scaleY,cx,cy} = layoutVals();
    const N = els.length;
    for(let i=0;i<N;i++){
      const t = ((i/N)+offset) % 1; // along path
      const param = t*TAU;
      const {x,y} = heart(param);
      const px = cx + x*scaleX;
      const py = cy - y*scaleY;
      // derivative for normal (approx)
      const {x: x2, y: y2} = heart(param+0.01);
      const dx = x2-x, dy = y2-y;
      const nx = -dy, ny = dx; // normal
      const len = Math.hypot(nx, ny) || 1;
      const unx = nx/len, uny = ny/len;

      // distance to focus parameter (center = 0.5 around top)
      const dist = Math.min(Math.abs(t-0.25), 1-Math.abs(t-0.25));
      const isFocus = i === focusIdx;
      const scale = isFocus ? 1.5 : 1 + (0.12 * Math.max(0, 0.4 - dist)/0.4);
      const lift = isFocus ? 26 : 10 * Math.max(0, 0.4 - dist)/0.4;

      const el = els[i];
      el.style.transform = `translate(${px + unx*lift}px, ${py + uny*lift}px) translate(-50%,-50%) scale(${scale})`;
      el.classList.toggle('focus', isFocus);
      el.classList.toggle('far', dist>0.35);
      if(isFocus) el.setAttribute('aria-selected','true'); else el.removeAttribute('aria-selected');
    }
    rafId = null;
  }

  function schedule(){ if(!rafId) rafId = requestAnimationFrame(render); }

  // Hover / move focus by nearest item to mouse
  stage.addEventListener('mousemove', (e)=>{
    const rect = stage.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best=-1, bestD=1e9;
    els.forEach((el,i)=>{
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      if(d<bestD){bestD=d; best=i;}
    });
    if(best>=0){ focusIdx = best; schedule(); }
  });

  // Drag/scroll to shift offset
  let dragging=false, sx=0, so=0;
  stage.addEventListener('pointerdown', (e)=>{ dragging=true; sx=e.clientX; so=offset; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', (e)=>{ if(!dragging) return; const dx=e.clientX-sx; offset = (so - dx/600) % 1; if(offset<0) offset+=1; schedule(); });
  stage.addEventListener('pointerup', (e)=>{ dragging=false; stage.releasePointerCapture(e.pointerId); });
  stage.addEventListener('pointercancel', ()=> dragging=false);
  stage.addEventListener('wheel', (e)=>{ e.preventDefault(); offset = (offset + (e.deltaY>0?0.02:-0.02)) % 1; if(offset<0) offset+=1; schedule(); }, {passive:false});

  // Keyboard
  function step(dir){ focusIdx = (focusIdx + dir + els.length) % els.length; // also nudge offset towards focus
    offset = (focusIdx/els.length); schedule(); }
  prevBtn.addEventListener('click', ()=> step(-1));
  nextBtn.addEventListener('click', ()=> step(1));
  wrap.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft') step(-1); if(e.key==='ArrowRight') step(1); });

  // Lightbox wiring
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  let lbIdx = 0;

  function openLb(idx){
    lbIdx = (idx+els.length)%els.length;
    const img = items[lbIdx];
    lbImg.src = img.src;
    // auto caption from filename if none provided
    const autoCap = img.src.split('/').pop().replace(/\.[^.]+$/, '').replace(/[\-_]+/g,' ');
    lbCap.textContent = img.caption && img.caption.trim() ? img.caption : autoCap;
    lb.setAttribute('aria-hidden','false');
  }
  function closeLb(){ lb.setAttribute('aria-hidden','true'); }
  function lbStep(dir){ openLb(lbIdx + dir); }

  els.forEach((el,i)=>{
    el.addEventListener('click', ()=> openLb(i));
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openLb(i);} });
  });
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', ()=> lbStep(-1));
  lbNext.addEventListener('click', ()=> lbStep(1));
  lb.addEventListener('click', (e)=>{ if(e.target===lb) closeLb(); });
  window.addEventListener('keydown', (e)=>{ if(lb.getAttribute('aria-hidden')==='false'){ if(e.key==='Escape') closeLb(); if(e.key==='ArrowLeft') lbStep(-1); if(e.key==='ArrowRight') lbStep(1);} });
  // swipe support
  let lxs=null;
  lb.addEventListener('touchstart', (e)=>{ lxs = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', (e)=>{ if(lxs==null) return; const dx = e.changedTouches[0].clientX - lxs; lxs=null; if(dx>40) lbStep(-1); if(dx<-40) lbStep(1); });

  // Initial place after images load a little
  window.addEventListener('load', schedule);
  schedule();
})();

// Photo heart animation (refined polaroid tiles, bezier flight, glow pulse)
(function photoHeart(){
  const canvas = document.getElementById('photoHeartCanvas');
  const playBtn = document.getElementById('playHeartBtn');
  if(!canvas || !playBtn) return;
  const ctx = canvas.getContext('2d');

  // Build list from galleryItems (or sample if empty)
  const items = (galleryItems.length ? galleryItems : [ {src:'assets/heart.svg'} ]);

  // Helpers
  const TAU = Math.PI*2;
  const clamp = (n,a,b)=> Math.max(a, Math.min(b, n));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  function bezier(p0,p1,p2,p3,t){
    const it = 1-t;
    return {
      x: it*it*it*p0.x + 3*it*it*t*p1.x + 3*it*t*t*p2.x + t*t*t*p3.x,
      y: it*it*it*p0.y + 3*it*it*t*p1.y + 3*it*t*t*p2.y + t*t*t*p3.y,
    };
  }

  function loadImage(src){
    return new Promise((res)=>{ const img = new Image(); img.onload=()=>res(img); img.src=src; });
  }

  // Heart parametric, evenly sampled
  function heartParam(t){
    const x = 16*Math.pow(Math.sin(t),3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return {x, y};
  }
  function heartTargets(w,h,count){
    const pts=[];
    for(let i=0;i<count;i++){
      const t = (i/count)*TAU + (Math.random()*0.15);
      const {x,y} = heartParam(t);
      const nx = (x/34 + 0.5) * w; // wider normalization for nicer shape
      const ny = (1 - ((y+17)/36)) * h;
      pts.push({x:nx, y:ny});
    }
    return pts;
  }

  // Sprite objects (polaroid)
  let sprites=[]; let animId=null; let phase='fly'; let pulse=0;

  async function prepareSprites(){
    const imgs = await Promise.all(items.map(it=>loadImage(it.src)));
    const N = clamp(Math.floor(imgs.length*28), 60, 160);
    const targets = heartTargets(canvas.width, canvas.height, N);
    sprites = targets.map((end,i)=>{
      const img = imgs[i % imgs.length];
      const size = 44 + Math.random()*18; // polaroid outer size
      // Random start around bottom/sides
      const side = Math.random();
      let start = {x: Math.random()*canvas.width, y: canvas.height + 60};
      if(side<0.25) start = {x:-60, y: Math.random()*canvas.height};
      if(side>0.75) start = {x:canvas.width+60, y: Math.random()*canvas.height};
      // Two control points creating a swoop
      const c1 = {x: (start.x*0.6 + end.x*0.4) + (Math.random()*120-60), y: (start.y*0.6 + end.y*0.4) - (80+Math.random()*120)};
      const c2 = {x: (start.x*0.3 + end.x*0.7) + (Math.random()*80-40),  y: (start.y*0.3 + end.y*0.7) - (60+Math.random()*80)};
      return {
        img,
        start, c1, c2, end,
        size,
        tilt: (Math.random()*0.4 - 0.2),
        t: 0,
        dur: 160 + Math.random()*90, // frames
      };
    });
    phase='fly'; pulse=0;
  }

  function drawPolaroid(sp, x, y, scale=1){
    const pad = 6*scale, bottom = 10*scale; // polaroid white frame
    const w = sp.size*scale, h = sp.size*scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sp.tilt * (phase==='fly'?1:0.2));
    // shadow
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    // frame
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w/2, -h/2, w, h);
    // inner photo area
    const iw = w - pad*2;
    const ih = h - pad*2 - bottom;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-iw/2, -ih/2 - (bottom/2), iw, ih);
    ctx.clip();
    // draw image fitted
    const r = Math.min(iw/sp.img.width, ih/sp.img.height);
    const dw = sp.img.width * r;
    const dh = sp.img.height * r;
    ctx.drawImage(sp.img, -dw/2, -dh/2 - (bottom/2), dw, dh);
    ctx.restore();
    // border line
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.strokeRect(-w/2, -h/2, w, h);
    ctx.restore();
  }

  function drawHeartGlow(){
    pulse += 0.04;
    const a = 0.35 + Math.sin(pulse)*0.15;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ff6fa4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // draw heart outline path centered from parametric
    const w = canvas.width, h = canvas.height;
    for(let i=0;i<=160;i++){
      const t = (i/160)*TAU;
      const {x,y} = heartParam(t);
      const nx = (x/34 + 0.5) * w;
      const ny = (1 - ((y+17)/36)) * h;
      if(i===0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let allDone = true;
    for(const sp of sprites){
      if(phase==='fly'){
        sp.t += 1/sp.dur;
        const t = easeOutCubic(clamp(sp.t, 0, 1));
        const p = bezier(sp.start, sp.c1, sp.c2, sp.end, t);
        drawPolaroid(sp, p.x, p.y);
        if(t < 1) allDone = false;
      } else {
        // settled grid slight scale pulse
        drawPolaroid(sp, sp.end.x, sp.end.y, 1);
      }
    }
    if(phase==='pulse') drawHeartGlow();
    if(phase==='fly' && !allDone){
      animId = requestAnimationFrame(render);
    } else if(phase==='fly' && allDone){
      phase='pulse';
      animId = requestAnimationFrame(render);
    } else if(phase==='pulse'){
      animId = requestAnimationFrame(render);
    }
  }

  async function start(){
    playBtn.disabled = true;
    await prepareSprites();
    cancelAnimationFrame(animId);
    render();
    setTimeout(()=>{ playBtn.disabled = false; }, 3500);
  }

  playBtn.addEventListener('click', start);
})();

// Floating Hearts background
(function heartsBackground(){
  const bg = document.getElementById('hearts-bg');
  const colors = ['#ff4f8b','#ff87b7','#ffa6c9'];
  function spawnHeart(){
    const el = document.createElement('div');
    el.className = 'heart';
    const size = Math.random()*12 + 8; // 8..20
    el.style.width = size+"px";
    el.style.height = size+"px";
    el.style.left = (Math.random()*100)+"%";
    el.style.bottom = '-20px';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.animationDuration = (4 + Math.random()*6) + 's';
    bg.appendChild(el);
    setTimeout(()=> el.remove(), 12000);
  }
  setInterval(spawnHeart, 450);
})();

// Evasive "No" button and growing "Yes"
(function playfulButtons(){
  const yes = document.getElementById('yesBtn');
  const no = document.getElementById('noBtn');
  const ctaRow = document.querySelector('.cta-row');
  const hero = document.getElementById('hero');
  let yesScale = 1;

  // Smooth glide of the "No" button along a random bezier path
  let glideId = null;
  function randomTarget(avoidX=null, avoidY=null){
    const rect = hero.getBoundingClientRect();
    const leftBound = Math.max(0, rect.left);
    const topBound  = Math.max(0, rect.top);
    const rightBound = Math.min(window.innerWidth, rect.right);
    const bottomBound = Math.min(window.innerHeight, rect.bottom);
    const bw = no.offsetWidth || 80;
    const bh = no.offsetHeight || 40;
    const margin = 16;
    let x=0, y=0, tries=0;
    do {
      const width = Math.max(0, (rightBound - leftBound) - bw - margin*2);
      const height = Math.max(0, (bottomBound - topBound) - bh - margin*2);
      x = Math.floor(Math.random() * (width)) + leftBound + margin;
      y = Math.floor(Math.random() * (height)) + topBound + margin;
      tries++;
    } while(
      avoidX !== null && avoidY !== null &&
      Math.hypot(x - avoidX, y - avoidY) < 140 &&
      tries < 25
    );
    return {x,y};
  }

  function glideTo(endX, endY){
    cancelAnimationFrame(glideId);
    const r = no.getBoundingClientRect();
    const start = { x: r.left, y: r.top };
    // control point with random offset for a curved path
    const cp = {
      x: (start.x + endX)/2 + (Math.random()*160 - 80),
      y: (start.y + endY)/2 + (Math.random()*120 - 60)
    };
    const dur = 380 + Math.random()*160;
    const t0 = performance.now();
    no.style.position = 'fixed';
    function qbez(p0, p1, p2, t){
      const it = 1-t;
      return {
        x: it*it*p0.x + 2*it*t*p1.x + t*t*p2.x,
        y: it*it*p0.y + 2*it*t*p1.y + t*t*p2.y,
      };
    }
    function ease(t){ return 1 - Math.pow(1-t, 3); }
    function step(now){
      const t = Math.min(1, (now - t0)/dur);
      const e = ease(t);
      const p = qbez(start, cp, {x:endX, y:endY}, e);
      no.style.left = p.x + 'px';
      no.style.top = p.y + 'px';
      if(t < 1) glideId = requestAnimationFrame(step);
    }
    glideId = requestAnimationFrame(step);
  }

  function evade(avoidX=null, avoidY=null){
    const {x,y} = randomTarget(avoidX, avoidY);
    glideTo(x,y);
  }

  // Run away only on direct hover/touch/click (smaller hitbox)
  no.addEventListener('mouseenter', ()=> evade());
  no.addEventListener('touchstart', (e)=>{ e.preventDefault(); evade(); }, {passive:false});
  no.addEventListener('click', (e)=>{ e.preventDefault(); evade(); });

  // Hide the no button when hero is out of view; show when in view
  function updateNoVisibility(){
    const r = hero.getBoundingClientRect();
    const inView = r.bottom > 0 && r.top < window.innerHeight;
    no.style.visibility = inView ? 'visible' : 'hidden';
  }
  window.addEventListener('scroll', updateNoVisibility, {passive:true});
  window.addEventListener('resize', updateNoVisibility);
  updateNoVisibility();

  yes.addEventListener('mouseenter', ()=>{
    yesScale = Math.min(1.6, yesScale + 0.08);
    yes.style.transform = `scale(${yesScale})`;
  });
})();

// Celebration: confetti hearts + reveal text
(function celebration(){
  const yes = document.getElementById('yesBtn');
  const celebration = document.getElementById('celebration');
  const replay = document.getElementById('replayBtn');
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let particles = []; let animId = null;

  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();

  function spawnParticles(n=120){
    particles = [];
    for(let i=0;i<n;i++){
      particles.push({
        x: Math.random()*canvas.width,
        y: -10,
        vy: 2 + Math.random()*3,
        vx: (Math.random()-.5)*2,
        size: 8+Math.random()*10,
        rot: Math.random()*Math.PI,
        vr: (Math.random()-.5)*0.2,
        color: ['#ff4f8b','#ff87b7','#ffa6c9'][Math.floor(Math.random()*3)]
      });
    }
  }

  function heartPath(size){
    const s = size/32; // scale from a base path
    ctx.beginPath();
    // a simple heart path
    ctx.moveTo(16*s, 29*s);
    ctx.bezierCurveTo(12*s, 25*s, 4*s, 20*s, 4*s, 12*s);
    ctx.bezierCurveTo(4*s, 5*s, 10*s, 2*s, 16*s, 7*s);
    ctx.bezierCurveTo(22*s, 2*s, 28*s, 5*s, 28*s, 12*s);
    ctx.bezierCurveTo(28*s, 20*s, 20*s, 25*s, 16*s, 29*s);
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      heartPath(p.size);
      ctx.fill();
      ctx.restore();
    }
    particles = particles.filter(p => p.y < canvas.height + 40);
    if(particles.length){ animId = requestAnimationFrame(draw); }
  }

  function start(){
    spawnParticles(150);
    cancelAnimationFrame(animId);
    draw();
  }

  yes.addEventListener('click', ()=>{
    // Reveal post-yes sections
    document.body.classList.remove('site-locked');
    // Show celebration card and heart shower
    celebration.hidden = false;
    start();
    // Smooth scroll to the first post-yes section (London banner)
    const target = document.getElementById('london') || celebration;
    setTimeout(()=>{
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }, 200);
  });
  replay.addEventListener('click', start);
})();

// Gallery population
(function gallery(){
  const grid = document.getElementById('galleryGrid');
  if(!grid) return;
  if(galleryItems.length === 0){
    const empty = document.createElement('p');
    empty.className = 'subtitle';
    empty.textContent = 'No photos yet. Add yours in assets/images and list them in script.js!';
    grid.parentElement.insertBefore(empty, grid.nextSibling);
    return;
  }
  for(const item of galleryItems){
    const card = createEl('figure', { className: 'card' });
    const img = createEl('img', { src: item.src, alt: item.caption || 'memory' });
    const cap = createEl('figcaption', { className: 'caption', textContent: item.caption || '' });
    card.appendChild(img);
    if(item.caption) card.appendChild(cap);
    grid.appendChild(card);
  }
})();

// Storybook flipbook controls
(function storybook(){
  const pagesWrap = document.getElementById('pages');
  if(!pagesWrap) return;
  const pages = Array.from(pagesWrap.querySelectorAll('.page'));
  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  const dotsWrap = document.getElementById('pageDots');
  let index = 0;

  function render(){
    pages.forEach((p,i)=> p.classList.toggle('active', i === index));
    if(dotsWrap){
      dotsWrap.innerHTML = '';
      pages.forEach((_,i)=>{
        const b = document.createElement('button');
        if(i===index) b.classList.add('active');
        b.addEventListener('click', ()=>{ index = i; render(); });
        dotsWrap.appendChild(b);
      });
    }
    if(prev) prev.disabled = index===0;
    if(next) next.disabled = index===pages.length-1;
  }

  prev?.addEventListener('click', ()=>{ if(index>0){ index--; render(); } });
  next?.addEventListener('click', ()=>{ if(index<pages.length-1){ index++; render(); } });
  // Swipe support
  let sx=null;
  pagesWrap.addEventListener('touchstart', e=>{ sx = e.touches[0].clientX; }, {passive:true});
  pagesWrap.addEventListener('touchend', e=>{
    if(sx==null) return; const dx = e.changedTouches[0].clientX - sx; sx=null;
    if(dx>40 && index>0){ index--; render(); }
    if(dx<-40 && index<pages.length-1){ index++; render(); }
  });

  render();
})();

// Stats and counters (days together)
(function stats(){
  const daysEl = document.getElementById('daysTogether');

  function parseStartDate(str){
    if(!str) return null;
    // Try ISO yyyy-mm-dd
    let d = new Date(str + 'T00:00:00');
    if(!isNaN(d)) return d;
    // Try dd/mm/yyyy
    const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(m){
      const [, dd, mm, yyyy] = m;
      d = new Date(Number(yyyy), Number(mm)-1, Number(dd));
      if(!isNaN(d)) return d;
    }
    return null;
  }

  function getStartDate(){
    const parsed = parseStartDate(CONFIG.startDate);
    if(parsed) return parsed;
    // default: about 30 days ago
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }

  function calcDays(from){
    const now = new Date();
    const diff = now - from;
    return Math.max(0, Math.floor(diff / (1000*60*60*24)));
  }

  const start = getStartDate();
  const days = calcDays(start);
  if(daysEl) daysEl.textContent = String(days);
})();

// Live together counter (DD HH:MM:SS.mmm)
(function liveTogether(){
  const outs = Array.from(document.querySelectorAll('[data-live-together], #liveTogether'));
  if(!outs.length) return;
  function parseStartDate(str){
    if(!str) return null;
    let d = new Date(str + 'T00:00:00');
    if(!isNaN(d)) return d;
    const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(m){ const [, dd, mm, yyyy] = m; d = new Date(Number(yyyy), Number(mm)-1, Number(dd)); if(!isNaN(d)) return d; }
    return null;
  }
  const start = (function(){
    const p = parseStartDate(CONFIG.startDate);
    if(p) return p;
    const d = new Date(); d.setDate(d.getDate()-30); return d;
  })();
  function pad(n, w=2){ return String(n).padStart(w,'0'); }
  function tick(){
    const now = new Date();
    let ms = now - start; if(ms < 0) ms = 0;
    const days = Math.floor(ms / 86400000); ms -= days*86400000;
    const hrs = Math.floor(ms / 3600000); ms -= hrs*3600000;
    const mins = Math.floor(ms / 60000); ms -= mins*60000;
    const secs = Math.floor(ms / 1000); ms -= secs*1000;
    const text = `${days} days, ${hrs} hours, ${mins} minutes, ${secs} seconds, ${pad(ms,3)} milliseconds of us being together`;
    outs.forEach(el => el.textContent = text);
  }
  tick(); setInterval(tick, 100);
})();
