const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const User = require('../models/User');


/**
 * Empty the databse before tests
 */
beforeEach( async () => {
    await User.deleteMany({});
})

describe('adding users: ', () => {

    test('a valid user can be created', async () => {
        const newUser = {
            username: 'test',
            password: 'sekret'
        }

        await api
            .post('/api/register')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);
    })
})



/**
 * User
 */
const userExample = {
    username: 'tester',
    password: '123456'
};

/**
 * Close connection at the end of test
 */
 afterAll(() => {
   mongoose.connection.close();
})