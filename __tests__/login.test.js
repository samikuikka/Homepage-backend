const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt')

const User = require('../models/User');

/**
 * Create account for login before test
 */
beforeEach( async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('sekret', 10);
    const newUser = new User({username: 'test', passwordHash});
    await newUser.save();
})

describe('user', () => {

    test('can not login with wrong password', async () => {
        const response = await api
            .post('/api/login')
            .send({username: 'test', password: 'wrong'})
            .expect(401)
            .expect('Content-Type', /application\/json/);
            
        expect(response.body.error).toBe('invalid username or password');
    })

    test(' is able to login with own credentials', async () => {
       const response =  await api
            .post('/api/login')
            .send({username: 'test', password: 'sekret'})
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.username).toBe('test');
    })
})