export default class MissaModel{
    #mis_id
    #mis_local
    #mis_nome
    #mis_dia
    #mis_hora_inicio
    #mis_hora_final
    #escalas

    constructor(mis_id, mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final, escalas){
        this.#mis_id = mis_id
        this.#mis_local = mis_local
        this.#mis_nome = mis_nome
        this.#mis_dia = mis_dia
        this.#mis_hora_inicio = mis_hora_inicio
        this.#mis_hora_final = mis_hora_final
        this.#escalas = escalas
    }

    get mis_id(){ return this.#mis_id }
    get mis_local(){ return this.#mis_local }
    get mis_nome(){ return this.#mis_nome }
    get mis_dia(){ return this.#mis_dia }
    get mis_hora_inicio(){ return this.#mis_hora_inicio }
    get mis_hora_final(){ return this.#mis_hora_final }
    get escalas(){ return this.#escalas }

    set mis_id(mis_id){ this.#mis_id = mis_id }
    set mis_local(mis_local){ this.#mis_local = mis_local }
    set mis_nome(mis_nome){ this.#mis_nome = mis_nome }
    set mis_dia(mis_dia){ this.#mis_dia = mis_dia }
    set mis_hora_inicio(mis_hora_inicio){ this.#mis_hora_inicio = mis_hora_inicio }
    set mis_hora_final(mis_hora_final){ this.#mis_hora_final = mis_hora_final }
    set escalas(escalas){ this.#escalas = escalas }

    toJSON() {
        return {
            mis_id: this.#mis_id,
            mis_local: this.#mis_local,
            mis_nome: this.#mis_nome,
            mis_dia: this.#mis_dia,
            mis_hora_inicio: this.#mis_hora_inicio,
            mis_hora_final: this.#mis_hora_final,
            escalas: this.#escalas
        }
    }

}