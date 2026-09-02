// Helpers de data à prova de fuso horário.
//
// As colunas `date` do Postgres voltam como string 'YYYY-MM-DD' (ver config/db.js).
// NUNCA use `new Date('YYYY-MM-DD')` para exibir: o JS interpreta a string como
// meia-noite UTC e o dia "anda" pra trás em fusos negativos (Brasil = UTC-3),
// fazendo o sábado virar sexta no calendário.

/** Qualquer valor de data (string ou Date) -> 'YYYY-MM-DD', sem conversão de fuso. */
export function dataISO(v) {
  if (v == null || v === '') return ''
  if (v instanceof Date) {
    // getters locais: o pg parseou a data no MESMO fuso do processo, então o
    // dia do calendário sai certo aqui.
    const p = (n) => String(n).padStart(2, '0')
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`
  }
  return String(v).slice(0, 10) // 'YYYY-MM-DD' ou 'YYYY-MM-DDT...' -> só a data
}

/** Qualquer valor de data -> 'DD/MM/YYYY' para exibição. */
export function dataBR(v) {
  const iso = dataISO(v)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}
