export default class IndisponivelModel{
    #ind_id
    #aco_id
    #ind_data_inicio
    #ind_data_fim
    #ind_motivo
    #acolito

    constructor(ind_id,aco_id,ind_data_inicio,ind_data_fim,ind_motivo,acolito){
        this.#ind_id = ind_id
        this.#aco_id = aco_id
        this.#ind_data_inicio = ind_data_inicio
        this.#ind_data_fim = ind_data_fim
        this.#ind_motivo = ind_motivo
        this.#acolito = acolito
    }

    get ind_id(){ return this.#ind_id }
    get aco_id(){ return this.#aco_id }
    get ind_data_inicio(){ return this.#ind_data_inicio }
    get ind_data_fim(){ return this.#ind_data_fim }
    get ind_motivo(){ return this.#ind_motivo }
    get acolito(){ return this.#acolito }

    set ind_id(ind_id){ this.#ind_id = ind_id }
    set aco_id(aco_id){ this.#aco_id = aco_id }
    set ind_data_inicio(ind_data_inicio){ this.#ind_data_inicio = ind_data_inicio }
    set ind_data_fim(ind_data_fim){ this.#ind_data_fim = ind_data_fim }
    set ind_motivo(ind_motivo){ this.#ind_motivo = ind_motivo }
    set acolito(acolito){ this.#acolito = acolito }

    toJSON() {
        return {
            ind_id: this.#ind_id,
            aco_id: this.#aco_id,
            ind_data_inicio: this.#ind_data_inicio,
            ind_data_fim: this.#ind_data_fim,
            ind_motivo: this.#ind_motivo,
            acolito: this.#acolito
        }
    }

}
