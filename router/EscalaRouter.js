import express from 'express'
import EscalaController from '../controller/EscalaController.js'

const router = express.Router()

router.get('/', EscalaController.view);
router.get('/cadastrar', EscalaController.viewCreate);
router.post('/cadastrar', EscalaController.create);
router.post('/alterar', EscalaController.update)
router.post('/deletar', EscalaController.deletar)
router.get('/alterar/:id', EscalaController.viewEdit);

export default router
