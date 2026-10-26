// The URL owns the edition, so a dark homepage visit never inherits medical styling.
(()=>{if(!document.documentElement.classList.contains('case-light'))return;
 const routes={'index.html':'medicine.html','index.html#projects':'medicine.html#med-projects','index.html#services':'medicine.html#med-tasks','index.html#medical':'medicine.html','index.html#approach':'medicine.html#approach'};
 document.querySelectorAll('a[href]').forEach(a=>{const target=routes[a.getAttribute('href')];if(target)a.setAttribute('href',target)});
 const back=document.querySelector('.case-back');if(back){back.href='medicine.html#med-projects';back.textContent='← Медицинские проекты'}
})();
