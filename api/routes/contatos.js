const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
moment.locale('pt-br');

const Contato = require('../models/contato');

const verifyDataNascimento = require('../middlewares/verifyDataNascimento');

router.get('/', async (req, res, next) => {
    const contatos = await Contato.find({});

    res.send({ contatos });
});

router.get('/:id', async (req, res, next) => {
    try {
        const contatoResult = await Contato.findOne({ _id: req.params.id });
        const dataNascimento = contatoResult.dataNascimento && moment(contatoResult.dataNascimento).format('L');
        const contato = { ...contatoResult._doc, dataNascimento };

        res.send({ contato });
    } catch (error) {
        res.status(404).send();
    }
});

router.post('/', verifyDataNascimento, async (req, res, next) => {
    const contatoData = { email, telefone, nome } = req.body;
    try {
        const contatoResult = await Contato.findOne({ email });
        if (contatoResult) {
            return res.status(409).json({
                error: { email: { message: `${contatoResult.email} already exists` } }
            })
        }

        const contato = new Contato({
            _id: new mongoose.Types.ObjectId(),
            ...contatoData,
            dataNascimento: req.dataNascimento,
        });

        await contato.save();
        res.status(201).json({
            message: 'Contato created'
        })
    } catch (err) {
        res.status(400).json({
            error: err.errors
        })
    }
});

module.exports = router;
