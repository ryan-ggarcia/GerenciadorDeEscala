// Confere o relatório Excel: colunas certas e datas sem "andar" de fuso.
// Roda numa transação com ROLLBACK — não altera o banco.
// Pula sozinho se não houver DATABASE_URL.
//   node --test test/exportar.test.js

import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { PassThrough } from 'node:stream'
import ExcelJS from 'exceljs'

const temBanco = !!process.env.DATABASE_URL
let pool

after(async () => { if (pool) await pool.end() })

test('Excel: colunas e datas do relatório', { skip: !temBanco }, async () => {
  pool = (await import('../config/db.js')).default
  const { default: EscalaController } = await import('../controller/EscalaController.js')

  const c = await pool.connect()
  await c.query('BEGIN')
  const origQuery = pool.query.bind(pool)
  pool.query = (...a) => c.query(...a)

  try {
    await c.query('DELETE FROM escala') // rollback depois

    const novaMissa = async (nome, dia, hora, horaFim, local) =>
      (await c.query(
        `INSERT INTO missa (mis_local, mis_nome, mis_dia, mis_hora_inicio, mis_hora_final)
         VALUES ($1,$2,$3,$4,$5) RETURNING mis_id`,
        [local, nome, dia, hora, horaFim]
      )).rows[0].mis_id

    const casos = [
      { nome: 'ZZ Missa Sábado', dia: '2026-09-05', hora: '19:00', fim: '20:00', local: 'Igreja', dataBR: '05/09/2026' },
      { nome: 'ZZ Missa Domingo', dia: '2026-09-06', hora: '08:00', fim: '09:00', local: 'Capela', dataBR: '06/09/2026' },
      { nome: 'ZZ Missa Virada', dia: '2027-01-01', hora: '00:00', fim: '01:00', local: 'Matriz', dataBR: '01/01/2027' },
    ]
    const [aco] = (await c.query("SELECT aco_id FROM acolito WHERE aco_status='ATIVO' LIMIT 1")).rows
    const funcs = (await c.query("SELECT fun_id FROM funcao WHERE fun_nome IN ('Missal','Auxiliar')")).rows
    assert.ok(aco && funcs.length === 2, 'precisa de 1 acólito ativo e as funções Missal/Auxiliar')

    for (const caso of casos) {
      const id = await novaMissa(caso.nome, caso.dia, caso.hora, caso.fim, caso.local)
      for (const f of funcs)
        await c.query('INSERT INTO escala (mis_id, aco_id, fun_id) VALUES ($1,$2,$3)', [id, aco.aco_id, f.fun_id])
    }

    const pt = new PassThrough()
    const chunks = []
    pt.on('data', (b) => chunks.push(Buffer.from(b)))
    const fim = new Promise((r) => pt.on('finish', r))
    const res = {
      setHeader() {},
      write: pt.write.bind(pt),
      end: (b) => pt.end(b),
      status() { return this },
      json(x) { throw new Error('exportar respondeu erro: ' + JSON.stringify(x)) },
    }
    await EscalaController.exportar({}, res)
    await fim

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(Buffer.concat(chunks))
    const ws = wb.getWorksheet('Escalas')

    const header = ws.getRow(1).values.slice(1)
    assert.deepEqual(header.slice(0, 4), ['Missa', 'Data', 'Horário', 'Local'], 'colunas fixas')
    assert.ok(header.includes('Missal') && header.includes('Auxiliar'), 'colunas Missal/Auxiliar')
    assert.equal(ws.rowCount - 1, casos.length, 'uma linha por missa')

    const esperado = new Map(casos.map((k) => [k.nome, k]))
    let conferidas = 0
    ws.eachRow((row, n) => {
      if (n === 1) return
      const k = esperado.get(String(row.getCell(1).value))
      assert.ok(k, `linha ${n} com missa inesperada`)
      assert.equal(String(row.getCell(2).value), k.dataBR, `Data de "${k.nome}"`)
      assert.equal(String(row.getCell(3).value), k.hora, `Horário de "${k.nome}"`)
      assert.equal(String(row.getCell(4).value), k.local, `Local de "${k.nome}"`)
      conferidas++
    })
    assert.equal(conferidas, casos.length)
  } finally {
    pool.query = origQuery
    await c.query('ROLLBACK')
    c.release()
  }
})
