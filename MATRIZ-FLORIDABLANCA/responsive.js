(()=>{
  'use strict';
  const sidebar=document.getElementById('sidebar');
  const btn=document.getElementById('mobileMenuBtn');
  const overlay=document.getElementById('mobileNavOverlay');
  if(!sidebar||!btn||!overlay) return;
  const mobile=()=>window.matchMedia('(max-width:1100px)').matches;
  function setOpen(open){
    if(!mobile()) open=false;
    sidebar.classList.toggle('mobile-open',open);
    overlay.classList.toggle('open',open);
    document.body.classList.toggle('mobile-nav-open',open);
    btn.setAttribute('aria-expanded',String(open));
    btn.textContent=open?'×':'☰';
  }
  btn.addEventListener('click',()=>setOpen(!sidebar.classList.contains('mobile-open')));
  overlay.addEventListener('click',()=>setOpen(false));
  sidebar.addEventListener('click',e=>{ if(mobile() && e.target.closest('.nav-btn')) setTimeout(()=>setOpen(false),50); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') setOpen(false); });
  window.addEventListener('resize',()=>{ if(!mobile()) setOpen(false); });
})();
