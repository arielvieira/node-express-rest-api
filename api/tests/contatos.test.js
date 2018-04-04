const expect = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');

const app = require('./../../app');
const Contato = require('./../models/contato');
const { contatos, populateContatos } = require('./seed/contatosSeed');

describe('Contatos', () => {
    beforeEach(populateContatos);

    describe('GET /contatos', () => {
        it('should return all 2 contatos', (done) => {
            request(app)
                .get('/contatos')
                .expect(200)
                .expect((res) => {
                    expect(res.body.contatos.length).toBe(2);
                })
                .end(done);
        });
    })

    describe('GET /contatos/:id', () => {
        it('should return a contato', (done) => {
            request(app)
                .get(`/contatos/${contatos[0]._id.toHexString()}`)
                .expect(200)
                .expect((res) => {
                    const dataNascimento = contatos[0].dataNascimento && moment(contatos[0].dataNascimento).format('L');
                    expect(res.body.contato.email).toBe(contatos[0].email);
                    expect(res.body.contato.telefone).toBe(contatos[0].telefone);
                    expect(res.body.contato.nome).toBe(contatos[0].nome);
                    expect(res.body.contato.dataNascimento).toBe(dataNascimento);
                })
                .end(done);
        });

        it('should return 404 if contato was not found', (done) => {
            const id = new mongoose.Types.ObjectId().toHexString();

            request(app)
                .get(`/contatos/${id}`)
                .expect(404)
                .expect((res) => {
                    expect(res.body).toEqual({});
                })
                .end(done);
        });

        it('should return 404 for non-object ids', (done) => {
            request(app)
                .get('/contatos/123zxc')
                .expect(404)
                .end(done);
        });
    });

    describe('POST /contatos', () => {
        it('should create a contato', (done) => {
            const email = 'test@test.com';
            const telefone = '32118548';
            const dataNascimento = '21/08/1996';

            request(app)
                .post('/contatos')
                .send({ email, telefone })
                .expect(201)
                .end(done);
        });

        it('should return validation errors if request parameters is invalid', (done) => {
            const nome = '';
            const telefone = '+5 34 9974-12191';
            const email = 'ariel';

            request(app)
                .post('/contatos')
                .send({ email, telefone, nome })
                .expect(400)
                .expect((res) => {
                    expect(res.body.error.nome).toBeTruthy()
                    expect(res.body.error.email).toBeTruthy()
                    expect(res.body.error.telefone).toBeTruthy()
                })
                .end(done);
        });

        it('should return validation error for invalid dataNascimento', (done) => {
            request(app)
                .post('/contatos')
                .send({
                    email: 'joaquinha80@yahoo.com',
                    telefone: '34 99764-1218',
                    dataNascimento: '35-18-1998'
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body.error.dataNascimento).toBeTruthy()
                })
                .end(done);
        });

        it('should not create contato if email is already in use', (done) => {
            request(app)
                .post('/contatos')
                .send({
                    email: contatos[0].email,
                    telefone: contatos[0].telefone
                })
                .expect(409)
                .end(done);
        });
    });
});
