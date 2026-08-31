import pool from '../config/db.js'
import IndisponivelModel from '../model/IndisponivelModel.js'
import AcolitosModel from '../model/AcolitosModel.js'

export default class IndisponivelDAO{
    static async getAll(){
        const { rows } = await pool.query(
            `SELECT i.*, a.aco_nome, a.aco_status
             FROM indisponibilidade i
             JOIN acolito a ON a.aco_id = i.aco_id
             ORDER BY i.ind_data_inicio DESC`
        )

        return rows.map(rows => new IndisponivelModel(rows.ind_id, rows.aco_id, rows.ind_data_inicio, rows.ind_data_fim, rows.ind_motivo,
            new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status)))
    }

    static async findById(ind_id){
        const { rows } = await pool.query(
            `SELECT i.*, a.aco_nome, a.aco_status
             FROM indisponibilidade i
             JOIN acolito a ON a.aco_id = i.aco_id
             WHERE i.ind_id = $1`,
            [ind_id]
        )

        rows.map(rows => new IndisponivelModel(rows.ind_id, rows.aco_id, rows.ind_data_inicio, rows.ind_data_fim, rows.ind_motivo,
            new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status)))

        return rows.length > 0 ? rows[0] : null
    }

    static async create(indisponivel){
        const { rows } = await pool.query('INSERT INTO indisponibilidade (aco_id, ind_data_inicio, ind_data_fim, ind_motivo) VALUES ($1, $2, $3, $4) RETURNING *',
            [indisponivel.aco_id, indisponivel.ind_data_inicio, indisponivel.ind_data_fim, indisponivel.ind_motivo])

        return rows.length > 0 ? rows[0] : null
    }

    static async update(indisponivel){
        const { rows } = await pool.query('UPDATE indisponibilidade SET aco_id = $1, ind_data_inicio = $2, ind_data_fim = $3, ind_motivo = $4 WHERE ind_id = $5 RETURNING *',
            [indisponivel.aco_id, indisponivel.ind_data_inicio, indisponivel.ind_data_fim, indisponivel.ind_motivo, indisponivel.ind_id])

        return rows.length > 0 ? rows[0] : null
    }

    static async delete(ind_id){
        const { rows } = await pool.query('DELETE FROM indisponibilidade WHERE ind_id = $1 RETURNING *', [ind_id])

        rows.map(rows => new IndisponivelModel(rows.ind_id, rows.aco_id, rows.ind_data_inicio, rows.ind_data_fim, rows.ind_motivo))

        return rows.length > 0 ? rows[0] : null
    }

}
