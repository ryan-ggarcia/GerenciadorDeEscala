import MissaRepository from "../repositories/MissaRepository.js";

export default class MissaController {
  static async view(req, res) {
    let missa_list = await MissaRepository.getAll()

    res.render('missa/listar.ejs', { missa_list })
  }

  static async viewCreate(req, res) {
    res.render('missa/cadastrar.ejs')
  }

  static async viewEdit(req, res) {
    let findMissa = await MissaRepository.findById(req.params.id)

    res.render('missa/alterar.ejs',{ findMissa })
  }

  static async create(req, res) {
    try {
      const { name, date, timeStart, timeEnd, location } = req.body

      if (!name || !date || !timeStart || !timeEnd || !location)
        return res.status(404).json({ ok: false })

      let newMissa = await MissaRepository.create({ name: name, date: date, timeStart: timeStart, timeEnd: timeEnd, location: location })

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

      let updatedMissa = await MissaRepository.update({ id: id, name: name, date: date, timeStart: timeStart, timeEnd: timeEnd, location: location })

      if (updatedMissa == null)
        return res.status(400).json({ ok: false })

      return res.status(201).json({ ok: true })
    }
    catch(err){
      console.log(err)
      return res.status(500).json({ ok: false })
    }
  }

}