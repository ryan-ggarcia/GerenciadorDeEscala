import FuncaoDAO from "../DAO/FuncaoDAO.js";
import FuncaoModel from "../model/FuncaoModel.js";

export default class FuncaoController {
  static async view(req, res) {
    let funcao_list = await FuncaoDAO.getAll()

    res.render('funcao/listar.ejs', { funcao_list })
  }

  static async viewCreate(req, res) {
    res.render('funcao/cadastrar.ejs')
  }

  static async viewEdit(req, res) {
    let findFuncao = await FuncaoDAO.findById(req.params.id)

    res.render('funcao/alterar.ejs',{ findFuncao })
  }

  static async create(req, res) {
    try {
      const { nome, descricao } = req.body

      if (!nome)
        return res.status(404).json({ ok: false })

      const funcao = new FuncaoModel(undefined, nome, descricao)

      let newFuncao = await FuncaoDAO.create(funcao)

      if (newFuncao == null)
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
      const { id, nome, descricao } = req.body

      if(!id || !nome)
        return res.status(404).json({ ok: false })

      const funcao = new FuncaoModel(id, nome, descricao)

      let updatedFuncao = await FuncaoDAO.update(funcao)

      if (updatedFuncao == null)
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

      let deleteFuncao = await FuncaoDAO.delete(id)

      if( deleteFuncao == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
