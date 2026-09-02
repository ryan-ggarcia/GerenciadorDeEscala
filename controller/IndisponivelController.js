import IndisponivelDAO from "../DAO/IndisponivelDAO.js";
import AcolitosDAO from "../DAO/AcolitosDAO.js";
import IndisponivelModel from "../model/IndisponivelModel.js";

export default class IndisponivelController {
  static async view(req, res) {
    let indisponivel_list = await IndisponivelDAO.getAll()

    res.render('indisponivel/listar.ejs', { indisponivel_list })
  }

  static async viewCreate(req, res) {
    let acolitos_list = await AcolitosDAO.getAll()

    res.render('indisponivel/cadastrar.ejs', { acolitos_list })
  }

  static async viewEdit(req, res) {
    let findIndisponivel = await IndisponivelDAO.findById(req.params.id)
    let acolitos_list = await AcolitosDAO.getAll()

    res.render('indisponivel/alterar.ejs',{ findIndisponivel, acolitos_list })
  }

  static async create(req, res) {
    try {
      const { aco_id, dataInicio, dataFim, motivo } = req.body

      if (!aco_id || !dataInicio || !dataFim)
        return res.status(404).json({ ok: false })

      const indisponivel = new IndisponivelModel(undefined, aco_id, dataInicio, dataFim, motivo)

      let newIndisponivel = await IndisponivelDAO.create(indisponivel)

      if (newIndisponivel == null)
        return res.status(400).json({ ok: false })

      // tira o acólito de escalas já montadas que caem nesse período
      const escalasRemovidas = await IndisponivelDAO.removerEscalasNoPeriodo(aco_id, dataInicio, dataFim)

      return res.status(201).json({ ok: true, escalasRemovidas })
    }
    catch (err) {
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

  static async update(req,res){
    try{
      const { id, aco_id, dataInicio, dataFim, motivo } = req.body

      if(!id || !aco_id || !dataInicio || !dataFim)
        return res.status(404).json({ ok: false })

      const indisponivel = new IndisponivelModel(id, aco_id, dataInicio, dataFim, motivo)

      let updatedIndisponivel = await IndisponivelDAO.update(indisponivel)

      if (updatedIndisponivel == null)
        return res.status(400).json({ ok: false })

      // tira o acólito de escalas já montadas que caem no novo período
      const escalasRemovidas = await IndisponivelDAO.removerEscalasNoPeriodo(aco_id, dataInicio, dataFim)

      return res.status(201).json({ ok: true, escalasRemovidas })
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

      let deleteIndisponivel = await IndisponivelDAO.delete(id)

      if( deleteIndisponivel == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
