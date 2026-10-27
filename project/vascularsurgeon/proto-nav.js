/* Навигация прототипа: нижние кнопки «Меню / Десктоп / Мобильная» и верхняя вкладка «Страницы» со списком.
   Подключается на всех страницах и в обёртке view.html, одинаково на десктопе и на мобильной версии. */
(function () {
  'use strict';
  if (window.top !== window.self) return;           // внутри телефонной рамки не дублируем: панель живёт снаружи рамки
  if (window.__protoNav) return; window.__protoNav = true;

  var PAGES = [
    ['Main', 'Главная'], ['About', 'О нас'], ['Direction', 'Эндоваскулярная хирургия'],
    ['Surgery', 'Сердечно-сосудистая хирургия'], ['Phlebology', 'Флебология'],
    ['Cardiology', 'Кардиология и аритмология'], ['Contacts', 'Контакты'],
    ['Disease', 'Страница заболевания'], ['Doctor', 'Страница врача']
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

    /* кнопка «Выбрать страницу» рядом с остальными; список открывается вверх */
    var wrap = document.createElement('div'); wrap.style.cssText = 'position:relative;';
    var btn = document.createElement('button'); btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
    var curName = ''; PAGES.forEach(function (pg) { if (pg[0] === key) curName = pg[1]; });
    btn.innerHTML = curName.replace(/&/g,'&amp;').replace(/</g,'&lt;') + ' <span aria-hidden="true" style="display:inline-block;margin-left:4px;transition:transform .15s">▴</span>';
    btn.style.cssText = style(false) + 'padding:10px 14px;border-radius:20px;max-width:60vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    var arrow = btn.querySelector('span');
    var list = document.createElement('div'); list.hidden = true;
    list.style.cssText = 'position:absolute;left:0;bottom:calc(100% + 8px);min-width:270px;max-width:calc(100vw - 24px);background:#fff;border:1.5px solid #1f1f1f;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:6px;max-height:calc(100vh - 90px);overflow:auto;';
    PAGES.forEach(function (pg, i) {
      var a = document.createElement('a'); a.href = href(pg[0], mobile); a.textContent = pg[1];
      var cur = pg[0] === key, tpl = (pg[0] === 'Disease' || pg[0] === 'Doctor');
      a.style.cssText = 'display:block;padding:11px 12px;border-radius:8px;text-decoration:none;font:' + font + ';font-weight:' + (cur ? '700' : '500') + ';font-size:15px;color:#1f1f1f;' + (cur ? 'background:#efefef;' : '') + (tpl && pg[0] === 'Disease' ? 'margin-top:6px;border-top:1px solid #d6d6d6;border-radius:0 0 8px 8px;' : '');
      a.addEventListener('mouseenter', function () { if (!cur) a.style.background = '#f5f5f5'; });
      a.addEventListener('mouseleave', function () { if (!cur) a.style.background = ''; });
      list.appendChild(a);
    });
    function toggle(open) { list.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); arrow.style.transform = open ? 'rotate(180deg)' : ''; }
    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(list.hidden); });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
    wrap.appendChild(btn); wrap.appendChild(list); bar.appendChild(wrap);
    if (window.innerWidth < 480) { bar.style.flexWrap = 'wrap-reverse'; bar.style.maxWidth = 'calc(100vw - 24px)'; }

    document.body.appendChild(bar); nodes.push(bar);
  }
  /* вызывается из view.html, когда внутри телефонной рамки открыли другую страницу */
  window.__protoNavSet = function (file) {
    var mm = /^([A-Za-z]+?)Mobile\.dc\.html$/.exec(file || '');
    if (mm && mm[1] !== key) { key = mm[1]; mobile = true; make(); }
  };
  if (document.body) make(); else document.addEventListener('DOMContentLoaded', make);
})();
