document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-Cadastro').addEventListener('click', cadastrar)
})
function cadastrar() {
    const name = document.getElementById('name');
    const date = document.getElementById('date');
    const timeStart = document.getElementById('timeStart');
    const timeEnd = document.getElementById('timeEnd');
    const location = document.getElementById('location');
    const observations = document.getElementById('observations');

    name.style.borderColor = 'green';
    date.style.borderColor = 'green';
    timeStart.style.borderColor = 'green';
    timeEnd.style.borderColor = 'green';
    location.style.borderColor = 'green';

    if (validation([name, date, timeStart, timeEnd, location])) {
        fetch('/missa/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name.value,
                date: date.value,
                timeStart: timeStart.value,
                timeEnd: timeEnd.value,
                location: location.value
            })
        })
            .then(res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cadastro realizado com sucesso',
                        text: 'A missa foi cadastrada com sucesso.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao cadastrar',
                        text: 'Ocorreu um erro ao cadastrar a missa. Por favor, tente novamente.',
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