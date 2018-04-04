const moment = require('moment');

const verifyDataNascimento = (req, res, next) => {
    let dateMoment;
    const dataNascimento = req.body.dataNascimento;
    if (dataNascimento) {
        const regex = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/;
        const match = dataNascimento.match(regex);

        dateMoment = moment(dataNascimento, 'DD/MM/YYYY');
        const dateIsInvalid = dateMoment.toDate().toString() === 'Invalid Date';

        const currentDate = moment(new Date());
        const isFutureDate = currentDate < dateMoment;

        if (!match || dateIsInvalid || isFutureDate) {
            return res.status(400).json({
                error: { dataNascimento: { message: 'dataNascimento is invalid' } }
            })
        }
        dateMoment = dateMoment.toDate();
    }
    req.dataNascimento = dateMoment;
    next();
};

module.exports = verifyDataNascimento;
