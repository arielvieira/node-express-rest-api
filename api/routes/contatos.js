const express = require('express');
const router = express.Router();

const ContatoController = require('../controllers/contato');

const verifyDataNascimento = require('../middlewares/verifyDataNascimento');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, ContatoController.get_all_contatos );

router.get('/:id', checkAuth, ContatoController.get_contato);

router.post('/', checkAuth, verifyDataNascimento, ContatoController.create_contato);

router.patch('/:id', checkAuth, verifyDataNascimento, ContatoController.update_contato);

router.delete('/:id', checkAuth, ContatoController.delete_contato);

module.exports = router;
