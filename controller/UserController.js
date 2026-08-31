import UserDAO from "../DAO/UserDAO.js";

export default class UserController {
    static async list(req, res) {
        const users = await UserDAO.getAllUsers();
        res.status(200).json(users);
    }
}