export default class AcolitosModel{
    #aco_id
    #aco_nome
    #aco_status

    constructor(aco_id,aco_nome,aco_status){
        this.#aco_id = aco_id
        this.#aco_nome = aco_nome
        this.#aco_status = aco_status
    }

    get aco_id(){ return this.#aco_id }
    get aco_nome(){ return this.#aco_nome }
    get aco_status(){ return this.#aco_status }

    set aco_id(aco_id){ this.#aco_id = aco_id }
    set aco_nome(aco_nome){ this.#aco_nome = aco_nome }
    set aco_status(aco_status){ this.#aco_status = aco_status }

    toJSON() {
        return {
            aco_id: this.#aco_id,
            aco_nome: this.#aco_nome,
            aco_status: this.#aco_status
        }
    }

}
