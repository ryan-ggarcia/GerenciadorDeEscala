import MissaDAO from "../DAO/MissaDAO.js";
import MissaModel from "../model/MissaModel.js";

export default class MissaController {
  static async view(req, res) {
    let missa_list = await MissaDAO.getAll()

    res.render('missa/listar.ejs', { missa_list })
  }

  static async viewCreate(req, res) {
    res.render('missa/cadastrar.ejs')
  }

  static async viewEdit(req, res) {
    let findMissa = await MissaDAO.findById(req.params.id)

    res.render('missa/alterar.ejs',{ findMissa })
  }

  static async create(req, res) {
    try {
      const { name, date, timeStart, timeEnd, location } = req.body

      if (!name || !date || !timeStart || !timeEnd || !location)
        return res.status(404).json({ ok: false })

      const missa = new MissaModel(undefined, location, name, date, timeStart, timeEnd)

      let newMissa = await MissaDAO.create(missa)

      if (newMissa == null)
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
      const { id, name, date,timeStart, timeEnd, location } = req.body

      if(!id || !name || !date || !timeStart || !timeEnd || !location)
        return res.status(404).json({ ok: false })

      const missa = new MissaModel(id, location, name, date, timeStart, timeEnd)

      let updatedMissa = await MissaDAO.update(missa)

      if (updatedMissa == null)
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

      let deleteMissa = await MissaDAO.delete(id)

      if( deleteMissa == null )
        return res.status(500).json({ok:false})

      return res.status(200).json({ok:true})
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}