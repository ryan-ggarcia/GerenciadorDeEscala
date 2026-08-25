document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('btn-Alterar').addEventListener('click', alterar)
})
function alterar(){
    const id = document.getElementById('id')
    const aco_id = document.getElementById('aco_id')
    const dataInicio = document.getElementById('dataInicio')
    const dataFim = document.getElementById('dataFim')
    const motivo = document.getElementById('motivo')

    aco_id.style.borderColor = 'green'
    dataInicio.style.borderColor = 'green'
    dataFim.style.borderColor = 'green'

    if(validation([id, aco_id, dataInicio, dataFim])){
        fetch(`/indisponivel/alterar/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id.value,
                aco_id: aco_id.value,
                dataInicio: dataInicio.value,
                dataFim: dataFim.value,
                motivo: motivo.value
            })
        })
            .then(res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Alteração realizada com sucesso',
                        text: 'A indisponibilidade foi alterada com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao alterar',
                        text: 'Ocorreu um erro ao alterar a indisponibilidade. Por favor, tente novamente.',
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
