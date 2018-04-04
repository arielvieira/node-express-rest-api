const expect = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');

const app = require('./../../app');
const Contato = require('./../models/contato');
const { contatos, populateContatos } = require('./seed/contatosSeed');
const { users } = require('./seed/userSeed');

beforeEach(populateContatos);
describe('Tests', async () => {
    const tokenUserOne = await users[0].generateAuthToken();
    const tokenUserTwo = await users[1].generateAuthToken();

    describe('Contatos', () => {
        describe('GET /contatos', () => {
            it('should return all 2 contatos of user one', (done) => {
                const userId = users[0]._id.toHexString();

                request(app)
                    .get('/contatos')
                    .set('authorization', tokenUserOne)
                    .expect(200)
                    .expect((res) => {
                        const contatos = res.body.contatos;
                        expect(contatos.length).toBe(2);
                        expect(contatos[0]._creator).toBe(userId);
                        expect(contatos[1]._creator).toBe(userId);
                    })
                    .end(done);
            });

            it('should return only 1 contato of user two', (done) => {
                const userId = users[1]._id.toHexString();

                request(app)
                    .get('/contatos')
                    .set('authorization', tokenUserTwo)
                    .expect(200)
                    .expect((res) => {
                        const contatos = res.body.contatos;
                        expect(contatos.length).toBe(1);
                        expect(contatos[0]._creator).toBe(userId);
                    })
                    .end(done);
            });
        });

        describe('GET /contatos/:id', () => {
            it('should return a contato', (done) => {
                const contatoId = contatos[1]._id.toHexString();

                request(app)
                    .get(`/contatos/${contatoId}`)
                    .set('authorization', tokenUserTwo)
                    .expect(200)
                    .expect((res) => {
                        const dataNascimento = contatos[1].dataNascimento && moment(contatos[1].dataNascimento).format('L');
                        expect(res.body.contato.email).toBe(contatos[1].email);
                        expect(res.body.contato.telefone).toBe(contatos[1].telefone);
                        expect(res.body.contato.nome).toBe(contatos[1].nome);
                        expect(res.body.contato.dataNascimento).toBe(dataNascimento);
                    })
                    .end(done);
            });

            it('should not return a contato created by another user', (done) => {
                const contatoId = contatos[1]._id.toHexString();

                request(app)
                    .get(`/contatos/${contatoId}`)
                    .set('authorization', tokenUserOne)
                    .expect(404)
                    .end(done);
            });

            it('should return 404 if contato was not found', (done) => {
                const id = new mongoose.Types.ObjectId().toHexString();
                request(app)
                    .get(`/contatos/${id}`)
                    .set('authorization', tokenUserTwo)
                    .expect(404)
                    .expect((res) => {
                        expect(res.body).toEqual({});
                    })
                    .end(done);
            });

            it('should return 404 for non-object ids', (done) => {
                request(app)
                    .get('/contatos/123zxc')
                    .set('authorization', tokenUserTwo)
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
                    .set('authorization', tokenUserTwo)
                    .expect(201)
                    .end(done);
            });

            it('should return validation errors if request parameters are invalid', (done) => {
                const nome = '';
                const telefone = '+5 34 9974-12191';
                const email = 'ariel';

                request(app)
                    .post('/contatos')
                    .send({ email, telefone, nome })
                    .set('authorization', tokenUserTwo)
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
                    .set('authorization', tokenUserTwo)
                    .expect(400)
                    .expect((res) => {
                        expect(res.body.error.dataNascimento).toBeTruthy()
                    })
                    .end(done);
            });

            it('should not create contato if there is a contato with that email already', (done) => {
                request(app)
                    .post('/contatos')
                    .send({
                        email: contatos[0].email,
                        telefone: contatos[0].telefone
                    })
                    .set('authorization', tokenUserOne)
                    .expect(409)
                    .end(done);
            });
        });

        describe('PATCH /contatos/:id', () => {
            it('should update contato', (done) => {
                const id = contatos[1]._id.toHexString();
                const nome = 'Pedro Ribeiro';
                const telefone = '55 32 99745-1245';

                request(app)
                    .patch(`/contatos/${id}`)
                    .send({ nome, telefone })
                    .set('authorization', tokenUserTwo)
                    .expect(200)
                    .expect((res) => {
                        const contato = res.body.contato;
                        expect(contato.nome).toBe(nome);
                        expect(contato.telefone).toBe(telefone);
                    })
                    .end(done);
            });

            it('should not update a contato created by another user', (done) => {
                const id = contatos[1]._id.toHexString();
                const nome = 'Caique Souza';
                const telefone = '55 34 99745-2359';

                request(app)
                    .patch(`/contatos/${id}`)
                    .send({ nome, telefone })
                    .set('authorization', tokenUserOne)
                    .expect(404)
                    .end(done);
            });

            it('should not update contato if parameters are invalid', (done) => {
                const id = contatos[1]._id.toHexString();
                const nome = '';
                const telefone = '555 332 9-9745-1245';

                request(app)
                    .patch(`/contatos/${id}`)
                    .send({ nome, telefone })
                    .set('authorization', tokenUserTwo)
                    .expect(400)
                    .expect((res) => {
                        expect(res.body.error.telefone).toBeTruthy();
                        expect(res.body.error.nome).toBeTruthy();
                    })
                    .end(done);
            });
        });

        describe('DELETE /contatos/:id', () => {
            it('should remove the contato', (done) => {
                const id = contatos[1]._id.toHexString();
                const userId = users[1]._id;

                request(app)
                    .delete(`/contatos/${id}`)
                    .expect(200)
                    .set('authorization', tokenUserTwo)
                    .end(async (err, res) => {
                        if (err) return done(err);
                        try {
                            const contato = await Contato.findOne({ _id: id, _creator: userId });
                            expect(contato).toBeFalsy();
                            done();
                        } catch (error) {
                            done(error)
                        }
                    });
            });

            it('should not remove a contato created by another user', (done) => {
                const id = contatos[1]._id.toHexString();

                request(app)
                    .delete(`/contatos/${id}`)
                    .expect(404)
                    .set('authorization', tokenUserOne)
                    .end(done);
            });

            it('should return 404 if contato was not found', (done) => {
                const id = new mongoose.Types.ObjectId().toHexString();
                request(app)
                    .delete(`/contatos/${id}`)
                    .set('authorization', tokenUserOne)
                    .expect(404)
                    .end(done);
            });

            it('should return 404 if object id is invalid ', (done) => {
                request(app)
                    .delete(`/contatos/1[5sdz;.ç-`)
                    .set('authorization', tokenUserOne)
                    .expect(404)
                    .end(done);
            });
        });
    })
});
