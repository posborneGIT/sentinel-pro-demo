/*
 * Sentinel Pro demo v2 — shared UI helper library. Loaded before every
 * screen module. Screens should build markup with these helpers instead of
 * hand-rolling class strings, so the whole demo stays visually consistent.
 * Plain classic script (no ES modules) so the demo still opens via
 * double-click / file:// with no local server.
 */
(function () {
  var UI = {};
  var _uid = 0;
  UI.uid = function (prefix) { _uid += 1; return (prefix || 'id') + _uid; };

  UI.escape = function (str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  UI.fmtDate = function (iso) {
    if (!iso) return '';
    return String(iso).slice(0, 10);
  };
  UI.fmtDateTime = function (iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toISOString().slice(0, 10) + ' ' + d.toISOString().slice(11, 16) + 'Z';
  };
  UI.timeAgo = function (iso) {
    if (!iso) return '';
    var ms = Date.now() - new Date(iso).getTime();
    var m = Math.round(ms / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    var h = Math.round(m / 60);
    if (h < 24) return h + 'h ago';
    var d = Math.round(h / 24);
    if (d < 30) return d + 'd ago';
    return Math.round(d / 30) + 'mo ago';
  };
  UI.bytes = function (n) {
    if (n == null) return '—';
    var u = ['B', 'KB', 'MB', 'GB'];
    var i = 0; var v = Number(n);
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i += 1; }
    return (i === 0 ? v : v.toFixed(1)) + ' ' + u[i];
  };
  UI.pct = function (n, digits) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toFixed(digits == null ? 0 : digits) + '%';
  };
  UI.num = function (n, digits) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 });
  };

  UI.dot = function (tone) { return '<i class="dot' + (tone ? ' ' + tone : '') + '"></i>'; };

  UI.state = function (label, tone) {
    return '<span class="state' + (tone ? ' ' + tone : '') + '">' + UI.dot(tone) + UI.escape(label) + '</span>';
  };

  UI.plate = function (label, tone) {
    return '<span class="plate' + (tone ? ' ' + tone : '') + '">' + UI.escape(label) + '</span>';
  };

  UI.chip = function (label, tone, dotTone) {
    return '<span class="chip' + (tone ? ' ' + tone : '') + '">' +
      (dotTone !== false ? UI.dot(dotTone || tone) : '') + UI.escape(label) + '</span>';
  };

  UI.bar = function (pct, tone) {
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    return '<span class="bar"><i class="' + (tone || '') + '" style="width:' + p + '%"></i></span>';
  };

  /** Citation chip: {title, date, kind} -> a `(added YYYY-MM-DD)` sourced chip, matching the real product's citation convention. */
  UI.src = function (c) {
    var datePart = c.date ? ' <span class="date">(added ' + UI.fmtDate(c.date) + ')</span>' : '';
    return '<span class="src" title="' + UI.escape(c.title || '') + '">' + UI.escape(c.title || '') + datePart + '</span>';
  };

  var FILEPLATE_BY_EXT = {
    l5x: 'plc', l5k: 'plc', acd: 'plc', rss: 'plc', ulpr: 'plc', ullme: 'plc',
    mer: 'hmi', apa: 'hmi', cli: 'hmi',
    ypj: 'drive',
    csv: 'tag', xlsx: 'tag', xls: 'tag', eas: 'tag', erp: 'tag', eic: 'tag',
    pdf: 'doc', docx: 'doc', doc: 'doc',
    dwg: 'schematic', dxf: 'schematic', svg: 'schematic', png: 'schematic', jpg: 'schematic', jpeg: 'schematic'
  };
  UI.fileplate = function (filename) {
    var ext = String(filename || '').split('.').pop().toLowerCase();
    var fam = FILEPLATE_BY_EXT[ext] || 'text';
    return '<span class="fileplate fileplate--' + fam + '">' + UI.escape(ext || '?') + '</span>';
  };

  /** Ring gauge — small inline SVG, 0-100 pct. */
  UI.ring = function (pct, label, size) {
    var s = size || 72; var r = (s / 2) - 6; var c = 2 * Math.PI * r;
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    var off = c * (1 - p / 100);
    return '<div class="ring-wrap">' +
      '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
      '<circle class="bg" cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + r + '" fill="none" stroke-width="6"/>' +
      '<circle class="fg" cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + r + '" fill="none" stroke-width="6" ' +
      'stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" ' +
      'transform="rotate(-90 ' + (s / 2) + ' ' + (s / 2) + ')"/>' +
      '<text class="ring-val" x="50%" y="53%" text-anchor="middle">' + Math.round(p) + '%</text>' +
      '</svg><div class="ring-label">' + UI.escape(label || '') + '</div></div>';
  };

  // ---------- toasts ----------
  UI.toast = function (msg, tone, ms) {
    var host = document.getElementById('toasts');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'toast' + (tone ? ' ' + tone : '');
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 260);
    }, ms || 4200);
  };

  // ---------- modal ----------
  UI.openModal = function (innerHtml, opts) {
    opts = opts || {};
    var host = document.getElementById('modal-host');
    if (!host) return;
    host.innerHTML = '<div class="overlay" id="modal-overlay"><div class="modal' + (opts.wide ? ' wide' : '') + '">' + innerHtml + '</div></div>';
    host.querySelector('#modal-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'modal-overlay' && opts.dismissable !== false) UI.closeModal();
    });
  };
  UI.closeModal = function () {
    var host = document.getElementById('modal-host');
    if (host) host.innerHTML = '';
  };

  UI.confirm = function (opts) {
    opts = opts || {};
    var id = UI.uid('confirm');
    UI.openModal(
      '<div class="mh">' + UI.escape(opts.title || 'Confirm') + '</div>' +
      '<div class="mb"><div class="note' + (opts.danger ? ' fault' : ' warn') + '">' + (opts.body || '') + '</div></div>' +
      '<div class="mf">' +
      '<button class="btn ghost" id="' + id + '-cancel">Cancel</button>' +
      '<button class="btn ' + (opts.danger ? 'danger' : 'primary') + '" id="' + id + '-ok">' + UI.escape(opts.okLabel || 'Confirm') + '</button>' +
      '</div>'
    );
    document.getElementById(id + '-cancel').addEventListener('click', UI.closeModal);
    document.getElementById(id + '-ok').addEventListener('click', function () {
      UI.closeModal();
      if (typeof opts.onConfirm === 'function') opts.onConfirm();
    });
  };

  window.UI = UI;
})();
