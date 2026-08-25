document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-Cadastro').addEventListener('click', cadastrar)
})
function cadastrar() {
    const nome = document.getElementById('nome');
    const descricao = document.getElementById('descricao');

    nome.style.borderColor = 'green';

    if (validation([nome])) {
        fetch('/funcao/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome.value,
                descricao: descricao.value
            })
        })
            .then(res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cadastro realizado com sucesso',
                        text: 'A função foi cadastrada com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao cadastrar',
                        text: 'Ocorreu um erro ao cadastrar a função. Por favor, tente novamente.',
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
