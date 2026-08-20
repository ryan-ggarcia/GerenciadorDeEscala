import express from 'express'
import MissaController from '../controller/MissaController.js'

const router = express.Router()

router.get('/', MissaController.view);
router.get('/cadastrar', MissaController.viewCreate);
router.get('/alterar', MissaController.viewEdit);
router.post('/cadastrar', MissaController.create);

export default router