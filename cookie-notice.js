(()=>{
 /* Уведомление об использовании cookie. Показывается, пока посетитель не нажмёт кнопку; выбор помнится 1 год. */
 const KEY='katsa-cookie-ok',DAYS=365;
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&v.t&&Date.now()-v.t<DAYS*864e5}catch(e){return false}};
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({t:Date.now()}))}catch(e){}try{document.cookie=KEY+'=1; max-age='+DAYS*86400+'; path=/; SameSite=Lax'}catch(e){}};
 const cookieOk=()=>{try{return document.cookie.split('; ').some(c=>c===KEY+'=1')}catch(e){return false}};
 if(read()||cookieOk())return;
 const css=document.createElement('style');
 css.textContent='.cookie-notice{position:fixed;left:50%;bottom:20px;transform:translate(-50%,16px);z-index:2147483000;width:min(760px,calc(100% - 24px));box-sizing:border-box;display:flex;align-items:center;gap:20px;padding:16px 18px 16px 24px;background:#14151bf2;color:#d9d6e2;border:1px solid #ffffff22;border-radius:22px;box-shadow:0 18px 50px #000a;font:15px/1.45 Manrope,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;opacity:0;transition:opacity .35s ease,transform .35s ease;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}'
 +'.cookie-notice.is-visible{opacity:1;transform:translate(-50%,0)}'
 +'.cookie-notice p{margin:0;flex:1}.cookie-notice a{color:#aeb7ff;text-decoration:underline;text-underline-offset:3px}'
 +'.cookie-notice button{flex:0 0 auto;border:0;border-radius:999px;padding:12px 26px;background:#fff;color:#08090d;font:600 15px/1 inherit;font-family:inherit;cursor:pointer;transition:background .2s,transform .2s}'
 +'.cookie-notice button:hover{background:#e9e9f2}.cookie-notice button:active{transform:scale(.97)}.cookie-notice button:focus-visible,.cookie-notice a:focus-visible{outline:2px solid #aeb7ff;outline-offset:3px}'
 +'@media(max-width:640px){.cookie-notice{flex-direction:column;align-items:stretch;gap:14px;bottom:12px;padding:18px;font-size:14px}.cookie-notice button{width:100%;padding:14px}}'
 +'@media(prefers-reduced-motion:reduce){.cookie-notice{transition:none}}';
 const box=document.createElement('div');
 box.className='cookie-notice';box.setAttribute('role','region');box.setAttribute('aria-label','Уведомление об использовании cookie');
 box.innerHTML='<p>Продолжая пользоваться этим сайтом, вы соглашаетесь на использование cookie и обработку данных в соответствии с <a href="/policy/" target="_blank" rel="noopener">Политикой обработки и защиты персональных данных</a></p><button type="button">Понятно</button>';
 box.querySelector('button').addEventListener('click',()=>{save();box.classList.remove('is-visible');setTimeout(()=>box.remove(),400)});
 const show=()=>{document.head.append(css);document.body.append(box);requestAnimationFrame(()=>requestAnimationFrame(()=>box.classList.add('is-visible')))};
 if(document.body)setTimeout(show,700);else document.addEventListener('DOMContentLoaded',()=>setTimeout(show,700));
})();
