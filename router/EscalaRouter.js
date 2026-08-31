import express from 'express'
import EscalaController from '../controller/EscalaController.js'
import SorteadorController from '../controller/SorteadorController.js';

const router = express.Router()

router.get('/', EscalaController.view);
router.get('/limpar-antigas', EscalaController.limparAntigasContar);
router.post('/limpar-antigas', EscalaController.limparAntigas);
router.get('/sorteador', SorteadorController.view);
router.post('/sorteador/sortear', SorteadorController.sortear);
router.post('/sorteador/sortear-mes', SorteadorController.sortearMes);
router.post('/sorteador/salvar', SorteadorController.salvar);
router.get('/cadastrar', EscalaController.viewCreate);
router.post('/cadastrar', EscalaController.create);
router.post('/alterar', EscalaController.update)
router.post('/deletar', EscalaController.deletar)
router.get('/alterar/:id', EscalaController.viewEdit);

export default router
