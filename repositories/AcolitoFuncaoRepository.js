import pool from '../config/db.js'
import AcolitoFuncaoModel from '../model/AcolitoFuncaoModel.js'
import AcolitosModel from '../model/AcolitosModel.js'
import FuncaoModel from '../model/FuncaoModel.js'

export default class AcolitoFuncaoRepository{
    static async getAll(){
        const { rows } = await pool.query(
            `SELECT af.*, a.aco_nome, a.aco_status, f.fun_nome, f.fun_descricao
             FROM acolito_funcao af
             JOIN acolito a ON a.aco_id = af.aco_id
             JOIN funcao f ON f.fun_id = af.fun_id
             ORDER BY a.aco_nome, f.fun_nome`
        )

        return rows.map(rows => new AcolitoFuncaoModel(rows.aco_id, rows.fun_id, rows.pode_servir,
            new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status),
            new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao)))
    }

    static async findByIds(aco_id, fun_id){
        const { rows } = await pool.query(
            `SELECT af.*, a.aco_nome, a.aco_status, f.fun_nome, f.fun_descricao
             FROM acolito_funcao af
             JOIN acolito a ON a.aco_id = af.aco_id
             JOIN funcao f ON f.fun_id = af.fun_id
             WHERE af.aco_id = $1 AND af.fun_id = $2`,
            [aco_id, fun_id]
        )

        rows.map(rows => new AcolitoFuncaoModel(rows.aco_id, rows.fun_id, rows.pode_servir,
            new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status),
            new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao)))

        return rows.length > 0 ? rows[0] : null
    }

    static async create(dados){
        const { rows } = await pool.query('INSERT INTO acolito_funcao (aco_id, fun_id, pode_servir) VALUES ($1, $2, $3) RETURNING *',
            [dados.aco_id, dados.fun_id, dados.podeServir])

        rows.map(rows => new AcolitoFuncaoModel(rows.aco_id, rows.fun_id, rows.pode_servir))

        return rows.length > 0 ? rows[0] : null
    }

    static async update(dados){
        const { rows } = await pool.query('UPDATE acolito_funcao SET aco_id = $1, fun_id = $2, pode_servir = $3 WHERE aco_id = $4 AND fun_id = $5 RETURNING *',
            [dados.aco_id, dados.fun_id, dados.podeServir, dados.oldAcoId, dados.oldFunId])

        rows.map(rows => new AcolitoFuncaoModel(rows.aco_id, rows.fun_id, rows.pode_servir))

        return rows.length > 0 ? rows[0] : null
    }

    static async delete(aco_id, fun_id){
        const { rows } = await pool.query('DELETE FROM acolito_funcao WHERE aco_id = $1 AND fun_id = $2 RETURNING *', [aco_id, fun_id])

        rows.map(rows => new AcolitoFuncaoModel(rows.aco_id, rows.fun_id, rows.pode_servir))

        return rows.length > 0 ? rows[0] : null
    }

}
