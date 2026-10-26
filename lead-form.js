(()=>{
 /* Единый обработчик всех форм заявок KATSA. Отправляет данные на /send.php */
 const ENDPOINT='/send.php',IDS=['project-request','modal-project-request','service-request'];
 let service='',trigger='';const t0=Date.now();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-service]');if(b)service=b.getAttribute('data-service')||'';const c=e.target.closest('a,button');if(c&&!c.closest('form'))trigger=(c.textContent||'').trim().slice(0,60)},true);
 function note(form,text,ok){
  let n=form.querySelector('.lead-note');
  if(!n){n=document.createElement('p');n.className='lead-note';n.setAttribute('role','status');n.style.cssText='margin:12px 0 0;font-size:15px;line-height:1.4';form.append(n)}
  n.textContent=text;n.style.color=ok?'#7fd99a':'#ff8a8a';
 }
 document.addEventListener('submit',async e=>{
  const form=e.target;
  if(!form||!IDS.includes(form.id))return;
  e.preventDefault();e.stopImmediatePropagation();
  const el=form.elements,contact=el.contact;
  if(contact){contact.setCustomValidity(contact.value.trim().length<3?'Укажите любой удобный способ связи':'');if(!form.reportValidity())return}
  const btn=form.querySelector('button[type="submit"]'),label=btn?btn.textContent:'';
  const tasks=[...form.querySelectorAll('input[name="task"]:checked')].map(i=>i.value);
  const text=form.querySelector('textarea[name="task"]');
  const fd=new FormData();
  fd.append('form',form.id);
  fd.append('name',el.name&&el.name.value?el.name.value:'');
  fd.append('contact',contact.value);
  fd.append('task',text?text.value:tasks.join(', '));
  fd.append('service',[service,...(text?[]:[])].filter(Boolean).join(', '));
  if(text&&tasks.length)fd.append('service',tasks.join(', '));
  fd.append('page',document.title);
  fd.append('url',location.href);
  const kind={'project-request':'форма на странице (блок контактов)','modal-project-request':'всплывающее окно'+(trigger?' (кнопка «'+trigger+'»)':''),'service-request':'форма «Не нашли того, что искали?»'};
  fd.append('via',kind[form.id]||form.id);
  fd.append('website',el.website?el.website.value:'');
  fd.append('elapsed',String(Date.now()-t0));
  if(btn){btn.disabled=true;btn.textContent='Отправляем…'}
  try{
   const r=await fetch(ENDPOINT,{method:'POST',body:fd});
   const j=await r.json().catch(()=>({}));
   if(!r.ok||!j.ok)throw new Error(j.error||'Ошибка отправки');
   form.reset();service='';
   note(form,'Спасибо! Заявка отправлена, мы скоро свяжемся с вами.',true);
  }catch(err){
   note(form,'Не получилось отправить. Напишите нам в Telegram или на hello@katsa.ru.',false);
  }finally{if(btn){btn.disabled=false;btn.textContent=label}}
 },true);
 /* скрытое поле-ловушка для ботов */
 const addTrap=()=>IDS.forEach(id=>{const f=document.getElementById(id);if(f&&!f.elements.website){const i=document.createElement('input');i.name='website';i.tabIndex=-1;i.autocomplete='off';i.setAttribute('aria-hidden','true');i.style.cssText='position:absolute;left:-9999px;opacity:0;height:0;width:0';f.append(i)}});
 addTrap();window.addEventListener('load',addTrap);
})();
