import express from 'express'
import AcolitosController from '../controller/AcolitosController.js'

const router = express.Router()

router.get('/', AcolitosController.view);
router.get('/cadastrar', AcolitosController.viewCreate);
router.post('/cadastrar', AcolitosController.create);
router.post('/alterar', AcolitosController.update)
router.post('/deletar', AcolitosController.deletar)
router.get('/alterar/:id', AcolitosController.viewEdit);

export default router
