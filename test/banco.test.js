// Integridade dos dados no banco — identifica a "missa de lixo" e afins.
// Pula sozinho se não houver DATABASE_URL.
//   node --test test/banco.test.js

import { test, after } from 'node:test'
import assert from 'node:assert/strict'

const temBanco = !!process.env.DATABASE_URL
let pool

async function db() {
  if (!pool) pool = (await import('../config/db.js')).default
  return pool
}
after(async () => { if (pool) await pool.end() })

test('nenhuma missa em 2026-09-03 (a "missa de lixo" é artefato do bug de fuso)', { skip: !temBanco }, async () => {
  const { rows } = await (await db()).query("SELECT mis_id, mis_nome FROM missa WHERE mis_dia = '2026-09-03'")
  assert.equal(rows.length, 0, `achou missa(s) em 03/09: ${JSON.stringify(rows)}`)
})

test('toda escala aponta para uma missa existente', { skip: !temBanco }, async () => {
  const { rows } = await (await db()).query(
    'SELECT e.esc_id FROM escala e LEFT JOIN missa m ON m.mis_id = e.mis_id WHERE m.mis_id IS NULL'
  )
  assert.equal(rows.length, 0, `escalas órfãs: ${JSON.stringify(rows)}`)
})

test('nenhuma missa com nome ou local vazio', { skip: !temBanco }, async () => {
  const { rows } = await (await db()).query(
    "SELECT mis_id, mis_nome, mis_local FROM missa WHERE coalesce(trim(mis_nome),'')='' OR coalesce(trim(mis_local),'')=''"
  )
  assert.equal(rows.length, 0, `missas incompletas: ${JSON.stringify(rows)}`)
})

test('dias da semana das missas conferem (o dado está certo; o bug é só na exibição)', { skip: !temBanco }, async () => {
  const { rows } = await (await db()).query(
    "SELECT to_char(mis_dia,'YYYY-MM-DD') d, trim(to_char(mis_dia,'Day')) dow, mis_nome FROM missa ORDER BY mis_dia"
  )
  for (const r of rows) {
    const n = r.mis_nome.toLowerCase()
    if (n.includes('dominical') || n.includes('domingo'))
      assert.equal(r.dow, 'Sunday', `${r.mis_nome} (${r.d})`)
    if (n.includes('sabado') || n.includes('sábado'))
      assert.equal(r.dow, 'Saturday', `${r.mis_nome} (${r.d})`)
  }
})

test('lista (aviso) as missas sem nenhum acólito escalado', { skip: !temBanco }, async () => {
  const { rows } = await (await db()).query(
    `SELECT to_char(m.mis_dia,'YYYY-MM-DD') d, trim(to_char(m.mis_dia,'Day')) dow, m.mis_nome
     FROM missa m LEFT JOIN escala e ON e.mis_id = m.mis_id
     WHERE e.esc_id IS NULL ORDER BY m.mis_dia`
  )
  if (rows.length) console.log('  ⚠ missas sem acólito (candidatas a remover):', rows)
  // não falha — é só um relatório
})
