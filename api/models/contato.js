const mongoose = require('mongoose');
const validator = require('validator');

const contatoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nome: {
        type: String,
        trim: true,
        minlength: 1,
        required: true,
    },
    dataNascimento: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Path {value} is not a valid email'
        }
    },
    telefone: {
        type: String,
        required: true,
        trim: true,
        match: /^(?:(?:\+)?(55)\s?)?(?:\(?([0])?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Contato', contatoSchema);
