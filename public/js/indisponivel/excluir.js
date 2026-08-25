
document.addEventListener("DOMContentLoaded", function () {
    let btn = document.querySelectorAll(".btn")
    btn.forEach(b => { b.addEventListener("click", deletar) })
})

function deletar() {
    const id = this.dataset.id

        fetch("/indisponivel/deletar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: id
            })
        })
            .then(res => {
                try {
                    if (res.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Indisponibilidade excluída com sucesso!',
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
                        text: 'Não foi possível atualizar a indisponibilidade, tente novamente mais tarde',
                        confirmButtonAriaLabel: "OK"
                    })
                }
        })
}
