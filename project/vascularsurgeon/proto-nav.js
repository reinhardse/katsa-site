/* Навигация прототипа: нижние кнопки «Меню / Десктоп / Мобильная» и верхняя вкладка «Страницы» со списком.
   Подключается на всех страницах и в обёртке view.html, одинаково на десктопе и на мобильной версии. */
(function () {
  'use strict';
  if (window.top !== window.self) return;           // внутри телефонной рамки не дублируем: панель живёт снаружи рамки
  if (window.__protoNav) return; window.__protoNav = true;

  var PAGES = [
    ['Main', 'Главная'], ['About', 'О нас'], ['Direction', 'Эндоваскулярная хирургия'],
    ['Surgery', 'Сердечно-сосудистая хирургия'], ['Phlebology', 'Флебология'],
    ['Cardiology', 'Кардиология и аритмология'], ['Disease', 'Страница заболевания'],
    ['Doctor', 'Страница врача'], ['Contacts', 'Контакты']
  ];

  var path = location.pathname.split('/').pop();
  var key = null, mobile = false, m;
  if ((m = /^([A-Za-z]+?)(Mobile)?\.dc\.html$/.exec(path))) { key = m[1]; mobile = !!m[2]; }
  else if (/^view\.html$/i.test(path)) {
    var p = new URLSearchParams(location.search).get('p') || 'MainMobile.dc.html';
    if ((m = /^([A-Za-z]+?)Mobile\.dc\.html$/.exec(p))) { key = m[1]; mobile = true; }
  }
  if (!key) return;                                  // на странице-меню (index.html) панель не нужна

  function href(k, mob) { return mob ? 'view.html?p=' + k + 'Mobile.dc.html' : k + '.dc.html'; }

  var nodes = [];
  function make() {
    nodes.forEach(function (n) { n.remove(); }); nodes = [];
    var font = '600 13px/1 "Helvetica Neue",Arial,sans-serif';
    var base = 'text-decoration:none;border:1.5px solid #1f1f1f;box-shadow:0 2px 8px rgba(0,0,0,.25);font:' + font + ';cursor:pointer;';
    function style(active) { return base + (active ? 'background:#fff;color:#1f1f1f;' : 'background:#1f1f1f;color:#fff;'); }

    /* нижние кнопки */
    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;gap:6px;';
    function pill(text, h, active) {
      var a = document.createElement('a'); a.href = h; a.textContent = text;
      a.style.cssText = style(active) + 'padding:10px 14px;border-radius:20px;'; bar.appendChild(a);
    }
    pill('☰ Меню', 'index.html', false);
    pill('Десктоп', href(key, false), !mobile);
    pill('Мобильная', href(key, true), mobile);

    /* верхняя вкладка со списком страниц */
    var tab = document.createElement('div');
    tab.style.cssText = 'position:fixed;left:12px;top:0;z-index:2147483000;';
    var btn = document.createElement('button'); btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '☰ Страницы';
    btn.style.cssText = style(false) + 'padding:8px 14px 9px;border-radius:0 0 12px 12px;border-top:0;';
    var list = document.createElement('div'); list.hidden = true;
    list.style.cssText = 'position:absolute;left:0;top:100%;min-width:260px;max-width:calc(100vw - 24px);background:#fff;border:1.5px solid #1f1f1f;border-radius:0 12px 12px 12px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:6px;max-height:calc(100vh - 60px);overflow:auto;';
    PAGES.forEach(function (pg) {
      var a = document.createElement('a'); a.href = href(pg[0], mobile); a.textContent = pg[1];
      var cur = pg[0] === key;
      a.style.cssText = 'display:block;padding:11px 12px;border-radius:8px;text-decoration:none;font:' + font + ';font-weight:' + (cur ? '700' : '500') + ';font-size:15px;color:#1f1f1f;' + (cur ? 'background:#efefef;' : '');
      a.addEventListener('mouseenter', function () { if (!cur) a.style.background = '#f5f5f5'; });
      a.addEventListener('mouseleave', function () { if (!cur) a.style.background = ''; });
      list.appendChild(a);
    });
    function toggle(open) { list.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(list.hidden); });
    document.addEventListener('click', function (e) { if (!tab.contains(e.target)) toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
    tab.appendChild(btn); tab.appendChild(list);

    document.body.appendChild(bar); document.body.appendChild(tab); nodes.push(bar, tab);
    if (!/^view\.html$/i.test(path) && !document.body.dataset.protoPad) {
      document.body.dataset.protoPad = '1';                 // место под вкладку, чтобы она не закрывала шапку страницы
      var pt = parseInt(getComputedStyle(document.body).paddingTop, 10) || 0;
      document.body.style.paddingTop = (pt + 32) + 'px';
    }
  }
  /* вызывается из view.html, когда внутри телефонной рамки открыли другую страницу */
  window.__protoNavSet = function (file) {
    var mm = /^([A-Za-z]+?)Mobile\.dc\.html$/.exec(file || '');
    if (mm && mm[1] !== key) { key = mm[1]; mobile = true; make(); }
  };
  if (document.body) make(); else document.addEventListener('DOMContentLoaded', make);
})();
