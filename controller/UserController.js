import UserRepository from "../repositories/UserRepository.js";

export default class UserController {
    static async list(req, res) {
        const users = await UserRepository.getAllUsers();
        res.status(200).json(users);
    }
}