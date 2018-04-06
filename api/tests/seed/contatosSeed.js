const mongoose = require('mongoose');
const moment = require('moment');

const Contato = require('./../../models/contato');
const { users } = require('./userSeed');

const contatos = [
    {
        _id: new mongoose.Types.ObjectId(),
        nome: 'João Nascimento',
        dataNascimento: moment('15/01/1988', 'DD/MM/YYYY'),
        email: 'joao@gmail.com',
        telefone: '32117848',
        _creator: users[0]._id
    },
    {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Ricardo Martins',
        dataNascimento: moment('16/04/1996', 'DD/MM/YYYY'),
        email: 'maria@gmail.com',
        telefone: '22 99964-1248',
        _creator: users[1]._id
    },
    {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Maria Souza',
        dataNascimento: moment('02/12/1991', 'DD/MM/YYYY'),
        email: 'maria@gmail.com',
        telefone: '32746458',
        _creator: users[0]._id
    },
];

const populateContatos = (done) => {
    Contato.remove({})
        .then(() => {
            const contatoOne = new Contato(contatos[0]).save();
            const contatoTwo = new Contato(contatos[1]).save();
            const contatoThree = new Contato(contatos[2]).save();
            return Promise.all([contatoOne, contatoTwo, contatoThree]);
        })
        .then(() => done())
        .catch((err) => done(err));
}

module.exports = { contatos, populateContatos };
