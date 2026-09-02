import ExcelJS from "exceljs";
import EscalaDAO from "../DAO/EscalaDAO.js";
import MissaDAO from "../DAO/MissaDAO.js";
import AcolitosDAO from "../DAO/AcolitosDAO.js";
import FuncaoDAO from "../DAO/FuncaoDAO.js";
import EscalaModel from "../model/EscalaModel.js";
import { dataBR } from "../lib/data.js";

// Ordem preferida das colunas de função (comum primeiro, depois as de missa solene).
const ORDEM_FUNCOES = ['Missal', 'Auxiliar', 'Vela 1', 'Vela 2', 'Turíbulo', 'Gaveta']
const semAcento = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export default class EscalaController {
  static async view(req, res) {
    let escala_list = await EscalaDAO.getAll()

    res.render('escala/listar.ejs', { escala_list })
  }

  static async viewCreate(req, res) {
    let missa_list = await MissaDAO.getAll()
    let acolitos_list = await AcolitosDAO.getAll()
    let funcao_list = await FuncaoDAO.getAll()

    res.render('escala/cadastrar.ejs', { missa_list, acolitos_list, funcao_list })
  }

  static async viewEdit(req, res) {
    let findEscala = await EscalaDAO.findById(req.params.id)
    let missa_list = await MissaDAO.getAll()
    let acolitos_list = await AcolitosDAO.getAll()
    let funcao_list = await FuncaoDAO.getAll()

    res.render('escala/alterar.ejs',{ findEscala, missa_list, acolitos_list, funcao_list })
  }

  static async create(req, res) {
    try {
      const { mis_id, aco_id, fun_id } = req.body

      if (!mis_id || !aco_id || !fun_id)
        return res.status(404).json({ ok: false })

      const escala = new EscalaModel(undefined, mis_id, aco_id, fun_id)

      let newEscala = await EscalaDAO.create(escala)

      if (newEscala == null)
        return res.status(400).json({ ok: false })

      return res.status(201).json({ ok: true })
    }
    catch (err) {
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  static async update(req,res){
    try{
      const { id, mis_id, aco_id, fun_id, status } = req.body

      if(!id || !mis_id || !aco_id || !fun_id || !status)
        return res.status(404).json({ ok: false })

      const escala = new EscalaModel(id, mis_id, aco_id, fun_id, status)

      let updatedEscala = await EscalaDAO.update(escala)

      if (updatedEscala == null)
        return res.status(400).json({ ok: false })

      return res.status(201).json({ ok: true })
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  static async deletar(req,res){
    try{
      const {id} = req.body
      if ( !id )
        return res.status(404).json({ok: false})

      let deleteEscala = await EscalaDAO.delete(id)

      if( deleteEscala == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  // GET /escala/limpar-antigas -> previa: quantas escalas/missas/indisponibilidades seriam apagadas
  static async limparAntigasContar(req, res){
    try{
      return res.json(await EscalaDAO.contarMesesPassados())
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  // POST /escala/limpar-antigas -> apaga escalas, missas e indisponibilidades de meses passados
  static async limparAntigas(req, res){
    try{
      const { escalas, missas, indisponibilidades } = await EscalaDAO.limparMesesPassados()
      return res.json({ ok: true, escalas, missas, indisponibilidades })
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  // GET /escala/exportar -> planilha .xlsx: 1 linha por missa, 1 coluna por função,
  // com o nome do(s) acólito(s) sorteado(s) na célula.
  static async exportar(req, res){
    try{
      const linhas = await EscalaDAO.paraRelatorio()

      // agrupa por missa e coleta as funções que realmente aparecem
      const missas = new Map()
      const funcoesVistas = new Set()
      for (const l of linhas){
        funcoesVistas.add(l.fun_nome)
        if (!missas.has(l.mis_id)){
          missas.set(l.mis_id, { nome: l.mis_nome, dia: l.mis_dia, hora: l.mis_hora_inicio, local: l.mis_local, funcoes: {} })
        }
        const m = missas.get(l.mis_id)
        ;(m.funcoes[l.fun_nome] = m.funcoes[l.fun_nome] || []).push(l.aco_nome)
      }

      // colunas de função: as da ORDEM_FUNCOES que apareceram, depois qualquer outra
      const colunasFuncao = []
      for (const nome of ORDEM_FUNCOES){
        const real = [...funcoesVistas].find(f => semAcento(f) === semAcento(nome))
        if (real) colunasFuncao.push(real)
      }
      for (const f of funcoesVistas) if (!colunasFuncao.includes(f)) colunasFuncao.push(f)

      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Escalas')
      ws.columns = [
        { header: 'Missa',   key: 'missa', width: 30 },
        { header: 'Data',    key: 'data',  width: 12 },
        { header: 'Horário', key: 'hora',  width: 10 },
        { header: 'Local',   key: 'local', width: 24 },
        ...colunasFuncao.map((c, i) => ({ header: c, key: 'f' + i, width: 18 }))
      ]

      for (const m of missas.values()){
        const linha = {
          missa: m.nome || '',
          data:  dataBR(m.dia),
          hora:  m.hora ? String(m.hora).slice(0, 5) : '',
          local: m.local || ''
        }
        colunasFuncao.forEach((c, i) => { linha['f' + i] = (m.funcoes[c] || []).join(', ') })
        ws.addRow(linha)
      }

      // cabeçalho: azul-marinho, texto branco, congelado
      const head = ws.getRow(1)
      head.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      head.alignment = { vertical: 'middle' }
      head.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF283A72' } } })
      ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }]
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } }

      const hoje = new Date().toISOString().slice(0, 10)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="escalas-${hoje}.xlsx"`)
      await wb.xlsx.write(res)
      res.end()
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
