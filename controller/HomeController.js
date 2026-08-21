export default class HomeController {
    static async home(req, res) {
        res.render('index.ejs')
    }
}
