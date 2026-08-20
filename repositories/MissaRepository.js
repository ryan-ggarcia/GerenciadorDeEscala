import pool from '../config/db.js'
import MissaModel from '../model/MissaModel.js'

export default class MissaRepository{
    static async getAll(){
        const { rows } = await pool.query('SELECT * FROM missa')

        return rows.map(rows => new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final))
    }

    static async findById(mis_id){
        const { rows } = await pool.query('SELECT * from missa WHERE mis_id = $1', [mis_id])

        rows.map(rows => new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final))

        return rows.length > 0 ? rows[0] : null
    }

    static async create(dados){
        const { rows } = await pool.query('INSERT INTO missa (mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [dados.location, dados.name, dados.date, dados.timeStart, dados.timeEnd])

        rows.map(rows => new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final))

        return rows.length > 0 ? rows[0] : null
    }

    static async update(mis_id, dados){
        const { rows } = await pool.query('UPDATE missa SET mis_local = $1, mis_nome = $2, mis_dia = $3, mis_hora_inicio = $4, mis_hora_final = $5 WHERE mis_id = $6 RETURNING *', 
            [dados.location, dados.name, dados.date, dados.timeStart, dados.timeEnd, mis_id])

        rows.map(rows => new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final))

        return rows.length > 0 ? rows[0] : null
    }

    static async delete(mis_id){
        const { rows } = await pool.query('DELETE FROM missa WHERE mis_id = $1 RETURNING *', [mis_id])

        rows.map(rows => new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final))
        
        return rows.length > 0 ? rows[0] : null
    }

}