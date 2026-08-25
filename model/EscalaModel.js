export default class EscalaModel{
    #esc_id
    #mis_id
    #aco_id
    #fun_id
    #esc_status
    #acolito
    #funcao
    #missa

    constructor(esc_id,mis_id,aco_id,fun_id,esc_status,acolito,funcao,missa){
        this.#esc_id = esc_id
        this.#mis_id = mis_id
        this.#aco_id = aco_id
        this.#fun_id = fun_id
        this.#esc_status = esc_status
        this.#acolito = acolito
        this.#funcao = funcao
        this.#missa = missa
    }

    get esc_id(){ return this.#esc_id }
    get mis_id(){ return this.#mis_id }
    get aco_id(){ return this.#aco_id }
    get fun_id(){ return this.#fun_id }
    get esc_status(){ return this.#esc_status }
    get acolito(){ return this.#acolito }
    get funcao(){ return this.#funcao }
    get missa(){ return this.#missa }

    set esc_id(esc_id){ this.#esc_id = esc_id }
    set mis_id(mis_id){ this.#mis_id = mis_id }
    set aco_id(aco_id){ this.#aco_id = aco_id }
    set fun_id(fun_id){ this.#fun_id = fun_id }
    set esc_status(esc_status){ this.#esc_status = esc_status }
    set acolito(acolito){ this.#acolito = acolito }
    set funcao(funcao){ this.#funcao = funcao }
    set missa(missa){ this.#missa = missa }

    toJSON() {
        return {
            esc_id: this.#esc_id,
            mis_id: this.#mis_id,
            aco_id: this.#aco_id,
            fun_id: this.#fun_id,
            esc_status: this.#esc_status,
            acolito: this.#acolito,
            funcao: this.#funcao,
            missa: this.#missa
        }
    }

}
