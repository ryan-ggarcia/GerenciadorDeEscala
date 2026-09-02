// Sorteador de escala do mês: sorteia todas as missas do mês de uma vez no servidor,
// deixa o usuário marcar as solenes e ajustar cada função, e só grava ao confirmar.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-Sortear').addEventListener('click', sortearMes);
});

let mesAtual = null;

function painel() { return document.getElementById('proposta'); }

function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

function horaBR(h) { return h ? String(h).slice(0, 5) : ''; }
// a data vem do servidor como 'YYYY-MM-DD' — tratar como texto (sem new Date, sem fuso)
function dataBR(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ''));
    return m ? m[3] + '/' + m[2] + '/' + m[1] : String(d || '');
}

// mis_id das missas marcadas como solene na prévia atual (vazio na 1ª vez)
function solenesMarcadas() {
    return Array.prototype.slice.call(
        painel().querySelectorAll('[data-mis] [data-solene]:checked')
    ).map(function (chk) { return chk.closest('[data-mis]').getAttribute('data-mis'); });
}

function sortearMes() {
    const mes = document.getElementById('mes').value;
    if (!mes) {
        Swal.fire({ icon: 'error', title: 'Selecione o mês', confirmButtonText: 'OK' });
        return;
    }

    fetch('/escala/sorteador/sortear-mes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes: mes, solenes: solenesMarcadas() })
    })
        .then(async function (res) {
            const data = await res.json().catch(function () { return {}; });
            if (!res.ok || !data.ok) throw new Error(data.erro || 'Não foi possível sortear.');
            render(data);
        })
        .catch(function (err) {
            Swal.fire({ icon: 'error', title: 'Erro ao sortear', text: err.message, confirmButtonText: 'OK' });
        });
}

function vagasDe(itens) {
    return itens.filter(function (it) { return !it.faltaCadastro && !it.aco_id; });
}

// Linhas de função de uma missa (recomputadas ao marcar/desmarcar "solene").
function linhasMissa(itens, solene) {
    if (!itens.length) {
        return '<div class="assignment"><span class="cell-muted">' +
            (solene
                ? 'Funções da missa solene não cadastradas em Funções.'
                : 'Funções “Missal” e “Auxiliar” não cadastradas em Funções.') +
            '</span></div>';
    }

    let h = '';
    itens.forEach(function (it) {
        h += '<div class="assignment" data-fun="' + esc(it.fun_id == null ? '' : it.fun_id) + '">';
        h += '<span class="assignment__role">' + esc(it.fun_nome) + '</span>';

        if (it.faltaCadastro) {
            h += '<span class="cell-muted">função não cadastrada</span>';
        } else if (!it.candidatos.length) {
            h += '<span class="badge-status badge-status--warn">ninguém apto/disponível</span>';
        } else {
            h += '<select class="form-select form-select-sm" data-pick style="flex:1 1 auto;max-width:18rem">';
            h += '<option value="">— vago —</option>';
            it.candidatos.forEach(function (c) {
                const s = String(c.aco_id) === String(it.aco_id) ? ' selected' : '';
                h += '<option value="' + esc(c.aco_id) + '"' + s + '>' + esc(c.aco_nome) + '</option>';
            });
            h += '</select>';
        }
        h += '</div>';
    });

    const vagas = vagasDe(itens);
    if (vagas.length) {
        h += '<div class="assignment" style="color:var(--warn);font-size:.8rem">' +
            '<i class="bi bi-exclamation-triangle"></i>&nbsp;' + vagas.length + ' sem acólito: ' +
            esc(vagas.map(function (v) { return v.fun_nome; }).join(', ')) + '</div>';
    }
    return h;
}

function blocoMissa(m) {
    const id = esc(m.mis_id);
    let h = '<div class="liturgy-block" data-mis="' + id + '">';
    h += '<span class="liturgy-block__taper" aria-hidden="true"></span>';

    h += '<div class="liturgy-block__head">';
    h += '<h3 class="liturgy-block__title">' + esc(m.mis_nome) + '</h3>';
    h += '<span class="liturgy-block__time">' + esc(dataBR(m.mis_dia)) +
        (m.mis_hora_inicio ? ' &middot; ' + esc(horaBR(m.mis_hora_inicio)) : '') + '</span>';
    h += '</div>';

    h += '<div class="assignment" style="gap:.6rem">';
    h += '<div class="form-check form-switch m-0">';
    h += '<input class="form-check-input" type="checkbox" role="switch" id="sol-' + id + '" data-solene' +
        (m.solene ? ' checked' : '') + '>';
    h += '<label class="form-check-label" for="sol-' + id + '">Missa solene (6 funções)</label>';
    h += '</div>';
    if (m.jaEscalados) {
        h += '<span class="badge-status badge-status--warn" style="margin-left:auto">' +
            m.jaEscalados + ' já escalado(s)</span>';
    }
    h += '</div>';

    h += '<div data-linhas>' + linhasMissa(m.itens, m.solene) + '</div>';
    h += '</div>';
    return h;
}

function render(data) {
    mesAtual = data.mes;

    const totalVagas = data.missas.reduce(function (s, m) { return s + vagasDe(m.itens).length; }, 0);

    let html = '<h2 class="day-panel__date">Prévia &mdash; ' + esc(data.rotulo || data.mes) + '</h2>';
    html += '<p class="day-panel__sub">' + data.missas.length + ' missa(s) no mês' +
        (totalVagas ? ' &middot; <strong style="color:var(--warn)">' + totalVagas + ' função(ões) sem acólito</strong>' : '') +
        ' &middot; marque as solenes, ajuste os acólitos e salve</p>';

    data.missas.forEach(function (m) { html += blocoMissa(m); });

    html += '<div class="d-flex gap-2 mt-3">' +
        '<button type="button" class="btn btn-outline-accent" id="btn-Resortear"><i class="bi bi-shuffle"></i> Sortear novamente</button>' +
        '<button type="button" class="btn btn-primary" id="btn-Salvar"><i class="bi bi-check2"></i> Salvar escala do mês</button>' +
        '</div>';

    const p = painel();
    p.innerHTML = html;
    p.hidden = false;
    p.scrollIntoView({ block: 'nearest' });

    document.getElementById('btn-Resortear').addEventListener('click', sortearMes);
    document.getElementById('btn-Salvar').addEventListener('click', salvar);

    Array.prototype.slice.call(p.querySelectorAll('[data-mis] [data-solene]')).forEach(function (chk) {
        chk.addEventListener('change', function () { redesenharBloco(chk.closest('[data-mis]')); });
    });
}

// Ao marcar/desmarcar "solene", re-sorteia só aquela missa (preserva os ajustes das outras).
function redesenharBloco(bloco) {
    const mis_id = bloco.getAttribute('data-mis');
    const solene = bloco.querySelector('[data-solene]').checked;
    const alvo = bloco.querySelector('[data-linhas]');
    alvo.style.opacity = '.45';

    fetch('/escala/sorteador/sortear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mis_id: mis_id, solene: solene })
    })
        .then(async function (res) {
            const data = await res.json().catch(function () { return {}; });
            if (!res.ok || !data.ok) throw new Error(data.erro || 'Não foi possível re-sortear.');
            alvo.innerHTML = linhasMissa(data.itens, solene);
            alvo.style.opacity = '';
        })
        .catch(function (err) {
            alvo.style.opacity = '';
            Swal.fire({ icon: 'error', title: 'Erro', text: err.message, confirmButtonText: 'OK' });
        });
}

function salvar() {
    const blocos = Array.prototype.slice.call(painel().querySelectorAll('[data-mis]'));
    const missas = [];
    let total = 0;

    for (const bloco of blocos) {
        const mis_id = bloco.getAttribute('data-mis');
        const itens = [];
        const vistos = new Set();

        const linhas = Array.prototype.slice.call(bloco.querySelectorAll('[data-fun]'));
        for (const row of linhas) {
            const fun_id = row.getAttribute('data-fun');
            const sel = row.querySelector('[data-pick]');
            if (!fun_id || !sel || !sel.value) continue;
            if (vistos.has(sel.value)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acólito repetido',
                    text: 'Há um acólito em duas funções na mesma missa. Ajuste antes de salvar.',
                    confirmButtonText: 'OK'
                });
                return;
            }
            vistos.add(sel.value);
            itens.push({ fun_id: fun_id, aco_id: sel.value });
        }

        if (itens.length) { missas.push({ mis_id: mis_id, itens: itens }); total += itens.length; }
    }

    if (!total) {
        Swal.fire({ icon: 'error', title: 'Nada para salvar', text: 'Selecione ao menos um acólito.', confirmButtonText: 'OK' });
        return;
    }

    Swal.fire({
        title: 'Salvar escala do mês?',
        text: total + ' escalação(ões) em ' + missas.length + ' missa(s).',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar'
    }).then(function (r) {
        if (!r.isConfirmed) return;
        fetch('/escala/sorteador/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missas: missas })
        })
            .then(async function (res) {
                const data = await res.json().catch(function () { return {}; });
                if (!res.ok || !data.ok) throw new Error(data.erro || 'Não foi possível salvar.');
                if (data.ignorados) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Escala salva',
                        text: data.ignorados + ' escalação(ões) foram ignoradas porque o acólito está indisponível na data.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    await Swal.fire({ icon: 'success', title: 'Escala do mês salva', timer: 1800, showConfirmButton: false });
                }
                window.location.href = '/escala';
            })
            .catch(function (err) {
                Swal.fire({ icon: 'error', title: 'Erro ao salvar', text: err.message, confirmButtonText: 'OK' });
            });
    });
}
