import pool from '../config/db.js'
import FuncaoModel from '../model/FuncaoModel.js'

export default class FuncaoDAO{
    static async getAll(){
        const { rows } = await pool.query('SELECT * FROM funcao')

        return rows.map(rows => new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao))
    }

    static async findById(fun_id){
        const { rows } = await pool.query('SELECT * FROM funcao WHERE fun_id = $1', [fun_id])

        rows.map(rows => new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao))

        return rows.length > 0 ? rows[0] : null
    }

    static async create(funcao){
        const { rows } = await pool.query('INSERT INTO funcao (fun_nome, fun_descricao) VALUES ($1, $2) RETURNING *',
            [funcao.fun_nome, funcao.fun_descricao])

        return rows.length > 0 ? rows[0] : null
    }

    static async update(funcao){
        const { rows } = await pool.query('UPDATE funcao SET fun_nome = $1, fun_descricao = $2 WHERE fun_id = $3 RETURNING *',
            [funcao.fun_nome, funcao.fun_descricao, funcao.fun_id])

        return rows.length > 0 ? rows[0] : null
    }

    static async delete(fun_id){
        const { rows } = await pool.query('DELETE FROM funcao WHERE fun_id = $1 RETURNING *', [fun_id])

        rows.map(rows => new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao))

        return rows.length > 0 ? rows[0] : null
    }

}
