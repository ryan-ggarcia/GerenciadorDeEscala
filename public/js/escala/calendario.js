// Calendário mensal da escala — renderizado no cliente a partir de #escala-data.
// Clicar num dia com escala abre o painel de detalhe; a exclusão é feita ali.
(function () {
    var root = document.getElementById('calendar');
    var panel = document.querySelector('[data-cal-panel]');
    if (!root || !panel) return;

    var grid = root.querySelector('[data-cal-grid]');
    var label = root.querySelector('[data-cal-label]');

    var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    var DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var STATUS = { CONFIRMADO: 'ok', CONVOCADO: 'warn', RECUSADO: 'danger' };

    var DATA = [];
    try { DATA = JSON.parse(document.getElementById('escala-data').textContent || '[]'); } catch (e) { DATA = []; }

    var byDay = {};
    var view, selectedKey = null;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function keyOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

    function dateKey(raw) {
        if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        var d = new Date(raw);
        return keyOf(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function hora(h) { return h ? String(h).slice(0, 5) : ''; }
    function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function rebuildIndex() {
        byDay = {};
        DATA.forEach(function (e) {
            var k = dateKey(e.dia);
            (byDay[k] = byDay[k] || []).push(e);
        });
    }

    function pickInitialMonth() {
        var now = new Date();
        var y = now.getFullYear(), m = now.getMonth();
        var monthPrefix = y + '-' + pad(m + 1);
        var keys = Object.keys(byDay).sort();
        if (keys.some(function (k) { return k.indexOf(monthPrefix) === 0; })) return { y: y, m: m };
        var todayKey = keyOf(y, m, now.getDate());
        var future = keys.filter(function (k) { return k >= todayKey; });
        var pick = future.length ? future[0] : (keys.length ? keys[keys.length - 1] : null);
        if (!pick) return { y: y, m: m };
        var p = pick.split('-');
        return { y: +p[0], m: +p[1] - 1 };
    }

    function groupByMissa(items) {
        var groups = [];
        var seen = {};
        items.slice().sort(function (a, b) { return hora(a.hora).localeCompare(hora(b.hora)); }).forEach(function (e) {
            var gk = (e.missa || '') + '|' + (e.hora || '');
            if (!seen[gk]) { seen[gk] = { missa: e.missa, hora: e.hora, itens: [] }; groups.push(seen[gk]); }
            seen[gk].itens.push(e);
        });
        return groups;
    }

    function render() {
        var now = new Date();
        var todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());
        label.textContent = cap(MONTHS[view.m]) + ' ' + view.y;

        var first = new Date(view.y, view.m, 1).getDay();
        var days = new Date(view.y, view.m + 1, 0).getDate();
        var cells = [];

        DOW.forEach(function (d) { cells.push('<div class="calendar__dow">' + d + '</div>'); });

        for (var i = 0; i < first; i++) cells.push('<div class="calendar__cell is-empty"></div>');

        for (var day = 1; day <= days; day++) {
            var k = keyOf(view.y, view.m, day);
            var evs = byDay[k] || [];
            var cls = 'calendar__cell';
            if (evs.length) cls += ' has-events';
            if (k === todayKey) cls += ' is-today';
            if (k === selectedKey) cls += ' is-selected';

            var inner = '<span class="calendar__daynum">' + day + '</span>';
            if (evs.length) {
                var groups = groupByMissa(evs);
                groups.slice(0, 2).forEach(function (g) {
                    inner += '<span class="calendar__event"><span class="dot"></span>' +
                        (g.hora ? esc(hora(g.hora)) + ' ' : '') + esc(g.missa) + '</span>';
                });
                if (groups.length > 2) inner += '<span class="calendar__more">+' + (groups.length - 2) + '</span>';
            }

            var tag = evs.length ? 'button type="button"' : 'div';
            cells.push('<' + tag + ' class="' + cls + '"' + (evs.length ? ' data-day="' + k + '"' : '') + '>' + inner + (evs.length ? '</button>' : '</div>'));
        }

        while ((cells.length - 7) % 7 !== 0) cells.push('<div class="calendar__cell is-empty"></div>');

        grid.innerHTML = cells.join('');
    }

    function renderPanel(k) {
        selectedKey = k;
        var items = byDay[k] || [];
        var parts = k.split('-');
        var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        var titulo = cap(d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

        var html = '<h2 class="day-panel__date">' + esc(titulo) + '</h2>';

        if (!items.length) {
            html += '<p class="day-panel__empty">Nenhum acólito escalado para este dia.</p>';
        } else {
            var groups = groupByMissa(items);
            html += '<p class="day-panel__sub">' + groups.length + (groups.length === 1 ? ' celebração' : ' celebrações') +
                ' &middot; ' + items.length + (items.length === 1 ? ' acólito escalado' : ' acólitos escalados') + '</p>';

            groups.forEach(function (g) {
                html += '<div class="liturgy-block"><span class="liturgy-block__taper" aria-hidden="true"></span>' +
                    '<div class="liturgy-block__head"><h3 class="liturgy-block__title">' + esc(g.missa) + '</h3>' +
                    (g.hora ? '<span class="liturgy-block__time">' + esc(hora(g.hora)) + '</span>' : '') + '</div>';
                g.itens.forEach(function (e) {
                    var s = STATUS[e.status] || 'muted';
                    html += '<div class="assignment">' +
                        '<span class="assignment__role">' + esc(e.funcao) + '</span>' +
                        '<span class="assignment__name">' + esc(e.acolito) + '</span>' +
                        '<span class="assignment__actions">' +
                        '<span class="badge-status badge-status--' + s + '">' + esc(e.status) + '</span>' +
                        '<a class="icon-btn" href="/escala/alterar/' + encodeURIComponent(e.id) + '" aria-label="Editar escala"><i class="bi bi-pencil"></i></a>' +
                        '<button type="button" class="icon-btn icon-btn--danger btn-excluir" data-id="' + esc(e.id) + '" aria-label="Remover da escala"><i class="bi bi-trash3"></i></button>' +
                        '</span></div>';
                });
                html += '</div>';
            });
        }

        html += '<a class="btn btn-outline-accent mt-2" href="/escala/cadastrar"><i class="bi bi-plus-lg"></i> Escalar acólito</a>';

        panel.innerHTML = html;
        panel.hidden = false;
        render();
        panel.scrollIntoView({ block: 'nearest' });
    }

    function hidePanel() { panel.hidden = true; panel.innerHTML = ''; selectedKey = null; render(); }

    grid.addEventListener('click', function (ev) {
        var cell = ev.target.closest('[data-day]');
        if (cell) renderPanel(cell.getAttribute('data-day'));
    });

    panel.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.btn-excluir');
        if (!btn) return;
        var id = btn.dataset.id;
        Swal.fire({
            title: 'Remover da escala?',
            text: 'O acólito deixará de constar nesta celebração.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Remover',
            cancelButtonText: 'Cancelar'
        }).then(function (r) {
            if (!r.isConfirmed) return;
            fetch('/escala/deletar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            }).then(function (res) {
                if (!res.ok) throw new Error();
                DATA = DATA.filter(function (e) { return String(e.id) !== String(id); });
                rebuildIndex();
                if (byDay[selectedKey]) renderPanel(selectedKey); else hidePanel();
                Swal.fire({ icon: 'success', title: 'Removido da escala', timer: 2000, showConfirmButton: false });
            }).catch(function () {
                Swal.fire({ icon: 'error', title: 'Não foi possível remover', text: 'Tente novamente mais tarde.' });
            });
        });
    });

    root.querySelector('[data-cal-prev]').addEventListener('click', function () {
        view.m--; if (view.m < 0) { view.m = 11; view.y--; } render();
    });
    root.querySelector('[data-cal-next]').addEventListener('click', function () {
        view.m++; if (view.m > 11) { view.m = 0; view.y++; } render();
    });
    root.querySelector('[data-cal-today]').addEventListener('click', function () {
        var n = new Date(); view = { y: n.getFullYear(), m: n.getMonth() }; render();
    });

    rebuildIndex();
    view = pickInitialMonth();
    render();
})();
