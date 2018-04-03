const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');

const Contato = require('../models/contato');

router.post('/', async (req, res, next) => {
    try {
        const contatosResults = await Contato.find({ email: req.body.email }).exec()
        const hasContatos = contatosResults.length >= 1;
        if (hasContatos) {
            return res.status(409).json({
                error: { email: { message: `${contatosResults[0].email} already exists` } }
            })
        }

        let dataMoment;
        const dataNascimento = req.body.dataNascimento;
        if (dataNascimento) {
            const regex = /^(0?[1-9][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](\d{4}|\d{2})$/;
            const match = dataNascimento.match(regex);

            dataMoment = moment(dataNascimento, 'DD/MM/YYYY');
            const dataIsInvalid = dataMoment.toDate().toString() === 'Invalid Date';

            if (!match || dataIsInvalid) {
                return res.status(400).json({
                    error: { dataNascimento: { message: 'dataNascimento is invalid' } }
                })
            }
            dataMoment = dataMoment.toDate();
        }

        const contato = new Contato({
            _id: new mongoose.Types.ObjectId(),
            nome: req.body.nome,
            dataNascimento: dataMoment,
            email: req.body.email,
            telefone: req.body.telefone,
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
