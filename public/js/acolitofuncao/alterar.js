document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('btn-Alterar').addEventListener('click', alterar)
})
function alterar(){
    const old_aco_id = document.getElementById('old_aco_id')
    const old_fun_id = document.getElementById('old_fun_id')
    const aco_id = document.getElementById('aco_id')
    const fun_id = document.getElementById('fun_id')
    const podeServir = document.getElementById('podeServir')

    aco_id.style.borderColor = 'green'
    fun_id.style.borderColor = 'green'

    if(validation([old_aco_id, old_fun_id, aco_id, fun_id])){
        fetch(`/acolitofuncao/alterar/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oldAcoId: old_aco_id.value,
                oldFunId: old_fun_id.value,
                aco_id: aco_id.value,
                fun_id: fun_id.value,
                podeServir: podeServir.checked
            })
        })
            .then(res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Alteração realizada com sucesso',
                        text: 'O vínculo acólito/função foi alterado com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao alterar',
                        text: 'Ocorreu um erro ao alterar o vínculo acólito/função. Por favor, tente novamente.',
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
