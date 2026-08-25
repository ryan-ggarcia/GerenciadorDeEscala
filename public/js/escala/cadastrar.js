document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-Cadastro').addEventListener('click', cadastrar)
})
function cadastrar() {
    const mis_id = document.getElementById('mis_id');
    const aco_id = document.getElementById('aco_id');
    const fun_id = document.getElementById('fun_id');

    mis_id.style.borderColor = 'green';
    aco_id.style.borderColor = 'green';
    fun_id.style.borderColor = 'green';

    if (validation([mis_id, aco_id, fun_id])) {
        fetch('/escala/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mis_id: mis_id.value,
                aco_id: aco_id.value,
                fun_id: fun_id.value
            })
        })
            .then(res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cadastro realizado com sucesso',
                        text: 'A escala foi cadastrada com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao cadastrar',
                        text: 'Ocorreu um erro ao cadastrar a escala. Por favor, tente novamente.',
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
