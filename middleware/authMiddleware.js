export default class AuthMiddleware {
    static adminlogin(req, res, next) {
        const id = req.cookies?.usuarioLogado
        if (id != undefined && id == 1) {     // cookie é string "1"; == 1 resolve
            res.locals.user = id
            return next()
        }
        return res.redirect('/login')
    }
}