const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
moment.locale('pt-br');

const Contato = require('../models/contato');

const verifyDataNascimento = require('../middlewares/verifyDataNascimento');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, async (req, res, next) => {
    const contatosResult = await Contato.find({ _creator: req.userData.userId });

    const contatos = contatosResult.map((contato) => {
        let dataNascimento = contato.dataNascimento && moment(contato.dataNascimento).format('L');
        return { ...contato._doc, dataNascimento }
    });

    res.send({ contatos });
});

router.get('/:id', checkAuth, async (req, res, next) => {
    try {
        const contatoResult = await Contato.findOne({ _id: req.params.id, _creator: req.userData.userId });
        const dataNascimento = contatoResult.dataNascimento && moment(contatoResult.dataNascimento).format('L');
        const contato = { ...contatoResult._doc, dataNascimento };

        res.send({ contato });
    } catch (error) {
        res.status(404).send();
    }
});

router.post('/', checkAuth, verifyDataNascimento, async (req, res, next) => {
    const contatoData = { email, telefone, nome } = req.body;
    const _creator = req.userData.userId;
    try {
        const contatoResult = await Contato.findOne({ email, _creator });
        if (contatoResult) {
            return res.status(409).json({
                error: { email: { message: `${contatoResult.email} already exists` } }
            })
        }

        const contato = new Contato({
            _id: new mongoose.Types.ObjectId(),
            ...contatoData,
            _creator,
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

router.patch('/:id', checkAuth, verifyDataNascimento, async (req, res, next) => {
    try {
        const contatoUpdate = { ...req.body, dataNascimento: req.dataNascimento }
        const contatoResult = await Contato.findOneAndUpdate(
            {
                _id: req.params.id,
                _creator: req.userData.userId
            },
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

router.delete('/:id', checkAuth, async (req, res, next) => {
    try {
        const contato = await Contato.findOneAndRemove({ _id: req.params.id, _creator: req.userData.userId });
        if (!contato) {
            return res.status(404).send({});
        }

        res.send();
    } catch (err) {
        res.status(404).send({});
    }
});

module.exports = router;
