export default class AcolitoFuncaoModel{
    #aco_id
    #fun_id
    #pode_servir
    #acolito
    #funcao

    constructor(aco_id,fun_id,pode_servir,acolito,funcao){
        this.#aco_id = aco_id
        this.#fun_id = fun_id
        this.#pode_servir = pode_servir
        this.#acolito = acolito
        this.#funcao = funcao
    }

    get aco_id(){ return this.#aco_id }
    get fun_id(){ return this.#fun_id }
    get pode_servir(){ return this.#pode_servir }
    get acolito(){ return this.#acolito }
    get funcao(){ return this.#funcao }

    set aco_id(aco_id){ this.#aco_id = aco_id }
    set fun_id(fun_id){ this.#fun_id = fun_id }
    set pode_servir(pode_servir){ this.#pode_servir = pode_servir }
    set acolito(acolito){ this.#acolito = acolito }
    set funcao(funcao){ this.#funcao = funcao }

    toJSON() {
        return {
            aco_id: this.#aco_id,
            fun_id: this.#fun_id,
            pode_servir: this.#pode_servir,
            acolito: this.#acolito,
            funcao: this.#funcao
        }
    }

}
