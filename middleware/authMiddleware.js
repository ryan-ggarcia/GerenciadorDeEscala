export default class AuthMiddleware {
    static adminlogin(req, res, next) {
        const id = req.cookies?.usuarioLogado
        if (id != undefined && id == 1) {     // cookie é string "1"; == 1 resolve
            res.locals.user = id
            return next()
        }
        return res.redirect('/login')
    }

    // Não bloqueia nada: só deixa `logado` disponível nos templates para
    // mostrar/esconder os botões de administração (editar, excluir, escalar...).
    static exporLogin(req, res, next) {
        const id = req.cookies?.usuarioLogado
        res.locals.logado = id != undefined && id == 1
        next()
    }
}