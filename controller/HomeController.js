import bcrypt from 'bcrypt'
import UserModel from '../model/UserModel.js'
import UserDAO from '../DAO/UserDAO.js'
export default class HomeController {
    static async home(req, res) {
        res.render('index.ejs')
    }

    // Só renderiza a tela de login (página isolada, sem o layout com a sidebar).
    // A autenticação (POST /login, bcrypt, sessão, middleware) fica por sua conta.
    static async login(req, res) {
        res.render('login', { layout: false })
    }
    static async efetuarLogin(req, res) {
        const { usuario, senha } = req.body
        let user = await UserDAO.findBy(usuario)
        if (user) {
            if (await bcrypt.compare(senha, user.usu_senha)) {
                res.cookie("usuarioLogado", user.usu_id)
                return res.redirect("/")
            }
            else
                return res.status(404).render("404", { layout: false })
        }
        else
            return res.status(500).render("500",{ layout: false })
    }
}
