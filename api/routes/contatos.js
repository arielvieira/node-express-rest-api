const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
moment.locale('pt-br');

const Contato = require('../models/contato');

const verifyDataNascimento = require('../middlewares/verifyDataNascimento');

router.get('/', async (req, res, next) => {
    const contatosResult = await Contato.find({});

    const contatos = contatosResult.map((contato) => {
        let dataNascimento = contato.dataNascimento && moment(contato.dataNascimento).format('L');
        return { ...contato._doc, dataNascimento }
    });

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

router.patch('/:id', verifyDataNascimento, async (req, res, next) => {
    try {
        const contatoUpdate = { ...req.body, dataNascimento: req.dataNascimento }
        const contatoResult = await Contato.findOneAndUpdate(
            { _id: req.params.id },
            { $set: contatoUpdate },
            { new: true, runValidators: true }
        );
        if (!contatoResult) {
            return res.status(404).send();
        }

        const dataNascimento = contatoResult.dataNascimento && moment(contatoResult.dataNascimento).format('L');
        const contato = { ...contatoResult._doc, dataNascimento };

        res.send({ contato });
    } catch (error) {
        if (error.errors) {
            return res.status(400).send({ error: error.errors });
        }
        if (error.codeName === 'DuplicateKey') {
            return res.status(400).send({
                error: {
                    email: { message: `${req.body.email} already exists` }
                }
            });
        }
        res.status(404).send();
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const contato = await Contato.findOneAndRemove({ _id: req.params.id, });
        if (!contato) {
            return res.status(404).send({});
        }
        
        res.send();
    } catch (err) {
        res.status(404).send({});
    }
});

module.exports = router;
