import MissaRepository from "../repositories/MissaRepository.js";

export default class MissaController {
    static async view(req, res) {
      let missa_list = await MissaRepository.getAll()
      
      res.render('missa/listar.ejs', {missa_list})
    }
    static async viewCreate(req,res){
        res.render('missa/cadastrar.ejs')
    }
    static async viewEdit(req,res){
        res.render('missa/alterar.ejs')
    }

}