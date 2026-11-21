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
        + 'body.dnx-hide-green-line .dnx-seg-green{display:none !important;opacity:0 !important;}';
      document.head.appendChild(style);
    }
  }catch(e){}

  const STORE_Y = 'dnx.line.yellow.enabled';
  const STORE_G = 'dnx.line.green.enabled';

  function loadFlag(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(raw === null) return fallback;
      return raw === '1';
    }catch(e){}
    return fallback;
  }

  function saveFlag(key, value){
    try{ localStorage.setItem(key, value ? '1' : '0'); }catch(e){}
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
    if(host) return host;

    host = document.createElement('div');
    host.id = 'dnx-line-toggle-box';
    host.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0 8px 0;';

    function mkBtn(id, label, getter, setter){
      const b = document.createElement('button');
      b.type = 'button';
      b.id = id;
      b.style.cssText = 'height:26px;padding:0 10px;border-radius:999px;border:1px solid #ffffff;background:#666666;color:#ffffff;font:700 12px/1 Segoe UI,sans-serif;cursor:pointer;';
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
      b.addEventListener('click', function(){
        setter(!getter());
        paint();
      });
      paint();
      return b;
    }

    host.appendChild(mkBtn(
      'dnx-btn-yellow-line',
      'Gelb Hover',
      function(){ return !!window.__dnxYellowEnabled; },
      function(v){
        window.__dnxYellowEnabled = !!v;
        saveFlag(STORE_Y, !!v);
        syncLineVisibility();
      }
    ));

    host.appendChild(mkBtn(
      'dnx-btn-green-line',
      'Gruen Tuning',
      function(){ return !!window.__dnxGreenEnabled; },
      function(v){
        window.__dnxGreenEnabled = !!v;
        saveFlag(STORE_G, !!v);
        syncLineVisibility();
      }
    ));

    if (receiver.id === 'dnx-fx-box-inline') {
      receiver.appendChild(host);
    } else {
      receiver.insertBefore(host, receiver.firstChild);
    }
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
