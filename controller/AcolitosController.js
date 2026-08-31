import AcolitosDAO from "../DAO/AcolitosDAO.js";
import AcolitosModel from "../model/AcolitosModel.js";

export default class AcolitosController {
  static async view(req, res) {
    let acolitos_list = await AcolitosDAO.getAll()

    res.render('acolitos/listar.ejs', { acolitos_list })
  }

  static async viewCreate(req, res) {
    res.render('acolitos/cadastrar.ejs')
  }

  static async viewEdit(req, res) {
    let findAcolito = await AcolitosDAO.findById(req.params.id)

    res.render('acolitos/alterar.ejs',{ findAcolito })
  }

  static async create(req, res) {
    try {
      const { nome, status } = req.body

      if (!nome || !status)
        return res.status(404).json({ ok: false })

      const acolito = new AcolitosModel(undefined, nome, status)

      let newAcolito = await AcolitosDAO.create(acolito)

      if (newAcolito == null)
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
      const { id, nome, status } = req.body

      if(!id || !nome || !status)
        return res.status(404).json({ ok: false })

      const acolito = new AcolitosModel(id, nome, status)

      let updatedAcolito = await AcolitosDAO.update(acolito)

      if (updatedAcolito == null)
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

      let deleteAcolito = await AcolitosDAO.delete(id)

      if( deleteAcolito == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}
