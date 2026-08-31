import express from 'express'
import EscalaController from '../controller/EscalaController.js'
import SorteadorController from '../controller/SorteadorController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';

const router = express.Router()

router.get('/', EscalaController.view);
router.get('/exportar', AuthMiddleware.adminlogin , EscalaController.exportar);
router.get('/limpar-antigas',AuthMiddleware.adminlogin, EscalaController.limparAntigasContar);
router.post('/limpar-antigas',AuthMiddleware.adminlogin, EscalaController.limparAntigas);
router.get('/sorteador',AuthMiddleware.adminlogin, SorteadorController.view);
router.post('/sorteador/sortear',AuthMiddleware.adminlogin, SorteadorController.sortear);
router.post('/sorteador/sortear-mes',AuthMiddleware.adminlogin, SorteadorController.sortearMes);
router.post('/sorteador/salvar',AuthMiddleware.adminlogin, SorteadorController.salvar);
router.get('/cadastrar',AuthMiddleware.adminlogin, EscalaController.viewCreate);
router.post('/cadastrar',AuthMiddleware.adminlogin, EscalaController.create);
router.post('/alterar',AuthMiddleware.adminlogin, EscalaController.update)
router.post('/deletar',AuthMiddleware.adminlogin, EscalaController.deletar)
router.get('/alterar/:id',AuthMiddleware.adminlogin, EscalaController.viewEdit);

export default router
