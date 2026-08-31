import express from "express";
import HomeController from "../controller/HomeController.js";

const router = express.Router()

router.get('/', HomeController.home)
router.get('/login', HomeController.login)
router.post('/login', HomeController.efetuarLogin)
export default router