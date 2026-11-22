/* DNX_YELLOW_GREEN_FULLSCREEN_START */
(function(){
  if(window.__dnxLinesFixed) return;
  window.__dnxLinesFixed = true;

  try{
    if(!document.getElementById('dnx-line-hide-style')){
      const style = document.createElement('style');
      style.id = 'dnx-line-hide-style';
      style.textContent = ''
        + 'body.dnx-hide-yellow-line #dnx-follow,'
        + 'body.dnx-hide-yellow-line #dnx-follow-line,'
        + 'body.dnx-hide-yellow-line #dnx-follow-line-glow,'
        + 'body.dnx-hide-yellow-line #dnx-follow-topcap,'
        + 'body.dnx-hide-yellow-line #dnx-seg-yellow,'
        + 'body.dnx-hide-yellow-line .dnx-seg-yellow{display:none !important;opacity:0 !important;}'
        + 'body.dnx-hide-green-line #dnx-center,'
        + 'body.dnx-hide-green-line #dnx-left,'
        + 'body.dnx-hide-green-line #dnx-right,'
        + 'body.dnx-hide-green-line #dnx-green-extension-adaptive-line,'
        + 'body.dnx-hide-green-line #dnx-green-extension-adaptive-glow,'
        + 'body.dnx-hide-green-line #dnx-seg-green,'
        + 'body.dnx-hide-green-line .dnx-seg-green{display:none !important;opacity:0 !important;}'
        + '.dnx-btn-floating{position:fixed !important;z-index:1000650 !important;box-shadow:0 4px 14px rgba(0,0,0,.45) !important;}';
      document.head.appendChild(style);
    }
  }catch(e){}

  const STORE_Y = 'dnx.line.yellow.enabled';
  const STORE_G = 'dnx.line.green.enabled';
  const STORE_BTN_POS = 'dnx.line.btn.pos.v1';

  function loadFlag(key, fallback){
    try{ const raw = localStorage.getItem(key); if(raw === null) return fallback; return raw === '1'; }catch(e){}
    return fallback;
  }
  function saveFlag(key, value){ try{ localStorage.setItem(key, value ? '1' : '0'); }catch(e){} }
  function loadPosMap(){
    try{ const raw = JSON.parse(localStorage.getItem(STORE_BTN_POS) || '{}'); return (raw && typeof raw === 'object') ? raw : {}; }catch(e){ return {}; }
  }
  function saveBtnPos(id, pos){
    try{ const m = loadPosMap(); if(pos) m[id] = pos; else delete m[id]; localStorage.setItem(STORE_BTN_POS, JSON.stringify(m)); }catch(e){}
  }
  function applyPos(btn, host, id){
    const pos = loadPosMap()[id];
    if(pos && isFinite(pos.left) && isFinite(pos.top)){
      if(btn.parentNode !== document.body) document.body.appendChild(btn);
      btn.classList.add('dnx-btn-floating');
      const maxL = Math.max(4, window.innerWidth - 140);
      const maxT = Math.max(4, window.innerHeight - 34);
      btn.style.setProperty('left', Math.max(4, Math.min(maxL, Math.round(pos.left))) + 'px', 'important');
      btn.style.setProperty('top', Math.max(4, Math.min(maxT, Math.round(pos.top))) + 'px', 'important');
    } else {
      btn.classList.remove('dnx-btn-floating');
      btn.style.removeProperty('left');
      btn.style.removeProperty('top');
      if(host && btn.parentNode !== host) host.appendChild(btn);
    }
  }
  function makeButtonMovable(btn, hostGetter){
    if(btn.__dnxMovable) return;
    btn.__dnxMovable = true;
    btn.style.setProperty('cursor', 'grab', 'important');
    btn.style.setProperty('touch-action', 'none', 'important');
    btn.title = 'Klick = An/Aus · Ziehen = Button frei verschieben · Doppelklick = Zurück in Leiste';
    let dragging = false, moved = false, sx = 0, sy = 0, ol = 0, ot = 0;
    btn.addEventListener('pointerdown', function(e){
      if(e.button !== undefined && e.button !== 0) return;
      dragging = true; moved = false;
      const r = btn.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; ol = r.left; ot = r.top;
      btn.style.setProperty('cursor', 'grabbing', 'important');
      try{ btn.setPointerCapture(e.pointerId); }catch(err){}
    });
    btn.addEventListener('pointermove', function(e){
      if(!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if(!moved && Math.abs(dx) + Math.abs(dy) <= 5) return;
      moved = true;
      if(btn.parentNode !== document.body) document.body.appendChild(btn);
      btn.classList.add('dnx-btn-floating');
      const nl = Math.max(4, Math.min(window.innerWidth - btn.offsetWidth - 4, Math.round(ol + dx)));
      const nt = Math.max(4, Math.min(window.innerHeight - btn.offsetHeight - 4, Math.round(ot + dy)));
      btn.style.setProperty('left', nl + 'px', 'important');
      btn.style.setProperty('top', nt + 'px', 'important');
      e.preventDefault();
    });
    function finish(e){
      if(!dragging) return;
      dragging = false;
      btn.style.setProperty('cursor', 'grab', 'important');
      try{ if(btn.releasePointerCapture) btn.releasePointerCapture(e.pointerId); }catch(err){}
      if(moved){
        const r = btn.getBoundingClientRect();
        saveBtnPos(btn.id, { left: Math.round(r.left), top: Math.round(r.top) });
        btn.dataset.dnxSuppress = '1';
        setTimeout(function(){ delete btn.dataset.dnxSuppress; }, 220);
      }
    }
    btn.addEventListener('pointerup', finish);
    btn.addEventListener('pointercancel', finish);
    btn.addEventListener('dblclick', function(e){
      e.preventDefault(); e.stopPropagation();
      saveBtnPos(btn.id, null);
      applyPos(btn, hostGetter(), btn.id);
    });
  }

  window.__dnxYellowEnabled = loadFlag(STORE_Y, true);
  window.__dnxGreenEnabled = loadFlag(STORE_G, true);

  function ensurePanel(){
    const receiver =
      document.getElementById('dnx-fx-box-inline') ||
      document.getElementById('openwebrx-panel-receiver') ||
      document.querySelector('#openwebrx-panel-receiver');
    if(!receiver) return null;

    let host = document.getElementById('dnx-line-toggle-box');
    if(!host){
      host = document.createElement('div');
      host.id = 'dnx-line-toggle-box';
      host.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0 8px 0;';
      if (receiver.id === 'dnx-fx-box-inline') receiver.appendChild(host);
      else receiver.insertBefore(host, receiver.firstChild);
    }

    function mkBtn(id, label, getter, setter){
      let b = document.getElementById(id);
      if(!b){
        b = document.createElement('button');
        b.type = 'button';
        b.id = id;
        b.style.cssText = 'height:26px;padding:0 10px;border-radius:999px;border:1px solid #ffffff;background:#666666;color:#ffffff;font:700 12px/1 Segoe UI,sans-serif;cursor:grab;user-select:none;';
        b.addEventListener('click', function(ev){
          if(b.dataset.dnxSuppress){ ev.preventDefault(); ev.stopPropagation(); return; }
          setter(!getter()); paint();
        });
        host.appendChild(b);
      }
      function paint(){
        const on = getter();
        b.textContent = label + ': ' + (on ? 'On' : 'Off');
        b.style.setProperty('border', '1px solid #ffffff', 'important');
        if (label === 'Gelb Hover') {
          b.style.setProperty('background', on ? '#ffd400' : '#666666', 'important');
          b.style.setProperty('color', on ? '#000000' : '#ffffff', 'important');
        } else {
          b.style.setProperty('background', on ? '#22ff2f' : '#666666', 'important');
          b.style.setProperty('color', on ? '#000000' : '#ffffff', 'important');
        }
      }
      makeButtonMovable(b, function(){ return document.getElementById('dnx-line-toggle-box'); });
      applyPos(b, host, id);
      paint();
      return b;
    }

    mkBtn('dnx-btn-yellow-line', 'Gelb Hover',
      function(){ return !!window.__dnxYellowEnabled; },
      function(v){ window.__dnxYellowEnabled = !!v; saveFlag(STORE_Y, !!v); syncLineVisibility(); }
    );
    mkBtn('dnx-btn-green-line', 'Gruen Tuning',
      function(){ return !!window.__dnxGreenEnabled; },
      function(v){ window.__dnxGreenEnabled = !!v; saveFlag(STORE_G, !!v); syncLineVisibility(); }
    );
    return host;
  }

  function wfRect(){

    const wf =
      document.querySelector('#openwebrx-waterfall-container') ||
      document.querySelector('.openwebrx-waterfall-container');
    return wf ? wf.getBoundingClientRect() : null;
  }

  function mk(id,color,w,op){
    let e=document.getElementById(id);
    if(!e){
      e=document.createElement('div');
      e.id=id;
      e.style.cssText='position:fixed;pointer-events:none;z-index:1000011;width:'+w+'px;background:'+color+';opacity:'+op+';display:none';
      document.body.appendChild(e);
    }
    return e;
  }

  const yellow = mk('dnx-follow','#ffd400',1,1);
  const greenC = mk('dnx-center','#22ff2f',2,1);
  const greenL = mk('dnx-left','#22ff2f',1,0.6);
  const greenR = mk('dnx-right','#22ff2f',1,0.6);

  function hardHide(el){
    try{
      if(el) el.style.display='none';
    }catch(e){}
  }

  function hideAll(selector){
    try{
      document.querySelectorAll(selector).forEach(function(el){
        el.style.display='none';
      });
    }catch(e){}
  }

  function syncLineVisibility(){
    try{
      document.body.classList.toggle('dnx-hide-yellow-line', !window.__dnxYellowEnabled);
      document.body.classList.toggle('dnx-hide-green-line', !window.__dnxGreenEnabled);
    }catch(e){}

    if(!window.__dnxYellowEnabled){
      hardHide(yellow);
      hardHide(window.yellowLine);
      hardHide(window.yellowCap);
      hideAll('#dnx-follow, #dnx-follow-line, #dnx-follow-line-glow, #dnx-follow-topcap, #dnx-seg-yellow, .dnx-seg-yellow');
    }
    if(!window.__dnxGreenEnabled){
      hardHide(greenC);
      hardHide(greenL);
      hardHide(greenR);
      hardHide(window.greenCenter);
      hardHide(window.greenLeft);
      hardHide(window.greenRight);
      hardHide(window.greenCCap);
      hardHide(window.greenLCap);
      hardHide(window.greenRCap);
      hardHide(document.getElementById('dnx-green-extension-adaptive-line'));
      hardHide(document.getElementById('dnx-green-extension-adaptive-glow'));
      hideAll('#dnx-center, #dnx-left, #dnx-right, #dnx-seg-green, .dnx-seg-green, #dnx-green-extension-adaptive-line, #dnx-green-extension-adaptive-glow');
    }
  }

  function setLine(e,x,t,h){
    e.style.left=Math.round(x)+'px';
    e.style.top=Math.round(t)+'px';
    e.style.height=Math.round(h)+'px';
    e.style.display='';
  }

  function hide(e){e.style.display='none';}

  function currentRange(){
    try{
      if(typeof get_visible_freq_range==='function') return get_visible_freq_range();
    }catch(e){}
    try{
      if(typeof visible_range!=='undefined') return visible_range;
    }catch(e){}
    return null;
  }

  function freqToX(freq){
    const r=wfRect();
    if(!r) return null;

    const range=currentRange();
    if(range && typeof scale_px_from_freq==='function'){
      return r.left+scale_px_from_freq(freq,range);
    }

    if(range && range.start && range.bw){
      return r.left+((freq-range.start)/range.bw)*r.width;
    }

    return null;
  }

  function updateGreen(){
    try{
      if(!window.__dnxGreenEnabled){
        hide(greenC); hide(greenL); hide(greenR);
        hardHide(window.greenCenter);
        hardHide(window.greenLeft);
        hardHide(window.greenRight);
        hardHide(window.greenCCap);
        hardHide(window.greenLCap);
        hardHide(window.greenRCap);
        hideAll('#dnx-center, #dnx-left, #dnx-right, #dnx-seg-green, .dnx-seg-green');
        return;
      }
      const r=wfRect();
      if(!r) return;

      const d=UI.getDemodulator();
      if(!d) return;

      let off=0;
      if(d.get_offset_frequency) off=d.get_offset_frequency()||0;

      const bp=d.getBandpass();
      if(!bp) return;

      const xC=freqToX(center_freq+off);
      const xL=freqToX(center_freq+off+bp.low_cut);
      const xR=freqToX(center_freq+off+bp.high_cut);

      if(xC==null) return;

      setLine(greenC,xC,r.top,r.height);

      if(xL && xR && Math.abs(xR-xL)>6){
        setLine(greenL,xL,r.top,r.height);
        setLine(greenR,xR,r.top,r.height);
      } else {
        hide(greenL); hide(greenR);
      }

    }catch(e){}
  }

  document.addEventListener('mousemove',function(e){
    if(!window.__dnxYellowEnabled){
      hide(yellow);
      hardHide(window.yellowLine);
      hardHide(window.yellowCap);
      hideAll('#dnx-follow, #dnx-follow-line, #dnx-follow-line-glow, #dnx-follow-topcap, #dnx-seg-yellow, .dnx-seg-yellow');
      return;
    }
    const r=wfRect();
    if(!r) return;

    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){
      hide(yellow);
      return;
    }

    setLine(yellow,e.clientX,r.top,r.height);
  },{passive:true});

  setInterval(function(){ ensurePanel(); updateGreen(); },120);
  ensurePanel();
  syncLineVisibility();
  updateGreen();

})();
/* DNX_YELLOW_GREEN_FULLSCREEN_END */
