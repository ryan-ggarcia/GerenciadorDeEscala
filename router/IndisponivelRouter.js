import express from 'express'
import IndisponivelController from '../controller/IndisponivelController.js'

const router = express.Router()

router.get('/', IndisponivelController.view);
router.get('/cadastrar', IndisponivelController.viewCreate);
router.post('/cadastrar', IndisponivelController.create);
router.post('/alterar', IndisponivelController.update)
router.post('/deletar', IndisponivelController.deletar)
router.get('/alterar/:id', IndisponivelController.viewEdit);

export default router
