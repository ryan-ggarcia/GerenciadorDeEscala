import MissaDAO from "../DAO/MissaDAO.js"
import FuncaoDAO from "../DAO/FuncaoDAO.js"
import SorteadorDAO from "../DAO/SorteadorDAO.js"

// Funcoes de cada tipo de missa, na ordem em que aparecem na escala.
// Sao casadas com a tabela `funcao` pelo nome (ignorando acento e maiuscula).
const FUNCOES_COMUM  = ['Missal', 'Auxiliar']
const FUNCOES_SOLENE = ['Vela 1', 'Vela 2', 'Turíbulo', 'Gaveta', 'Missal', 'Auxiliar']

const MESES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const normalizar = (s) =>
    String(s ?? '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .trim().toLowerCase()

const diaISO = (valor) => {
    const d = new Date(valor)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const rotuloMes = (ym) => {
    const [ano, mes] = ym.split('-')
    const nome = MESES_PT[Number(mes) - 1] || ym
    return `${nome[0].toUpperCase()}${nome.slice(1)} de ${ano}`
}

// Resolve a lista de nomes de funcao (comum ou solene) para {fun_id, fun_nome}.
// Nome que nao existe na tabela `funcao` vira faltaCadastro: true.
const resolverPapeis = (solene, funcoes) => {
    const alvo = solene ? FUNCOES_SOLENE : FUNCOES_COMUM
    return alvo.map(nome => {
        const f = funcoes.find(x => normalizar(x.fun_nome) === normalizar(nome))
        return f
            ? { fun_id: f.fun_id, fun_nome: f.fun_nome, faltaCadastro: false }
            : { fun_id: null, fun_nome: nome, faltaCadastro: true }
    })
}

// Guloso: preenche primeiro as funcoes com menos candidatos e escolhe quem
// aparece primeiro na lista (ja ordenada por carga). `candByFun` = Map<fun_id, [{aco_id, aco_nome}]>.
const montarItens = (papeis, candByFun) => {
    const ordem = papeis
        .map((p, i) => ({ i, n: (candByFun.get(p.fun_id) || []).length }))
        .sort((a, b) => a.n - b.n || a.i - b.i)

    const usados = new Set()
    const escolha = new Map()
    for (const { i } of ordem) {
        const p = papeis[i]
        if (!p.fun_id) continue
        const pick = (candByFun.get(p.fun_id) || []).find(c => !usados.has(c.aco_id)) || null
        if (pick) { usados.add(pick.aco_id); escolha.set(i, pick) }
    }

    const itens = papeis.map((p, i) => {
        const pick = escolha.get(i) || null
        return {
            fun_id: p.fun_id,
            fun_nome: p.fun_nome,
            faltaCadastro: p.faltaCadastro,
            aco_id: pick?.aco_id ?? null,
            aco_nome: pick?.aco_nome ?? null,
            candidatos: (candByFun.get(p.fun_id) || []).map(c => ({ aco_id: c.aco_id, aco_nome: c.aco_nome }))
        }
    })
    return { itens, escolhidos: [...escolha.values()].map(c => c.aco_id) }
}

export default class SorteadorController {

    static async view(req, res) {
        const meses = (await SorteadorDAO.mesesComMissa())
            .map(m => ({ ym: m.ym, rotulo: rotuloMes(m.ym), qtd: m.qtd }))
        res.render("escala/sorteador.ejs", { meses })
    }

    // POST /escala/sorteador/sortear  -> re-sorteia UMA missa (usado ao marcar/desmarcar "solene")
    static async sortear(req, res) {
        try {
            const { mis_id, solene } = req.body
            if (!mis_id)
                return res.status(400).json({ ok: false, erro: 'Selecione a missa.' })

            const missa = await MissaDAO.findById(mis_id)
            if (!missa)
                return res.status(404).json({ ok: false, erro: 'Missa nao encontrada.' })

            const funcoes = await FuncaoDAO.getAll()
            const papeis = resolverPapeis(solene, funcoes)

            const linhas = await SorteadorDAO.candidatos(mis_id, diaISO(missa.mis_dia))
            const candByFun = new Map()
            for (const l of linhas) {
                if (!candByFun.has(l.fun_id)) candByFun.set(l.fun_id, [])
                candByFun.get(l.fun_id).push({ aco_id: l.aco_id, aco_nome: l.aco_nome })
            }

            const { itens } = montarItens(papeis, candByFun)

            return res.json({
                ok: true,
                missa: {
                    mis_id: missa.mis_id,
                    mis_nome: missa.mis_nome,
                    mis_dia: missa.mis_dia,
                    mis_hora_inicio: missa.mis_hora_inicio
                },
                solene: !!solene,
                jaEscalados: await SorteadorDAO.contarEscalados(mis_id),
                itens
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ ok: false, erro: 'Erro ao sortear.' })
        }
    }

    // POST /escala/sorteador/sortear-mes  -> sorteia todas as missas de um mes de uma vez.
    // body: { mes: 'YYYY-MM', solenes?: [mis_id, ...] }
    static async sortearMes(req, res) {
        try {
            const { mes, solenes } = req.body
            if (!mes || !/^\d{4}-\d{2}$/.test(mes))
                return res.status(400).json({ ok: false, erro: 'Selecione o mes.' })

            const missas = await SorteadorDAO.missasDoMes(mes)
            if (missas.length === 0)
                return res.status(404).json({ ok: false, erro: 'Nenhuma missa cadastrada nesse mes.' })

            const funcoes = await FuncaoDAO.getAll()
            const misIds = missas.map(m => m.mis_id)
            const linhas = await SorteadorDAO.candidatosLote(misIds)
            const escalados = new Map(
                (await SorteadorDAO.contarEscaladosLote(misIds)).map(r => [String(r.mis_id), r.qtd])
            )

            // linhas -> Map<mis_id, Map<fun_id, [{aco_id, aco_nome, carga}]>>
            const porMissa = new Map()
            for (const l of linhas) {
                const mk = String(l.mis_id)
                if (!porMissa.has(mk)) porMissa.set(mk, new Map())
                const fm = porMissa.get(mk)
                if (!fm.has(l.fun_id)) fm.set(l.fun_id, [])
                fm.get(l.fun_id).push({ aco_id: l.aco_id, aco_nome: l.aco_nome, carga: Number(l.carga) })
            }

            const soleneSet = new Set((Array.isArray(solenes) ? solenes : []).map(String))
            const cargaExtra = new Map()          // equilibra a carga ao longo do mes
            const cargaDe = (id) => cargaExtra.get(String(id)) || 0

            const resultado = missas.map(m => {
                const solene = soleneSet.has(String(m.mis_id))
                const papeis = resolverPapeis(solene, funcoes)

                // reordena os candidatos considerando o que ja foi distribuido neste mes
                const candByFun = new Map()
                for (const [funId, arr] of (porMissa.get(String(m.mis_id)) || new Map())) {
                    candByFun.set(funId, arr.slice().sort((a, b) =>
                        (a.carga + cargaDe(a.aco_id)) - (b.carga + cargaDe(b.aco_id))))
                }

                const { itens, escolhidos } = montarItens(papeis, candByFun)
                for (const id of escolhidos) cargaExtra.set(String(id), cargaDe(id) + 1)

                return {
                    mis_id: m.mis_id,
                    mis_nome: m.mis_nome,
                    mis_dia: m.mis_dia,
                    mis_hora_inicio: m.mis_hora_inicio,
                    solene,
                    jaEscalados: escalados.get(String(m.mis_id)) || 0,
                    itens
                }
            })

            return res.json({ ok: true, mes, rotulo: rotuloMes(mes), missas: resultado })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ ok: false, erro: 'Erro ao sortear o mes.' })
        }
    }

    // POST /escala/sorteador/salvar
    // body: { missas: [{ mis_id, itens: [{fun_id, aco_id}] }] }  (ou o formato antigo de 1 missa)
    static async salvar(req, res) {
        try {
            const lote = Array.isArray(req.body.missas)
                ? req.body.missas
                : [{ mis_id: req.body.mis_id, itens: req.body.itens }]

            const linhas = []
            for (const m of lote) {
                if (!m || !m.mis_id || !Array.isArray(m.itens)) continue
                const validos = m.itens.filter(it => it && it.fun_id && it.aco_id)

                const acos = validos.map(it => String(it.aco_id))
                if (new Set(acos).size !== acos.length)
                    return res.status(400).json({ ok: false, erro: 'Ha um acolito repetido em uma das missas.' })

                const funs = validos.map(it => String(it.fun_id))
                if (new Set(funs).size !== funs.length)
                    return res.status(400).json({ ok: false, erro: 'Ha uma funcao repetida em uma das missas.' })

                for (const it of validos)
                    linhas.push({ mis_id: m.mis_id, aco_id: it.aco_id, fun_id: it.fun_id })
            }

            if (linhas.length === 0)
                return res.status(400).json({ ok: false, erro: 'Nenhum acolito para escalar.' })

            await SorteadorDAO.salvarLote(linhas)
            return res.status(201).json({ ok: true, total: linhas.length })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ ok: false, erro: 'Erro ao salvar a escala.' })
        }
    }
}
