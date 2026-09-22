/*
 * SCREENS.settings — AI Providers (default/test-connection) + Account
 * (forced password-rotation banner as a deliberate feature demo).
 */
(function () {
  var localProviders = null;

  function render(mount, route, c) {
    var UI = c.ui, DATA = c.data;
    if (!localProviders) localProviders = DATA.providers.map(function (p) { return Object.assign({}, p); });
    var user = c.state.user || DATA.users[0];

    function providerRows() {
      return localProviders.map(function (p) {
        return '<tr class="row"><td>' + UI.escape(p.name) + '</td><td class="mono mute">' + UI.escape(p.model) + '</td>' +
          '<td>' + (p.status === 'connected' ? UI.state('Connected', 'ok') : UI.state('Not Configured', 'warn')) + '</td>' +
          '<td>' + (p.isDefault ? UI.plate('Default') : '') + '</td>' +
          '<td class="row" style="gap:6px">' +
          '<button class="btn sm ghost" data-test="' + p.key + '">Test Connection</button>' +
          (p.isDefault ? '' : '<button class="btn sm" data-default="' + p.key + '">Set Default</button>') +
          '</td></tr>';
      }).join('');
    }

    function renderAll() {
      mount.innerHTML =
        '<div class="panel" style="margin-bottom:14px"><div class="ph">AI Providers</div>' +
        '<div class="tw"><table class="t"><thead><tr><th>Provider</th><th>Model</th><th>Status</th><th></th><th></th></tr></thead>' +
        '<tbody>' + providerRows() + '</tbody></table></div></div>' +

        '<div class="panel"><div class="ph">Account</div><div class="pb stack">' +
        '<div class="note warn"><b>Password rotation required.</b> This account is flagged for a mandatory password change before continuing — modeled after the real product’s forced-rotation guardrail.' +
        ' <button class="btn sm" id="pw-open" style="margin-left:8px">Change Password</button></div>' +
        '<div class="row" style="gap:14px">' +
        '<div class="field"><label>Name</label><input class="input" value="' + UI.escape(user.name) + '" readonly></div>' +
        '<div class="field"><label>Email</label><input class="input" value="' + UI.escape(user.email) + '" readonly></div>' +
        '<div class="field"><label>Role</label><input class="input" value="' + UI.escape(DATA.roles[user.role].label) + '" readonly></div>' +
        '</div></div></div>';

      mount.querySelectorAll('[data-test]').forEach(function (b) {
        b.addEventListener('click', function () {
          var ms = 220 + Math.floor(Math.random() * 260);
          UI.toast('Connected — ' + ms + 'ms', 'ok', 2600);
        });
      });
      mount.querySelectorAll('[data-default]').forEach(function (b) {
        b.addEventListener('click', function () {
          var key = b.getAttribute('data-default');
          localProviders.forEach(function (p) { p.isDefault = (p.key === key); });
          UI.toast('Default provider set.', 'ok', 2200);
          renderAll();
        });
      });
      document.getElementById('pw-open').addEventListener('click', function () {
        UI.openModal(
          '<div class="mh">Change Password</div>' +
          '<div class="mb stack">' +
          '<div class="field"><label>New Password</label><input class="input" type="password" placeholder="••••••••"></div>' +
          '<div class="field"><label>Confirm Password</label><input class="input" type="password" placeholder="••••••••"></div>' +
          '</div>' +
          '<div class="mf"><button class="btn ghost" id="pw-cancel">Cancel</button><button class="btn primary" id="pw-submit">Update Password</button></div>'
        );
        document.getElementById('pw-cancel').addEventListener('click', UI.closeModal);
        document.getElementById('pw-submit').addEventListener('click', function () {
          UI.closeModal();
          UI.toast('Password updated (demo).', 'ok', 2600);
        });
      });
    }

    renderAll();
  }

  window.SCREENS.settings = render;
})();
