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
        let users = await User.find({});

        expect(users).toHaveLength(0);

        await api
            .post('/api/register')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        
        users = await User.find({});
        expect(users).toHaveLength(1);
    });

    test('no password returns error', async () => {
        const invalidUser = {
            username: 'second'
        }

        const response = await api
            .post('/api/register')
            .send(invalidUser)
            .expect(400)
        
        expect(response.body.error).toBe('Password should be at least 4 characters long.');

    })
})
