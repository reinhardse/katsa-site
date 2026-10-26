(()=>{
 const scope=document.querySelector('#contact-modal-source')?.content||document;
 const source=scope.querySelector('#project-request');
 if(!source)return;
 const dialog=document.createElement('dialog');dialog.id='contact-modal';dialog.className='contact-modal';dialog.setAttribute('aria-labelledby','contact-modal-title');
 dialog.innerHTML='<button type="button" class="contact-modal-close" aria-label="Закрыть окно">×</button><div class="contact-modal-layout"><div class="contact-modal-intro"><h2 id="contact-modal-title">Давайте обсудим<br><span>проект</span></h2><p class="contact-modal-description">Расскажите, что хотите запустить, переделать или улучшить, а мы предложим решение и поможем его реализовать</p></div><div class="contact-modal-form"></div><div class="contact-modal-connect"><h3>Напишите нам</h3><div class="contact-modal-socials"></div></div></div>';
 const form=source.cloneNode(true);form.id='modal-project-request';form.querySelector('button[type="submit"]').textContent='Оставить заявку';
 form.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
 form.querySelectorAll('.float-reveal').forEach(el=>{el.classList.remove('float-reveal');el.style.removeProperty('--reveal-delay')});
 dialog.querySelector('.contact-modal-form').append(form);
 scope.querySelectorAll('.contact-messengers>a').forEach(a=>{const link=a.cloneNode(true);link.className='contact-modal-social';link.removeAttribute('style');dialog.querySelector('.contact-modal-socials').append(link)});
 document.body.append(dialog);
 let origin=null,overflow='',service='';
 function open(button){origin=button;service=button.dataset.service||'';overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';const menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');if(menu)menu.hidden=true;if(toggle){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню')};form.elements.contact.focus({preventScroll:true})}
 document.addEventListener('click',event=>{const button=event.target.closest('a,button');if(!button||button.closest('#contact-modal')||(button.type==='submit'&&button.form))return;const href=button.getAttribute('href')||'';const contactLink=href==='#contact'||href==='index.html#contact';const isCta=contactLink&&button.textContent.trim()!=='Контакты';if(!isCta&&!button.hasAttribute('data-service'))return;event.preventDefault();event.stopImmediatePropagation();open(button)},true);
 dialog.querySelector('.contact-modal-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
 dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;if(origin?.isConnected)origin.focus({preventScroll:true})});
 form.addEventListener('submit',event=>{event.preventDefault();const contact=form.elements.contact;contact.setCustomValidity(contact.value.trim().length<3?'Укажите любой удобный способ связи':'');if(!form.reportValidity())return;const name=form.elements.name.value.trim(),task=form.elements.task.value.trim();const body=`Здравствуйте, KATSA! Хочу обсудить проект.\n\nИмя: ${name||'Не указано'}\nКонтакт: ${contact.value.trim()}${service?'\nУслуга: '+service:''}\n\nЗадача:\n${task||'Обсудим при знакомстве'}\n\nСтраница: ${document.title}`;location.href='mailto:hello@katsa.ru?subject='+encodeURIComponent('Обсудить проект'+(name?' — '+name:''))+'&body='+encodeURIComponent(body)});
 form.elements.contact.addEventListener('input',event=>event.target.setCustomValidity(''));
})();
