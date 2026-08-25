export default class FuncaoModel{
    #fun_id
    #fun_nome
    #fun_descricao

    constructor(fun_id,fun_nome,fun_descricao){
        this.#fun_id = fun_id
        this.#fun_nome = fun_nome
        this.#fun_descricao = fun_descricao
    }
    get fun_id(){ return this.#fun_id }
    get fun_nome(){ return this.#fun_nome }
    get fun_descricao(){ return this.#fun_descricao }

    set fun_id(fun_id){ this.#fun_id = fun_id}
    set fun_nome(fun_nome){ this.#fun_nome = fun_nome}
    set fun_descricao(fun_descricao){ this.#fun_descricao = fun_descricao}

    toJSON() {
        return {
            fun_id: this.#fun_id,
            fun_nome: this.#fun_nome,
            fun_descricao: this.#fun_descricao
        }
    }

}
