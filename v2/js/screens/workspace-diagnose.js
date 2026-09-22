/*
 * WorkspaceTabs.diagnose — the AI diagnostic chat, grounded in per-machine
 * documentation with source citations. Centerpiece of the demo.
 */
(function () {
  WorkspaceTabs.diagnose = function (mount, machine, ctx) {
    var UI = ctx.ui, DATA = ctx.data;
    var timers = [];
    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    var sessions = DATA.diagnosticSessions.filter(function (s) { return s.machineId === machine.id; });
    var provider = DATA.providers.filter(function (p) { return p.isDefault; })[0] || DATA.providers[0];
    var current = null; // active session object, or null for a fresh chat
    var freshLog = []; // {role, text, citations?, insufficientNote?, insight?}

    mount.innerHTML =
      '<div class="cols cols-3">' +
      '<div class="panel"><div class="ph">Sessions<span class="grow"></span><span class="num">' + sessions.length + '</span></div>' +
      '<div class="session-list" id="dg-sessions">' + renderSessionList() + '</div>' +
      (sessions.length === 0 ? '<div class="pb"><button class="btn primary sm" id="dg-start-fresh" style="width:100%">Start Diagnostic Session</button></div>' : '') +
      '</div>' +
      '<div class="panel"><div class="ph">AI Diagnostics<span class="grow"></span>' +
      '<span class="chip" id="dg-provider-chip">' + UI.escape(provider.name + ' · ' + provider.model) + '</span></div>' +
      '<div class="chat-shell">' +
      '<div class="chat-log" id="dg-log"></div>' +
      '<div class="chat-input-row">' +
      '<textarea class="textarea" id="dg-input" rows="2" placeholder="Ask about ' + UI.escape(machine.name) + '…"></textarea>' +
      '<button class="btn primary" id="dg-send">Send</button>' +
      '</div></div></div>' +
      '<div class="panel"><div class="ph">Context</div><div class="pb stack">' +
      '<div class="field"><label>Machine</label><div class="val">' + UI.escape(machine.name) + '</div></div>' +
      '<div class="field"><label>Controller</label><div class="val" style="font-size:11.5px">' + UI.escape(machine.controller) + '</div></div>' +
      '<div class="field"><label>AI Provider</label><select class="select" id="dg-provider-select">' +
      DATA.providers.map(function (p) {
        return '<option value="' + p.key + '"' + (p.key === provider.key ? ' selected' : '') + (p.status !== 'connected' ? ' disabled' : '') + '>' + UI.escape(p.name + ' — ' + p.model) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="note info">Retrieval fuses dense (ChromaDB) and lexical (BM25) search per machine — answers are grounded only in ' + UI.escape(machine.name) + '’s indexed documents.</div>' +
      '</div></div>' +
      '</div>';

    function renderSessionList() {
      if (!sessions.length) return '<div class="empty">No sessions yet for this machine.</div>';
      return sessions.map(function (s) {
        return '<button class="session-item' + (current && current.id === s.id ? ' on' : '') + '" data-session="' + s.id + '">' +
          '<div class="si-title">' + UI.escape(s.title) + '</div>' +
          '<div class="si-meta">' + UI.timeAgo(s.startedAt) + ' · ' + s.messages.length + ' msgs</div>' +
          '<div class="cites">' + (s.tagged || []).map(function (t) { return UI.chip(t, false, false); }).join('') + '</div>' +
          '</button>';
      }).join('');
    }

    function bubbleHtml(m) {
      var html = '<div class="msg ' + (m.role === 'user' ? 'user' : 'ai') + '">';
      html += '<div class="bubble">' + UI.escape(m.text) + '</div>';
      if (m.citations && m.citations.length) {
        html += '<div class="cites">' + m.citations.map(function (c) { return UI.src(c); }).join('') + '</div>';
      }
      if (m.insufficientNote) {
        html += '<div class="badge-insuff">' + UI.escape(m.insufficientNote) + '</div>';
      }
      if (m.insight) {
        html += '<div class="note ok"><b>Learning insight</b><br>' + UI.escape(m.insight) + '</div>';
      }
      html += '<div class="msg-meta">' + (m.role === 'user' ? 'You' : provider.name) + '</div></div>';
      return html;
    }

    function logEl() { return document.getElementById('dg-log'); }
    function scrollLog() { var el = logEl(); if (el) el.scrollTop = el.scrollHeight; }
    function setInputEnabled(enabled) {
      var input = document.getElementById('dg-input');
      var send = document.getElementById('dg-send');
      if (input) { input.disabled = !enabled; input.placeholder = enabled ? ('Ask about ' + machine.name + '…') : 'Playback in progress…'; }
      if (send) send.disabled = !enabled;
    }

    function appendTyping() {
      var el = logEl(); if (!el) return null;
      var wrap = document.createElement('div');
      wrap.className = 'msg ai'; wrap.id = 'dg-typing';
      wrap.innerHTML = '<div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
      el.appendChild(wrap); scrollLog();
      return wrap;
    }
    function removeTyping() { var t = document.getElementById('dg-typing'); if (t) t.remove(); }

    function playSession(s) {
      clearTimers();
      current = s;
      document.getElementById('dg-sessions').innerHTML = renderSessionList();
      var el = logEl(); el.innerHTML = '';
      setInputEnabled(false); // held until scripted playback finishes, so a live send can never interleave with it
      var i = 0;
      function step() {
        if (i >= s.messages.length) { setInputEnabled(true); return; }
        var m = s.messages[i]; i += 1;
        if (m.role === 'user') {
          el.insertAdjacentHTML('beforeend', bubbleHtml(m));
          scrollLog();
          later(step, 500);
        } else {
          appendTyping();
          later(function () {
            removeTyping();
            el.insertAdjacentHTML('beforeend', bubbleHtml(m));
            scrollLog();
            later(step, 650);
          }, 800);
        }
      }
      step();
    }

    function startFresh() {
      clearTimers();
      current = null;
      freshLog = [];
      document.getElementById('dg-sessions').innerHTML = renderSessionList();
      logEl().innerHTML = '<div class="empty"><div class="k">New session</div>Ask a question about ' + UI.escape(machine.name) + ' — answers cite the machine’s indexed documents, or say so honestly when nothing matches.</div>';
      setInputEnabled(true);
    }

    var KEYWORD_STOP = { 'the': 1, 'is': 1, 'a': 1, 'on': 1, 'for': 1, 'and': 1, 'of': 1, 'to': 1, 'what': 1, 'why': 1, 'how': 1, 'are': 1, 'my': 1, 'i': 1, 'it': 1 };
    function keywordsOf(text) {
      return String(text).toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2 && !KEYWORD_STOP[w]; });
    }
    function findMatch(question) {
      var kws = keywordsOf(question);
      var docs = DATA.documents.filter(function (d) { return d.machineId === machine.id; });
      var best = null, bestScore = 0;
      docs.forEach(function (d) {
        var hay = (d.title + ' ' + d.category + ' ' + d.filename).toLowerCase();
        var score = kws.reduce(function (acc, k) { return acc + (hay.indexOf(k) >= 0 ? 1 : 0); }, 0);
        if (score > bestScore) { bestScore = score; best = d; }
      });
      return bestScore > 0 ? best : null;
    }

    function sendFreeText() {
      var input = document.getElementById('dg-input');
      var text = input.value.trim();
      if (!text) return;
      if (!current) {
        if (!logEl().querySelector('.msg')) logEl().innerHTML = '';
      }
      var userMsg = { role: 'user', text: text };
      logEl().insertAdjacentHTML('beforeend', bubbleHtml(userMsg));
      input.value = '';
      scrollLog();
      setInputEnabled(false); // held until this reply lands, so a second send can't interleave with it
      appendTyping();
      later(function () {
        removeTyping();
        var doc = findMatch(text);
        var reply;
        if (doc) {
          reply = {
            role: 'ai',
            text: 'Based on ' + machine.name + '’s indexed documentation, “' + doc.title + '” is the most relevant source for that — it’s a ' + doc.category.toLowerCase() + ' record with ' + doc.chunks + ' indexed chunks. Ask a more specific follow-up (a fault code, tag name, or component) for a grounded, cited answer.',
            citations: [{ title: doc.filename, date: UI.fmtDate(doc.uploadedAt) }]
          };
        } else {
          reply = {
            role: 'ai',
            text: 'I don’t have indexed documentation covering that for ' + machine.name + '.',
            insufficientNote: 'No matching document found in ' + machine.name + '’s memory — try rephrasing with a specific component, fault code, or tag name rather than asking again as-is.'
          };
        }
        logEl().insertAdjacentHTML('beforeend', bubbleHtml(reply));
        scrollLog();
        setInputEnabled(true);
      }, 900);
    }

    document.getElementById('dg-sessions').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-session]');
      if (!btn) return;
      var s = sessions.filter(function (x) { return String(x.id) === btn.getAttribute('data-session'); })[0];
      if (s) playSession(s);
    });
    var startBtn = document.getElementById('dg-start-fresh');
    if (startBtn) startBtn.addEventListener('click', startFresh);
    document.getElementById('dg-send').addEventListener('click', sendFreeText);
    document.getElementById('dg-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFreeText(); }
    });
    document.getElementById('dg-provider-select').addEventListener('change', function (e) {
      var p = DATA.providers.filter(function (x) { return x.key === e.target.value; })[0];
      if (p) document.getElementById('dg-provider-chip').textContent = p.name + ' · ' + p.model;
    });

    // Cross-tab handoff from History, or auto-open the most recent session.
    var pending = window.APP_STATE.pendingSessionId;
    var toOpen = null;
    if (pending != null) {
      toOpen = sessions.filter(function (s) { return s.id === pending; })[0] || null;
      window.APP_STATE.pendingSessionId = null;
    }
    if (!toOpen && sessions.length) toOpen = sessions[0];
    if (toOpen) playSession(toOpen); else startFresh();

    return function cleanup() { clearTimers(); };
  };
})();
