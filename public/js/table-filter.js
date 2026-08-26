// Busca client-side nas listagens: filtra as linhas da tabela conforme o texto.
// Uso: <input data-table-filter="#id-da-tabela" ...>  (ou apenas [data-table-filter]
// para filtrar a primeira .table dentro do mesmo card/painel).
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-table-filter]').forEach(function (input) {
        var selector = input.getAttribute('data-table-filter');
        var table = selector
            ? document.querySelector(selector)
            : (input.closest('.panel, .card') || document).querySelector('table');
        if (!table) return;

        var counter = document.querySelector(input.getAttribute('data-table-count') || '.panel__count');

        function apply() {
            var term = input.value.trim().toLowerCase();
            var shown = 0;
            table.querySelectorAll('tbody tr').forEach(function (row) {
                if (row.dataset.noFilter !== undefined) return;
                var hit = row.textContent.toLowerCase().indexOf(term) !== -1;
                row.hidden = !hit;
                if (hit) shown++;
            });
            if (counter) counter.textContent = shown + (shown === 1 ? ' registro' : ' registros');
        }

        input.addEventListener('input', apply);
        apply();
    });
});
