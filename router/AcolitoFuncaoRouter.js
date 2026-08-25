import express from 'express'
import AcolitoFuncaoController from '../controller/AcolitoFuncaoController.js'

const router = express.Router()

router.get('/', AcolitoFuncaoController.view);
router.get('/cadastrar', AcolitoFuncaoController.viewCreate);
router.post('/cadastrar', AcolitoFuncaoController.create);
router.post('/alterar', AcolitoFuncaoController.update)
router.post('/deletar', AcolitoFuncaoController.deletar)
router.get('/alterar/:aco_id/:fun_id', AcolitoFuncaoController.viewEdit);

export default router
