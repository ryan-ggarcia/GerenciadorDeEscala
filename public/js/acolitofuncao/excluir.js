
document.addEventListener("DOMContentLoaded", function () {
    let btn = document.querySelectorAll(".btn")
    btn.forEach(b => { b.addEventListener("click", deletar) })
})

function deletar() {
    const aco_id = this.dataset.acoId
    const fun_id = this.dataset.funId

        fetch("/acolitofuncao/deletar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                aco_id: aco_id,
                fun_id: fun_id
            })
        })
            .then(res => {
                try {
                    if (res.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Vínculo excluído com sucesso!',
                            timer: 3500
                        })
                        setTimeout(() => { window.location.reload() }, 3500)
                    }else {
                        Swal.fire
                    }
                }
                catch{
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro... na atualização',
                        text: 'Não foi possível atualizar o vínculo, tente novamente mais tarde',
                        confirmButtonAriaLabel: "OK"
                    })
                }
        })
}
