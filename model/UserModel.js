export default class UserModel{
    #usu_id
    #usu_nome
    #usu_senha

    constructor(usu_id,usu_nome,usu_senha){
        this.#usu_id = usu_id
        this.#usu_nome = usu_nome
        this.#usu_senha = usu_senha
    }
    get usu_id(){ return this.#usu_id }
    get usu_nome(){ return this.#usu_nome }
    get usu_senha(){ return this.#usu_senha }

    set usu_id(usu_id){ this.#usu_id = usu_id }
    set usu_nome(usu_nome){ this.#usu_nome = usu_nome }
    set usu_senha(usu_senha){ this.#usu_senha = usu_senha }
    
    toJSON(){
        return {
            usu_id: this.#usu_id,
            usu_nome: this.#usu_nome
        }
    }
}