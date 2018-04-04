const express = require('express');
const router = express.Router();
const { middleware: paginationMiddleware } = require('express-paginate');

const ContatoController = require('../controllers/contato');

const verifyDataNascimento = require('../middlewares/verifyDataNascimento');
const checkAuth = require('../middlewares/checkAuth');
const pagination = paginationMiddleware(10, 25);

router.get('/', checkAuth, pagination, ContatoController.get_all_contatos);

router.get('/:id', checkAuth, ContatoController.get_contato);

router.post('/', checkAuth, verifyDataNascimento, ContatoController.create_contato);

router.patch('/:id', checkAuth, verifyDataNascimento, ContatoController.update_contato);

router.delete('/:id', checkAuth, ContatoController.delete_contato);

module.exports = router;
