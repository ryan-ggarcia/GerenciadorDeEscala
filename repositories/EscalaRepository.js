import pool from '../config/db.js'
import EscalaModel from '../model/EscalaModel.js'
import MissaModel from '../model/MissaModel.js'
import AcolitosModel from '../model/AcolitosModel.js'
import FuncaoModel from '../model/FuncaoModel.js'

export default class EscalaRepository{
    static async getAll(){
        const { rows } = await pool.query(
            `SELECT e.*,
                    m.mis_local, m.mis_nome, m.mis_dia, m.mis_hora_inicio, m.mis_hora_final,
                    a.aco_nome, a.aco_status,
                    f.fun_nome, f.fun_descricao
             FROM escala e
             JOIN missa m ON m.mis_id = e.mis_id
             JOIN acolito a ON a.aco_id = e.aco_id
             JOIN funcao f ON f.fun_id = e.fun_id
             ORDER BY m.mis_dia DESC`
        )

        return rows.map(rows => new EscalaModel(rows.esc_id, rows.mis_id, rows.aco_id, rows.fun_id, rows.esc_status,
            new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status),
            new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao),
            new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final)))
    }

    static async findById(esc_id){
        const { rows } = await pool.query(
            `SELECT e.*,
                    m.mis_local, m.mis_nome, m.mis_dia, m.mis_hora_inicio, m.mis_hora_final,
                    a.aco_nome, a.aco_status,
                    f.fun_nome, f.fun_descricao
             FROM escala e
             JOIN missa m ON m.mis_id = e.mis_id
             JOIN acolito a ON a.aco_id = e.aco_id
             JOIN funcao f ON f.fun_id = e.fun_id
             WHERE e.esc_id = $1`,
            [esc_id]
        )

        rows.map(rows => new EscalaModel(rows.esc_id, rows.mis_id, rows.aco_id, rows.fun_id, rows.esc_status,
            new AcolitosModel(rows.aco_id, rows.aco_nome, rows.aco_status),
            new FuncaoModel(rows.fun_id, rows.fun_nome, rows.fun_descricao),
            new MissaModel(rows.mis_id, rows.mis_local, rows.mis_nome, rows.mis_dia, rows.mis_hora_inicio, rows.mis_hora_final)))

        return rows.length > 0 ? rows[0] : null
    }

    static async create(dados){
        const { rows } = await pool.query('INSERT INTO escala (mis_id, aco_id, fun_id) VALUES ($1, $2, $3) RETURNING *',
            [dados.mis_id, dados.aco_id, dados.fun_id])

        rows.map(rows => new EscalaModel(rows.esc_id, rows.mis_id, rows.aco_id, rows.fun_id, rows.esc_status))

        return rows.length > 0 ? rows[0] : null
    }

    static async update(dados){
        const { rows } = await pool.query('UPDATE escala SET mis_id = $1, aco_id = $2, fun_id = $3, esc_status = $4 WHERE esc_id = $5 RETURNING *',
            [dados.mis_id, dados.aco_id, dados.fun_id, dados.status, dados.id])

        rows.map(rows => new EscalaModel(rows.esc_id, rows.mis_id, rows.aco_id, rows.fun_id, rows.esc_status))

        return rows.length > 0 ? rows[0] : null
    }

    static async delete(esc_id){
        const { rows } = await pool.query('DELETE FROM escala WHERE esc_id = $1 RETURNING *', [esc_id])

        rows.map(rows => new EscalaModel(rows.esc_id, rows.mis_id, rows.aco_id, rows.fun_id, rows.esc_status))

        return rows.length > 0 ? rows[0] : null
    }

    // Quantas escalas e missas caem antes do 1o dia do mes atual (previa do dialogo).
    static async contarMesesPassados(){
        const { rows } = await pool.query(
            `SELECT
               (SELECT count(*)::int FROM escala e
                  JOIN missa m ON m.mis_id = e.mis_id
                  WHERE m.mis_dia < date_trunc('month', CURRENT_DATE)) AS escalas,
               (SELECT count(*)::int FROM missa
                  WHERE mis_dia < date_trunc('month', CURRENT_DATE))    AS missas`
        )
        return rows[0]
    }

    // Apaga escalas e missas de meses anteriores ao atual (escala antes por causa da FK).
    static async limparMesesPassados(){
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            const esc = await client.query(
                `DELETE FROM escala
                 WHERE mis_id IN (
                   SELECT mis_id FROM missa WHERE mis_dia < date_trunc('month', CURRENT_DATE)
                 )`
            )
            const mis = await client.query(
                `DELETE FROM missa WHERE mis_dia < date_trunc('month', CURRENT_DATE)`
            )
            await client.query('COMMIT')
            return { escalas: esc.rowCount, missas: mis.rowCount }
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }

}
