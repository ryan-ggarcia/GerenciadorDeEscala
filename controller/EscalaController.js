import EscalaRepository from "../repositories/EscalaRepository.js";
import MissaRepository from "../repositories/MissaRepository.js";
import AcolitosRepository from "../repositories/AcolitosRepository.js";
import FuncaoRepository from "../repositories/FuncaoRepository.js";

export default class EscalaController {
  static async view(req, res) {
    let escala_list = await EscalaRepository.getAll()

    res.render('escala/listar.ejs', { escala_list })
  }

  static async viewCreate(req, res) {
    let missa_list = await MissaRepository.getAll()
    let acolitos_list = await AcolitosRepository.getAll()
    let funcao_list = await FuncaoRepository.getAll()

    res.render('escala/cadastrar.ejs', { missa_list, acolitos_list, funcao_list })
  }

  static async viewEdit(req, res) {
    let findEscala = await EscalaRepository.findById(req.params.id)
    let missa_list = await MissaRepository.getAll()
    let acolitos_list = await AcolitosRepository.getAll()
    let funcao_list = await FuncaoRepository.getAll()

    res.render('escala/alterar.ejs',{ findEscala, missa_list, acolitos_list, funcao_list })
  }

  static async create(req, res) {
    try {
      const { mis_id, aco_id, fun_id } = req.body

      if (!mis_id || !aco_id || !fun_id)
        return res.status(404).json({ ok: false })

      let newEscala = await EscalaRepository.create({ mis_id: mis_id, aco_id: aco_id, fun_id: fun_id })

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

      let updatedEscala = await EscalaRepository.update({ id: id, mis_id: mis_id, aco_id: aco_id, fun_id: fun_id, status: status })

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

      let deleteEscala = await EscalaRepository.delete(id)

      if( deleteEscala == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
