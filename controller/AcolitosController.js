import AcolitosRepository from "../repositories/AcolitosRepository.js";

export default class AcolitosController {
  static async view(req, res) {
    let acolitos_list = await AcolitosRepository.getAll()

    res.render('acolitos/listar.ejs', { acolitos_list })
  }

  static async viewCreate(req, res) {
    res.render('acolitos/cadastrar.ejs')
  }

  static async viewEdit(req, res) {
    let findAcolito = await AcolitosRepository.findById(req.params.id)

    res.render('acolitos/alterar.ejs',{ findAcolito })
  }

  static async create(req, res) {
    try {
      const { nome, status } = req.body

      if (!nome || !status)
        return res.status(404).json({ ok: false })

      let newAcolito = await AcolitosRepository.create({ nome: nome, status: status })

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

      let updatedAcolito = await AcolitosRepository.update({ id: id, nome: nome, status: status })

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

      let deleteAcolito = await AcolitosRepository.delete(id)

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
