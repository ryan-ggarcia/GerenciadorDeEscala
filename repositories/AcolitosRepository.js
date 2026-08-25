import pool from '../config/db.js'
import AcolitosModel from '../model/AcolitosModel.js'

export default class AcolitosRepository{
    static async getAll(){
        const { rows } = await pool.query('SELECT * FROM acolito')

        return rows.map(rows => new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status))
    }

    static async findById(aco_id){
        const { rows } = await pool.query('SELECT * FROM acolito WHERE aco_id = $1', [aco_id])

        rows.map(rows => new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status))

        return rows.length > 0 ? rows[0] : null
    }

    static async create(dados){
        const { rows } = await pool.query('INSERT INTO acolito (aco_nome, aco_status) VALUES ($1, $2) RETURNING *',
            [dados.nome, dados.status])

        rows.map(rows => new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status))

        return rows.length > 0 ? rows[0] : null
    }

    static async update(dados){
        const { rows } = await pool.query('UPDATE acolito SET aco_nome = $1, aco_status = $2 WHERE aco_id = $3 RETURNING *',
            [dados.nome, dados.status, dados.id])

        rows.map(rows => new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status))

        return rows.length > 0 ? rows[0] : null
    }

    static async delete(aco_id){
        const { rows } = await pool.query('DELETE FROM acolito WHERE aco_id = $1 RETURNING *', [aco_id])

        rows.map(rows => new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status))

        return rows.length > 0 ? rows[0] : null
    }

}
