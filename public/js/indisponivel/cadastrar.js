document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-Cadastro').addEventListener('click', cadastrar)
})
function cadastrar() {
    const aco_id = document.getElementById('aco_id');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    const motivo = document.getElementById('motivo');

    aco_id.style.borderColor = 'green';
    dataInicio.style.borderColor = 'green';
    dataFim.style.borderColor = 'green';

    if (validation([aco_id, dataInicio, dataFim])) {
        fetch('/indisponivel/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aco_id: aco_id.value,
                dataInicio: dataInicio.value,
                dataFim: dataFim.value,
                motivo: motivo.value
            })
        })
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    const n = data.escalasRemovidas || 0;
                    Swal.fire({
                        icon: 'success',
                        title: 'Indisponibilidade cadastrada',
                        text: n
                            ? n + ' escalação(ões) do acólito nesse período foram removidas.'
                            : 'A indisponibilidade foi cadastrada com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao cadastrar',
                        text: 'Ocorreu um erro ao cadastrar a indisponibilidade. Por favor, tente novamente.',
                        confirmButtonText: 'OK'
                    });
                }
            })
    }
}



function validation(dados) {
    if (dados.some(input => input.value.trim() === "")) {
        Swal.fire({
            icon: 'error',
            title: 'Campos obrigatórios não preenchidos',
            text: 'Por favor, preencha todos os campos obrigatórios antes de enviar o formulário.',
            confirmButtonText: 'OK'
        });
        dados.forEach(input => {
            if (input.value.trim() === "") {
                input.style.borderColor = 'red';
            }
        });
        return false;
    }
    return true;
}
