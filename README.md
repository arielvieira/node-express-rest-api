# Contatos

Api de contatos com autenticação de usuários.

Você pode acessar ela no endereço https://contatos-oficina5.herokuapp.com/

## Rotas
### Livres:   
- POST /usuarios  
- POST /usuarios/login  
### Protegidas:   
- PATCH /usuarios/me    
- DELETE /usuarios/me
- GET /contatos/?limit=10&page=1   
- GET /contatos/:id  
- POST /contatos  
- PATCH /contatos/:id  
- DELETE /usuarios/:id

Para as rotas protegidas você precisa logar com a rota POST /usuarios/login com um usário e passar o token(jwt) no header das requisições.  
(se você não tiver você precisa criar um primeiro com a roda POST /usarios)

## Como rodar o projeto localmente

Você vai precisar ter o node instalado [Node.js](http://nodejs.org/).

```sh
git clone https://github.com/arielvieira/teste-backend-oficina5.git
cd teste-backend-oficina5
npm install
npm start
```

Depois disso você vai precisar criar 2 arquivos de configuração na pasta config:

### config/dev.js
```js
module.exports = {
    PORT: 3000, // Ou qualquer outra porta que não esteja em uso
    MONGODB_URI: 'MONGODB_URI', // uri para a coneção do banco
    JWT_SECRET: 'JWT_SECRET' // senha para geração dos token
};
```
O arquivo dev.js será usado quando executado o comando.
```
npm start
```
### config/test.js
```js
module.exports = {
    PORT: 3000, // Ou qualquer outra porta que não esteja em uso
    MONGODB_URI: 'MONGODB_URI', // uri para a coneção do banco
    JWT_SECRET: 'JWT_SECRET' // senha para geração dos token
};
```
O arquivo test.js será usado para definir o ambiente de testes para o comando.
```
npm test
```

A api agora deve estar rodando no endereço [localhost:3000](http://localhost:3000/).


## Tecnologias usadas

* [Node](https://nodejs.org/en/) - Para rodar javascrit no servidor.
* [Express](https://www.express.com/) - Framework para construção de web services.
* [MongoDB](https://www.mongodb.com/) - Como banco de dados.
* [Mongoose](http://mongoosejs.com/) - ODM para MongoDB.
* [Mocha](https://mochajs.org/) - Para os testes.
* [Swagger](https://swagger.io/) - Para a documentação das rotas da api.

