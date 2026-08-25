import express from 'express'
import FuncaoController from '../controller/FuncaoController.js'

const router = express.Router()

router.get('/', FuncaoController.view);
router.get('/cadastrar', FuncaoController.viewCreate);
router.post('/cadastrar', FuncaoController.create);
router.post('/alterar', FuncaoController.update)
router.post('/deletar', FuncaoController.deletar)
router.get('/alterar/:id', FuncaoController.viewEdit);

export default router
