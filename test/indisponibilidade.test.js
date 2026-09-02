// Indisponibilidade x escala: cadastrar/editar uma indisponibilidade tira o
// acólito das escalas já montadas no período (inclusive períodos de 1 dia só).
// Tudo em transação com ROLLBACK. Pula sem DATABASE_URL.
//   node --test test/indisponibilidade.test.js

import { test, after } from 'node:test'
import assert from 'node:assert/strict'

const temBanco = !!process.env.DATABASE_URL
let pool

after(async () => { if (pool) await pool.end() })

async function comTransacao(fn) {
  pool = (await import('../config/db.js')).default
  const c = await pool.connect()
  await c.query('BEGIN')
  const orig = pool.query.bind(pool)
  pool.query = (...a) => c.query(...a)
  try { return await fn(c) }
  finally { pool.query = orig; await c.query('ROLLBACK'); c.release() }
}

// cria uma missa de teste e escala 1 acólito nela; devolve {mis_id, aco_id, dia}
async function montaCenario(c, dia) {
  const mis_id = (await c.query(
    `INSERT INTO missa (mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final)
     VALUES ('Igreja', 'ZZ Missa Teste', $1, '19:00', '20:00') RETURNING mis_id`, [dia]
  )).rows[0].mis_id
  const aco_id = (await c.query("SELECT aco_id FROM acolito WHERE aco_status='ATIVO' LIMIT 1")).rows[0].aco_id
  const fun_id = (await c.query("SELECT fun_id FROM funcao LIMIT 1")).rows[0].fun_id
  await c.query('INSERT INTO escala (mis_id, aco_id, fun_id) VALUES ($1,$2,$3)', [mis_id, aco_id, fun_id])
  return { mis_id, aco_id, dia }
}

test('cadastrar indisponibilidade de 1 dia remove a escala daquele dia', { skip: !temBanco }, async () => {
  await comTransacao(async (c) => {
    const { default: IndisponivelController } = await import('../controller/IndisponivelController.js')
    const { mis_id, aco_id } = await montaCenario(c, '2026-09-04')

    let out
    await IndisponivelController.create(
      { body: { aco_id, dataInicio: '2026-09-04', dataFim: '2026-09-04', motivo: 'teste 1 dia' } },
      { status: () => ({ json: (x) => { out = x } }), json: (x) => { out = x } }
    )
    assert.equal(out.ok, true)
    assert.equal(out.escalasRemovidas, 1, 'deveria remover 1 escalação')

    const resta = await c.query('SELECT 1 FROM escala WHERE mis_id=$1 AND aco_id=$2', [mis_id, aco_id])
    assert.equal(resta.rowCount, 0, 'o acólito não pode mais constar nessa missa')
  })
})

test('cadastrar indisponibilidade NÃO mexe em escala fora do período', { skip: !temBanco }, async () => {
  await comTransacao(async (c) => {
    const { default: IndisponivelController } = await import('../controller/IndisponivelController.js')
    const { mis_id, aco_id } = await montaCenario(c, '2026-09-10')

    let out
    await IndisponivelController.create(
      { body: { aco_id, dataInicio: '2026-09-04', dataFim: '2026-09-04', motivo: 'outro dia' } },
      { status: () => ({ json: (x) => { out = x } }), json: (x) => { out = x } }
    )
    assert.equal(out.escalasRemovidas, 0)
    const resta = await c.query('SELECT 1 FROM escala WHERE mis_id=$1 AND aco_id=$2', [mis_id, aco_id])
    assert.equal(resta.rowCount, 1, 'a escala de 10/09 continua')
  })
})

test('SorteadorDAO.semConflitoIndisponibilidade descarta a linha em conflito', { skip: !temBanco }, async () => {
  await comTransacao(async (c) => {
    const { default: SorteadorDAO } = await import('../DAO/SorteadorDAO.js')
    await c.query('DELETE FROM indisponibilidade') // rollback depois — isola o cenário
    const mis_id = (await c.query(
      `INSERT INTO missa (mis_local,mis_nome,mis_dia,mis_hora_inicio,mis_hora_final)
       VALUES ('x','ZZ','2026-09-05','19:00','20:00') RETURNING mis_id`
    )).rows[0].mis_id
    const [a1, a2] = (await c.query("SELECT aco_id FROM acolito WHERE aco_status='ATIVO' LIMIT 2")).rows
    const [f1, f2] = (await c.query('SELECT fun_id FROM funcao LIMIT 2')).rows
    await c.query('INSERT INTO indisponibilidade (aco_id,ind_data_inicio,ind_data_fim,ind_motivo) VALUES ($1,$2,$2,$3)',
      [a1.aco_id, '2026-09-05', 't'])

    const linhas = [
      { mis_id, aco_id: a1.aco_id, fun_id: f1.fun_id }, // conflito
      { mis_id, aco_id: a2.aco_id, fun_id: f2.fun_id }, // ok
    ]
    const ok = await SorteadorDAO.semConflitoIndisponibilidade(linhas)
    assert.equal(ok.length, 1)
    assert.equal(Number(ok[0].aco_id), a2.aco_id)
  })
})
