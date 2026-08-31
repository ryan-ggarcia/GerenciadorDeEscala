// Comportamento das listagens:
//  - sem busca: mostra só os primeiros LIMITE registros (o resto fica oculto);
//  - com busca: mostra TODOS os registros que contêm o termo.
// Uso: <input data-table-filter="#id-da-tabela" ...>  (ou apenas [data-table-filter]
// para filtrar a primeira .table dentro do mesmo card/painel).
document.addEventListener('DOMContentLoaded', function () {
    var LIMITE = 15;

    document.querySelectorAll('[data-table-filter]').forEach(function (input) {
        var selector = input.getAttribute('data-table-filter');
        var table = selector
            ? document.querySelector(selector)
            : (input.closest('.panel, .card') || document).querySelector('table');
        if (!table) return;

        var counter = document.querySelector(input.getAttribute('data-table-count') || '.panel__count');

        function apply() {
            var term = input.value.trim().toLowerCase();
            var rows = [];
            table.querySelectorAll('tbody tr').forEach(function (row) {
                if (row.dataset.noFilter === undefined) rows.push(row);
            });

            var total = rows.length;
            var matches = term
                ? rows.filter(function (row) { return row.textContent.toLowerCase().indexOf(term) !== -1; })
                : rows;

            var visiveis = term ? matches : matches.slice(0, LIMITE);
            var visivelSet = new Set(visiveis);
            rows.forEach(function (row) { row.hidden = !visivelSet.has(row); });

            if (counter) {
                if (term) {
                    counter.textContent = matches.length + (matches.length === 1 ? ' registro' : ' registros') +
                        (matches.length !== total ? ' de ' + total : '');
                } else if (total > LIMITE) {
                    counter.textContent = 'Mostrando ' + LIMITE + ' de ' + total + ' · pesquise para ver todos';
                } else {
                    counter.textContent = total + (total === 1 ? ' registro' : ' registros');
                }
            }
        }

        input.addEventListener('input', apply);
        apply();
    });
});
