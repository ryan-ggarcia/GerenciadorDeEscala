import AcolitoFuncaoRepository from "../repositories/AcolitoFuncaoRepository.js";
import AcolitosRepository from "../repositories/AcolitosRepository.js";
import FuncaoRepository from "../repositories/FuncaoRepository.js";

export default class AcolitoFuncaoController {
  static async view(req, res) {
    let acolitofuncao_list = await AcolitoFuncaoRepository.getAll()

    res.render('acolitofuncao/listar.ejs', { acolitofuncao_list })
  }

  static async viewCreate(req, res) {
    let acolitos_list = await AcolitosRepository.getAll()
    let funcao_list = await FuncaoRepository.getAll()

    res.render('acolitofuncao/cadastrar.ejs', { acolitos_list, funcao_list })
  }

  static async viewEdit(req, res) {
    let findAcolitoFuncao = await AcolitoFuncaoRepository.findByIds(req.params.aco_id, req.params.fun_id)
    let acolitos_list = await AcolitosRepository.getAll()
    let funcao_list = await FuncaoRepository.getAll()

    res.render('acolitofuncao/alterar.ejs',{ findAcolitoFuncao, acolitos_list, funcao_list })
  }

  static async create(req, res) {
    try {
      const { aco_id, fun_id, podeServir } = req.body

      if (!aco_id || !fun_id)
        return res.status(404).json({ ok: false })

      let newAcolitoFuncao = await AcolitoFuncaoRepository.create({ aco_id: aco_id, fun_id: fun_id, podeServir: podeServir })

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

      let updatedAcolitoFuncao = await AcolitoFuncaoRepository.update({ oldAcoId: oldAcoId, oldFunId: oldFunId, aco_id: aco_id, fun_id: fun_id, podeServir: podeServir })

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

      let deleteAcolitoFuncao = await AcolitoFuncaoRepository.delete(aco_id, fun_id)

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
