/*
 * WorkspaceTabs.history — past diagnostic sessions for this machine.
 * Clicking a row hands off to the Diagnose tab via APP_STATE.pendingSessionId.
 */
(function () {
  WorkspaceTabs.history = function (mount, machine, ctx) {
    var UI = ctx.ui, DATA = ctx.data;
    var sessions = DATA.diagnosticSessions.filter(function (s) { return s.machineId === machine.id; });

    if (!sessions.length) {
      mount.innerHTML = '<div class="empty"><div class="k">No diagnostic history yet</div>Sessions started from the Diagnose tab will appear here.</div>';
      return function cleanup() {};
    }

    mount.innerHTML =
      '<div class="panel"><div class="ph">Diagnostic History<span class="grow"></span><span class="num">' + sessions.length + ' sessions</span></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Session</th><th>Provider</th><th>Started</th><th class="n">Messages</th><th>Tags</th></tr></thead>' +
      '<tbody id="hist-body">' + sessions.map(function (s) {
        var provider = DATA.providers.filter(function (p) { return p.key === s.provider; })[0];
        return '<tr class="row" data-session="' + s.id + '" style="cursor:pointer">' +
          '<td>' + UI.escape(s.title) + '<div class="mute" style="font-size:10.5px">' + UI.escape(s.id) + '</div></td>' +
          '<td>' + UI.escape(provider ? provider.name : s.provider) + '</td>' +
          '<td class="mono" style="font-size:11.5px">' + UI.fmtDateTime(s.startedAt) + '</td>' +
          '<td class="n">' + s.messages.length + '</td>' +
          '<td>' + (s.tagged || []).map(function (t) { return UI.chip(t, false, false); }).join(' ') + '</td>' +
          '</tr>';
      }).join('') + '</tbody></table></div></div>';

    document.getElementById('hist-body').addEventListener('click', function (e) {
      var row = e.target.closest('[data-session]');
      if (!row) return;
      window.APP_STATE.pendingSessionId = row.getAttribute('data-session');
      ctx.navigate('#/fleet/' + machine.id + '/diagnose');
    });

    return function cleanup() {};
  };
})();
