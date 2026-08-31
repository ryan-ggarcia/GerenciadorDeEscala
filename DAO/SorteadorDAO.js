import pool from '../config/db.js'

export default class SorteadorDAO {

    // Meses que tem pelo menos uma missa cadastrada (para o <select> da tela).
    static async mesesComMissa() {
        const { rows } = await pool.query(
            `SELECT to_char(mis_dia, 'YYYY-MM') AS ym,
                    MIN(mis_dia)               AS ord,
                    COUNT(*)::int             AS qtd
             FROM missa
             GROUP BY 1
             ORDER BY ord`
        )
        return rows
    }

    // Missas de um mes 'YYYY-MM', em ordem cronologica.
    static async missasDoMes(ym) {
        const { rows } = await pool.query(
            `SELECT mis_id, mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final
             FROM missa
             WHERE to_char(mis_dia, 'YYYY-MM') = $1
             ORDER BY mis_dia, mis_hora_inicio`,
            [ym]
        )
        return rows
    }

    // Duplas (funcao x acolito) elegiveis para UMA missa (usado no re-sorteio de um bloco).
    static async candidatos(mis_id, dia) {
        const { rows } = await pool.query(
            `SELECT af.fun_id, a.aco_id, a.aco_nome, COALESCE(h.qtd, 0) AS carga
             FROM acolito a
             JOIN acolito_funcao af
               ON af.aco_id = a.aco_id AND af.pode_servir = true
             LEFT JOIN (
               SELECT aco_id, COUNT(*) AS qtd FROM escala GROUP BY aco_id
             ) h ON h.aco_id = a.aco_id
             WHERE a.aco_status = 'ATIVO'
               AND NOT EXISTS (
                 SELECT 1 FROM indisponibilidade i
                 WHERE i.aco_id = a.aco_id
                   AND $2::date BETWEEN i.ind_data_inicio AND i.ind_data_fim
               )
               AND NOT EXISTS (
                 SELECT 1 FROM escala e
                 WHERE e.mis_id = $1 AND e.aco_id = a.aco_id
               )
             ORDER BY af.fun_id, carga ASC, random()`,
            [mis_id, dia]
        )
        return rows
    }

    // Idem, mas para VARIAS missas de uma vez. Cada linha ja traz a qual missa pertence,
    // respeitando a indisponibilidade na data daquela missa especifica.
    static async candidatosLote(misIds) {
        const { rows } = await pool.query(
            `SELECT m.mis_id, af.fun_id, a.aco_id, a.aco_nome, COALESCE(h.qtd, 0) AS carga
             FROM missa m
             CROSS JOIN acolito a
             JOIN acolito_funcao af
               ON af.aco_id = a.aco_id AND af.pode_servir = true
             LEFT JOIN (
               SELECT aco_id, COUNT(*) AS qtd FROM escala GROUP BY aco_id
             ) h ON h.aco_id = a.aco_id
             WHERE m.mis_id = ANY($1::int[])
               AND a.aco_status = 'ATIVO'
               AND NOT EXISTS (
                 SELECT 1 FROM indisponibilidade i
                 WHERE i.aco_id = a.aco_id
                   AND m.mis_dia BETWEEN i.ind_data_inicio AND i.ind_data_fim
               )
               AND NOT EXISTS (
                 SELECT 1 FROM escala e
                 WHERE e.mis_id = m.mis_id AND e.aco_id = a.aco_id
               )
             ORDER BY m.mis_id, af.fun_id, carga ASC, random()`,
            [misIds]
        )
        return rows
    }

    static async contarEscalados(mis_id) {
        const { rows } = await pool.query(
            'SELECT COUNT(*)::int AS qtd FROM escala WHERE mis_id = $1',
            [mis_id]
        )
        return rows[0].qtd
    }

    static async contarEscaladosLote(misIds) {
        const { rows } = await pool.query(
            'SELECT mis_id, COUNT(*)::int AS qtd FROM escala WHERE mis_id = ANY($1::int[]) GROUP BY mis_id',
            [misIds]
        )
        return rows
    }

    // Insere um conjunto de linhas [{mis_id, aco_id, fun_id}] numa unica transacao.
    static async salvarLote(linhas) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            for (const l of linhas) {
                await client.query(
                    'INSERT INTO escala (mis_id, aco_id, fun_id) VALUES ($1, $2, $3)',
                    [l.mis_id, l.aco_id, l.fun_id]
                )
            }
            await client.query('COMMIT')
            return true
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }
}
