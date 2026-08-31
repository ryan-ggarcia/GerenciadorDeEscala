// Limpa escalas e missas de meses anteriores ao mês atual (mantém o mês corrente
// e os futuros). Mostra uma prévia com as contagens antes de confirmar.
document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btn-limpar-antigas');
    if (btn) btn.addEventListener('click', limpar);
});

function limpar() {
    var mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    fetch('/escala/limpar-antigas')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var escalas = data.escalas || 0;
            var missas = data.missas || 0;

            if (!escalas && !missas) {
                Swal.fire({
                    icon: 'info',
                    title: 'Nada a limpar',
                    text: 'Não há escalas nem missas de meses anteriores a ' + mesAtual + '.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            Swal.fire({
                icon: 'warning',
                title: 'Limpar meses passados?',
                html: 'Serão apagadas <b>' + escalas + '</b> escala(s) e <b>' + missas +
                    '</b> missa(s) de meses anteriores a <b>' + mesAtual + '</b>.<br>Esta ação não pode ser desfeita.',
                showCancelButton: true,
                confirmButtonText: 'Apagar',
                confirmButtonColor: '#a1382c',
                cancelButtonText: 'Cancelar'
            }).then(function (r) {
                if (!r.isConfirmed) return;
                fetch('/escala/limpar-antigas', { method: 'POST' })
                    .then(async function (res) {
                        var d = await res.json().catch(function () { return {}; });
                        if (!res.ok || !d.ok) throw new Error('Não foi possível limpar.');
                        await Swal.fire({
                            icon: 'success',
                            title: d.escalas + ' escala(s) e ' + d.missas + ' missa(s) removidas',
                            timer: 2200,
                            showConfirmButton: false
                        });
                        window.location.reload();
                    })
                    .catch(function (err) {
                        Swal.fire({ icon: 'error', title: 'Erro ao limpar', text: err.message, confirmButtonText: 'OK' });
                    });
            });
        })
        .catch(function () {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível consultar os registros antigos.', confirmButtonText: 'OK' });
        });
}
