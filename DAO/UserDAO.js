import pool from '../config/db.js'
import UserModel from '../model/UserModel.js'

export default class UserDAO{
    static async getAllUsers(){
        const { rows } = await pool.query('SELECT usu_id, usu_nome FROM usuario')
        return rows.map(row => new UserModel(row.usu_id, row.usu_nome, null))
    }
}