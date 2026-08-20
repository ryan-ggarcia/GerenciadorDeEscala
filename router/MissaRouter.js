import express from 'express'
import MissaController from '../controller/MissaController.js'

const router = express.Router()

router.get('/', MissaController.view);
router.get('/cadastrar', MissaController.viewCreate);
router.post('/cadastrar', MissaController.create);
router.post('/alterar', MissaController.update)
router.get('/alterar/:id', MissaController.viewEdit);

export default router