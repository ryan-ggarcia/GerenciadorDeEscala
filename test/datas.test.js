// Testes de fuso horário das datas (calendário e relatório). Sem banco.
//   node --test test/datas.test.js

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dataISO, dataBR } from '../lib/data.js'

// Réplica da versão ANTIGA de dateKey() (public/js/escala/calendario.js) — com bug.
function dateKeyAntigo(raw) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Réplica da versão CORRIGIDA (mantém em sincronia com calendario.js).
function dateKeyNovo(raw) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  const d = new Date(raw)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

test('o bug: servidor em UTC faz a missa de sábado cair na sexta', () => {
  // Missa de sábado 05/09/2026. Servidor em UTC serializa a coluna `date` assim:
  const jsonDoServidorUTC = '2026-09-05T00:00:00.000Z'

  // No navegador brasileiro (UTC-3), new Date(...Z) recua um dia:
  const noBrasil = new Date(jsonDoServidorUTC).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  assert.equal(noBrasil, '2026-09-04', 'new Date(iso UTC) vira 04/09 (sexta) no fuso do Brasil')

  // A lógica ANTIGA propaga esse recuo; a NOVA não.
  const antigoNoBrasil = new Date(jsonDoServidorUTC)
  assert.equal(
    `${antigoNoBrasil.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })}`,
    '2026-09-04',
    'dateKeyAntigo cairia em 04/09 quando o navegador não está em UTC'
  )
  assert.equal(dateKeyNovo(jsonDoServidorUTC), '2026-09-05', 'dateKeyNovo mantém 05/09 (sábado)')
})

test('correção: data tratada como texto YYYY-MM-DD, imune a fuso', () => {
  for (const entrada of [
    '2026-09-05',
    '2026-09-05T00:00:00.000Z',
    '2026-09-05T03:00:00.000Z',
    '2026-09-05T23:59:59.000Z',
  ]) {
    assert.equal(dateKeyNovo(entrada), '2026-09-05', `dateKeyNovo(${entrada})`)
    assert.equal(dataISO(entrada), '2026-09-05', `dataISO(${entrada})`)
    assert.equal(dataBR(entrada), '05/09/2026', `dataBR(${entrada})`)
  }
})

test('lib/data aceita string e Date', () => {
  assert.equal(dataISO('2026-09-06'), '2026-09-06')
  assert.equal(dataBR('2026-09-06'), '06/09/2026')
  assert.equal(dataISO(new Date(2026, 8, 6)), '2026-09-06') // mês 8 = setembro
  assert.equal(dataBR(new Date(2026, 8, 6)), '06/09/2026')
  assert.equal(dataISO(null), '')
  assert.equal(dataBR(''), '')
})

test('não usar new Date(string) para exibir — este teste documenta o porquê', () => {
  // roda em qualquer fuso <= UTC e falha do jeito antigo:
  const jeitoAntigo = new Date('2026-09-05').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  assert.equal(jeitoAntigo, '04/09/2026', 'new Date("2026-09-05") = meia-noite UTC = 04/09 no Brasil')
  assert.equal(dataBR('2026-09-05'), '05/09/2026', 'dataBR corrige')
})

test('pipeline do calendário: Date do Postgres -> dataISO -> JSON -> dateKey mantém o dia', () => {
  // é assim que o pg constrói o valor da coluna `date` (new Date(ano, mês, dia)),
  // independente do fuso do processo:
  const pgDate = new Date(2026, 8, 5) // 05/09/2026 (setembro = 8)
  const serializado = JSON.parse(JSON.stringify({ dia: dataISO(pgDate) })).dia
  assert.equal(serializado, '2026-09-05')
  assert.equal(dateKeyNovo(serializado), '2026-09-05')
  assert.equal(dataBR(serializado), '05/09/2026')
})
