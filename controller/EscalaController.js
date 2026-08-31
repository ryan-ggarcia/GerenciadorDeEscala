import EscalaDAO from "../DAO/EscalaDAO.js";
import MissaDAO from "../DAO/MissaDAO.js";
import AcolitosDAO from "../DAO/AcolitosDAO.js";
import FuncaoDAO from "../DAO/FuncaoDAO.js";
import EscalaModel from "../model/EscalaModel.js";

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

  // GET /escala/limpar-antigas -> previa: quantas escalas/missas seriam apagadas
  static async limparAntigasContar(req, res){
    try{
      return res.json(await EscalaDAO.contarMesesPassados())
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  // POST /escala/limpar-antigas -> apaga escalas e missas de meses passados
  static async limparAntigas(req, res){
    try{
      const { escalas, missas } = await EscalaDAO.limparMesesPassados()
      return res.json({ ok: true, escalas, missas })
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
