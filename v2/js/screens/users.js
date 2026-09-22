/*
 * SCREENS.users — lightweight admin panel: users table + the 3-role model.
 */
(function () {
  function render(mount, route, c) {
    var UI = c.ui, DATA = c.data;

    var rows = DATA.users.map(function (u) {
      return '<tr class="row"><td>' + UI.escape(u.name) + '</td><td class="mono mute">' + UI.escape(u.email) + '</td>' +
        '<td>' + UI.plate(DATA.roles[u.role].label) + '</td></tr>';
    }).join('');

    var roleCards = Object.keys(DATA.roles).map(function (key) {
      var r = DATA.roles[key];
      return '<div class="panel"><div class="ph">' + UI.escape(r.label) + '</div><div class="pb mute" style="font-size:12px">' + UI.escape(r.desc) + '</div></div>';
    }).join('');

    mount.innerHTML =
      '<div class="panel" style="margin-bottom:14px"><div class="ph">Users<span class="grow"></span>' +
      '<button class="btn primary" id="user-add">Add User</button></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +

      '<div class="panel"><div class="ph">Role Model</div><div class="pb stack">' +
      '<div class="card-grid">' + roleCards + '</div>' +
      '<div class="note info" style="margin-top:10px">Access is enforced through granular per-page and per-action permissions, grouped by role and overridable per user — not shown item-by-item in this preview.</div>' +
      '</div></div>';

    document.getElementById('user-add').addEventListener('click', function () {
      UI.openModal(
        '<div class="mh">Add User</div>' +
        '<div class="mb stack">' +
        '<div class="field"><label>Name</label><input class="input" placeholder="Full name"></div>' +
        '<div class="field"><label>Email</label><input class="input" placeholder="name@company.com"></div>' +
        '<div class="field"><label>Role</label><select class="select">' +
        Object.keys(DATA.roles).map(function (k) { return '<option value="' + k + '">' + UI.escape(DATA.roles[k].label) + '</option>'; }).join('') +
        '</select></div></div>' +
        '<div class="mf"><button class="btn ghost" id="ua-cancel">Cancel</button><button class="btn primary" id="ua-submit">Add User</button></div>'
      );
      document.getElementById('ua-cancel').addEventListener('click', UI.closeModal);
      document.getElementById('ua-submit').addEventListener('click', function () {
        UI.closeModal();
        UI.toast('Demo mode — user management changes are disabled in this preview.', 'info');
      });
    });
  }

  window.SCREENS.users = render;
})();
