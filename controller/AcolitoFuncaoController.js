import AcolitoFuncaoDAO from "../DAO/AcolitoFuncaoDAO.js";
import AcolitosDAO from "../DAO/AcolitosDAO.js";
import FuncaoDAO from "../DAO/FuncaoDAO.js";
import AcolitoFuncaoModel from "../model/AcolitoFuncaoModel.js";

export default class AcolitoFuncaoController {
  static async view(req, res) {
    let acolitofuncao_list = await AcolitoFuncaoDAO.getAll()

    res.render('acolitofuncao/listar.ejs', { acolitofuncao_list })
  }

  static async viewCreate(req, res) {
    let acolitos_list = await AcolitosDAO.getAll()
    let funcao_list = await FuncaoDAO.getAll()

    res.render('acolitofuncao/cadastrar.ejs', { acolitos_list, funcao_list })
  }

  static async viewEdit(req, res) {
    let findAcolitoFuncao = await AcolitoFuncaoDAO.findByIds(req.params.aco_id, req.params.fun_id)
    let acolitos_list = await AcolitosDAO.getAll()
    let funcao_list = await FuncaoDAO.getAll()

    res.render('acolitofuncao/alterar.ejs',{ findAcolitoFuncao, acolitos_list, funcao_list })
  }

  static async create(req, res) {
    try {
      const { aco_id, fun_id, podeServir } = req.body

      if (!aco_id || !fun_id)
        return res.status(404).json({ ok: false })

      const acolitoFuncao = new AcolitoFuncaoModel(aco_id, fun_id, podeServir)

      let newAcolitoFuncao = await AcolitoFuncaoDAO.create(acolitoFuncao)

      if (newAcolitoFuncao == null)
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
      const { oldAcoId, oldFunId, aco_id, fun_id, podeServir } = req.body

      if(!oldAcoId || !oldFunId || !aco_id || !fun_id)
        return res.status(404).json({ ok: false })

      const acolitoFuncao = new AcolitoFuncaoModel(aco_id, fun_id, podeServir)

      let updatedAcolitoFuncao = await AcolitoFuncaoDAO.update(acolitoFuncao, oldAcoId, oldFunId)

      if (updatedAcolitoFuncao == null)
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
      const { aco_id, fun_id } = req.body
      if ( !aco_id || !fun_id )
        return res.status(404).json({ok: false})

      let deleteAcolitoFuncao = await AcolitoFuncaoDAO.delete(aco_id, fun_id)

      if( deleteAcolitoFuncao == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
