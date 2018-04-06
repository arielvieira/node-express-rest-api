const expect = require('expect');
const request = require('supertest');

const app = require('./../../app');
const User = require('./../models/user');
const Contato = require('./../models/contato');
const { users, populateUsers } = require('./seed/userSeed');

let tokenUserOne;
let tokenUserTwo;
beforeEach((done) => {
    const populatetokens = async () => {
        const tokens = await Promise.all([
            await users[0].generateAuthToken(),
            await users[1].generateAuthToken()
        ]);
        [tokenUserOne, tokenUserTwo] = [...tokens];
    }
    populatetokens();
    populateUsers(done);
});

describe('Usuarios', () => {
    describe('POST /usuarios', () => {
        it('should create a user', (done) => {
            const email = 'test@test.com';
            const password = '123zxc!';

            request(app)
                .post('/usuarios')
                .send({ email, password })
                .expect(201)
                .end(done);
        });

        it('should return validation errors if request parameters is invalid', (done) => {
            request(app)
                .post('/usuarios')
                .send({ email: 'ariel', password: '123' })
                .expect(400)
                .expect((res) => {
                    expect(res.body.error.password).toBeTruthy()
                    expect(res.body.error.email).toBeTruthy()
                })
                .end(done);
        });

        it('should not create user if email is already in use', (done) => {
            request(app)
                .post('/usuarios')
                .send({
                    email: users[0].email,
                    password: 'zxc123!'
                })
                .expect(409)
                .end(done);
        });
    });

    describe('POST /usuarios/login', () => {
        it('should login user and return auth token', (done) => {
            request(app)
                .post('/usuarios/login')
                .send({
                    email: users[1].email,
                    password: users[1].password
                })
                .expect(200)
                .expect((res) => expect(res.body.token).toBeTruthy())
                .end(done);
        });

        it('should reject invalid login', (done) => {
            request(app)
                .post('/usuarios/login')
                .send({
                    email: users[1].email,
                    password: "1111119"
                })
                .expect(401)
                .expect((res) => {
                    expect(res.body.token).toBeFalsy();
                    expect(res.body).toEqual({});
                })
                .end(done);
        });
    });

    describe('PATCH /usuarios/me', () => {
        it('should update user', (done) => {
            const newEmail = 'newemail@gmail.com';
            const password = 'asd456';

            request(app)
                .patch('/usuarios/me')
                .send({ email: newEmail, password })
                .set('authorization', tokenUserTwo)
                .expect(200)
                .expect((res) => {
                    const { id, email, token } = res.body;
                    expect(id.toString()).toBe(users[1]._id.toHexString());
                    expect(email).toBe(newEmail);
                    expect(token).toBeTruthy();
                    expect(token).not.toBe(tokenUserTwo);
                })
                .end(done);
        });

        it('should not update contato if password or email are invalid', (done) => {
            const email = 'new email';
            const password = 'pass';

            request(app)
                .patch('/usuarios/me')
                .send({ email, password })
                .set('authorization', tokenUserTwo)
                .expect(400)
                .end(done);
        });
    });


    describe('DELETE /usuarios/me', () => {
        it('should remove user and its contatos', (done) => {
            request(app)
                .delete('/usuarios/me')
                .set('authorization', tokenUserOne)
                .expect(200)
                .end(async (err, res) => {
                    if (err) return done(err);

                    const contatos = await Contato.find({ _creator: users[0]._id });
                    expect(contatos.length).toBe(0);
                    done();
                });
        });
    });
});
