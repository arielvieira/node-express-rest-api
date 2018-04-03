const mongoose = require('mongoose');
const moment = require('moment');

const Contato = require('./../../models/contato');

const contatos = [
    {
        _id: new mongoose.Types.ObjectId(),
        nome: 'João Nascimento',
        dataNascimento: moment('15/01/1988', 'DD/MM/YYYY'),
        email: 'joao@gmail.com',
        telefone: '32117848',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Maria Souza',
        dataNascimento: moment('02/12/1991', 'DD/MM/YYYY'),
        email: 'maria@gmail.com',
        telefone: '32746458',
    },
];

const populateContatos = (done) => {
    Contato.remove({})
        .then(() => {
            const contatoOne = new Contato(contatos[0]).save();
            const contatoTwo = new Contato(contatos[1]).save();
            return Promise.all([contatoOne, contatoTwo]);
        })
        .then(() => done())
        .catch((err) => done(err));
}

module.exports = { contatos, populateContatos };
