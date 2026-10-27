/* Мини-движок для кликабельных страниц прототипа (.dc.html).
   Поддерживает: <helmet>, <sc-if>, <sc-for>, {{значение}}, onClick="{{функция}}", DCLogic.setState */
(function () {
  'use strict';
  var navSrc = (document.currentScript && document.currentScript.src || '').replace(/support\.js.*$/, 'proto-nav.js');
  if (navSrc) { var ns = document.createElement('script'); ns.src = navSrc; ns.defer = true; document.head.appendChild(ns); }
  var isMobile = /Mobile\.dc\.html/i.test(location.pathname);
  if (isMobile && !document.querySelector('meta[name=viewport]')) {
    var vp = document.createElement('meta'); vp.name = 'viewport'; vp.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(vp);
  }

  function DCLogic() { this.state = {}; this.props = {}; this._render = null; }
  DCLogic.prototype.setState = function (patch) {
    this.state = Object.assign({}, this.state, patch);
    if (this._render) this._render();
  };
  DCLogic.prototype.renderVals = function () { return {}; };
  window.DCLogic = DCLogic;

  function lookup(path, scope) {
    var parts = path.split('.'), cur = scope;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function evalExpr(expr, scope) {
    var e = expr.trim();
    if (e === 'true') return true;
    if (e === 'false') return false;
    if (e === 'null' || e === 'undefined') return undefined;
    if (/^-?\d+(\.\d+)?$/.test(e)) return parseFloat(e);
    var neg = false;
    if (e.charAt(0) === '!') { neg = true; e = e.slice(1).trim(); }
    var v = lookup(e, scope);
    return neg ? !v : v;
  }
  var WHOLE = /^\s*\{\{([^}]*)\}\}\s*$/;
  function interpolate(str, scope) {
    return str.replace(/\{\{([^}]*)\}\}/g, function (_, ex) {
      var v = evalExpr(ex, scope);
      return v == null || v === false ? '' : String(v);
    });
  }

  function build(node, scope, out) {
    if (node.nodeType === 3) {
      out.appendChild(document.createTextNode(node.nodeValue.indexOf('{{') >= 0 ? interpolate(node.nodeValue, scope) : node.nodeValue));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    if (tag === 'sc-if') {
      var vm = WHOLE.exec(node.getAttribute('value') || '');
      var ok = vm ? evalExpr(vm[1], scope) : false;
      if (ok) for (var c = node.firstChild; c; c = c.nextSibling) build(c, scope, out);
      return;
    }
    if (tag === 'sc-for') {
      var lm = WHOLE.exec(node.getAttribute('list') || '');
      var list = (lm ? evalExpr(lm[1], scope) : []) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (item, idx) {
        var sub = Object.create(scope); sub[as] = item; sub.$index = idx;
        for (var c = node.firstChild; c; c = c.nextSibling) build(c, sub, out);
      });
      return;
    }
    var el = document.createElement(node.tagName);
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], name = a.name, val = a.value;
      if (name.indexOf('hint-') === 0) continue;
      if (/^on[a-z]+$/i.test(name)) {
        var m = WHOLE.exec(val);
        var fn = m ? evalExpr(m[1], scope) : null;
        if (typeof fn === 'function') el.addEventListener(name.slice(2).toLowerCase(), fn);
        continue;
      }
      if (val.indexOf('{{') >= 0) {
        var wm = WHOLE.exec(val);
        if (wm) {
          var v = evalExpr(wm[1], scope);
          if (v === false || v == null) continue;
          el.setAttribute(name, v === true ? '' : String(v));
        } else el.setAttribute(name, interpolate(val, scope));
      } else el.setAttribute(name, val);
    }
    for (var k = node.firstChild; k; k = k.nextSibling) build(k, scope, el);
    out.appendChild(el);
  }

  function snapshotForm(root) {
    var els = root.querySelectorAll('input,textarea,select');
    var snap = Array.prototype.map.call(els, function (e) { return { v: e.value, c: e.checked }; });
    var act = document.activeElement, idx = Array.prototype.indexOf.call(els, act);
    return { snap: snap, focus: idx, s: act && act.selectionStart, e: act && act.selectionEnd };
  }
  function restoreForm(root, st) {
    var els = root.querySelectorAll('input,textarea,select');
    st.snap.forEach(function (s, i) {
      if (!els[i]) return;
      if (els[i].type === 'checkbox' || els[i].type === 'radio') els[i].checked = s.c; else els[i].value = s.v;
    });
    if (st.focus >= 0 && els[st.focus]) {
      els[st.focus].focus();
      try { els[st.focus].setSelectionRange(st.s, st.e); } catch (e) {}
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var host = document.querySelector('x-dc');
    if (!host) return;
    var helm = host.querySelector('helmet');
    if (helm) {
      Array.prototype.slice.call(helm.children).forEach(function (n) { document.head.appendChild(n); });
      helm.remove();
    }
    var tpl = document.createDocumentFragment();
    while (host.firstChild) tpl.appendChild(host.firstChild);
    host.style.display = 'block';

    var logic = new DCLogic();
    var sc = document.querySelector('script[type="text/x-dc"]');
    if (sc) {
      try {
        var Cls = new Function('DCLogic', sc.textContent + '\n;return Component;')(DCLogic);
        logic = new Cls();
        if (!logic.state) logic.state = {};
      } catch (e) { console.error('Ошибка в логике страницы', e); }
    }
    function render() {
      var form = snapshotForm(host);
      var vals = {}; try { vals = logic.renderVals() || {}; } catch (e) { console.error(e); }
      var frag = document.createDocumentFragment();
      for (var c = tpl.firstChild; c; c = c.nextSibling) build(c, vals, frag);
      host.replaceChildren(frag);
      restoreForm(host, form);
    }
    logic._render = render;
    render();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  });
})();
