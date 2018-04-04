const mongoose = require('mongoose');
const { hasNextPages } = require('express-paginate');
const moment = require('moment');
moment.locale('pt-br');

const Contato = require('../models/contato');

exports.get_all_contatos = async (req, res, next) => {
    const _creator = req.userData.userId;
    const { limit, page } = req.query;
    try {
        const [contatosResult, contatosCount] = await Promise.all([
            Contato.find({ _creator }).limit(limit).skip(req.skip).lean(),
            Contato.count({})
        ]);

        const pageCount = Math.ceil(contatosCount / limit);

        const contatos = contatosResult.map((contato) => {
            let dataNascimento = contato.dataNascimento && moment(contato.dataNascimento).format('L');
            return { ...contato, dataNascimento }
        });

        res.send({
            number_of_pages: pageCount,
            page,
            has_more: hasNextPages(req)(pageCount),
            contatos_per_page: limit,
            contatos
        });
    } catch (err) {
        res.status(400).send();
    }
};

exports.get_contato = async (req, res, next) => {
    try {
        const contatoResult = await Contato.findOne({ _id: req.params.id, _creator: req.userData.userId }).lean();
        const dataNascimento = contatoResult.dataNascimento && moment(contatoResult.dataNascimento).format('L');
        const contato = { ...contatoResult, dataNascimento };

        res.send({ contato });
    } catch (error) {
        res.status(404).send();
    }
};

exports.create_contato = async (req, res, next) => {
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
};

exports.update_contato = async (req, res, next) => {
    try {
        const contatoUpdate = { ...req.body, dataNascimento: req.dataNascimento }
        const contatoResult = await Contato.findOneAndUpdate(
            {
                _id: req.params.id,
                _creator: req.userData.userId
            },
            { $set: contatoUpdate },
            { new: true, runValidators: true }
        ).lean();
        if (!contatoResult) {
            return res.status(404).send();
        }

        const dataNascimento = contatoResult.dataNascimento && moment(contatoResult.dataNascimento).format('L');
        const contato = { ...contatoResult, dataNascimento };

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
};

exports.delete_contato = async (req, res, next) => {
    const _creator = req.userData.userId;
    try {
        const contato = await Contato.findOneAndRemove({ _id: req.params.id, _creator });
        if (!contato) {
            return res.status(404).send();
        }

        res.send();
    } catch (err) {
        res.status(404).send();
    }
};
