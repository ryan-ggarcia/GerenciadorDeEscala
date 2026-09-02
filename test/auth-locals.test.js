// AuthMiddleware.exporLogin — expõe res.locals.logado sem bloquear.
//   node --test test/auth-locals.test.js

import { test } from 'node:test'
import assert from 'node:assert/strict'
import AuthMiddleware from '../middleware/authMiddleware.js'

function roda(cookies) {
  const res = { locals: {} }
  let chamouNext = false
  AuthMiddleware.exporLogin({ cookies }, res, () => { chamouNext = true })
  return { logado: res.locals.logado, chamouNext }
}

test('logado = true só com o cookie usuarioLogado == 1', () => {
  assert.equal(roda({ usuarioLogado: '1' }).logado, true)
  assert.equal(roda({ usuarioLogado: 1 }).logado, true)
})

test('logado = false sem cookie ou com outro valor', () => {
  assert.equal(roda({}).logado, false)
  assert.equal(roda(undefined).logado, false)
  assert.equal(roda({ usuarioLogado: '2' }).logado, false)
  assert.equal(roda({ usuarioLogado: '' }).logado, false)
})

test('nunca bloqueia — sempre chama next()', () => {
  assert.equal(roda({}).chamouNext, true)
  assert.equal(roda({ usuarioLogado: '1' }).chamouNext, true)
})
