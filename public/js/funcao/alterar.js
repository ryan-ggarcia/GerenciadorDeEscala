document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('btn-Alterar').addEventListener('click', alterar)
})
function alterar(){
    const id = document.getElementById('id')
    const nome = document.getElementById('nome')
    const descricao = document.getElementById('descricao')

    nome.style.borderColor = 'green'

    if(validation([id, nome])){
        fetch(`/funcao/alterar/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id.value,
                nome: nome.value,
                descricao: descricao.value
            })
        })
            .then(res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Alteração realizada com sucesso',
                        text: 'A função foi alterada com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao alterar',
                        text: 'Ocorreu um erro ao alterar a função. Por favor, tente novamente.',
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
