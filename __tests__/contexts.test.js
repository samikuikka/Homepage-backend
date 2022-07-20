const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');

const Context = require('../models/Context');
const User = require('../models/User');

beforeAll( async () => {
    await User.deleteMany({});
    await Context.deleteMany({});
});

describe('context', () => {
    let token = null;

    //Log in
    beforeEach( async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({ username: 'test', passwordHash});
        await user.save();
        const result = await api
            .post('/api/login')
            .send({ username: 'test', password: 'sekret'});
        token = result.body.token;
    });

    it('context can be posted', async () => {
        const response = await api
            .post('/api/contexts')
            .set('Authorization', `bearer ${token}`)
            .send(context1)
            .expect(201);
        
        expect(response.body.name).toBe('at home');
    })

    it('contexts can be viewed', async () => {
        await api
        .post('/api/contexts')
        .set('Authorization', `bearer ${token}`)
        .send(context1)
        .expect(201);

        await api
        .post('/api/contexts')
        .set('Authorization', `bearer ${token}`)
        .send({name: 'second'})
        .expect(201);

        const response = await api
            .get('/api/contexts')
            .set('Authorization', `bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.map(context => context.name)).toEqual(expect.arrayContaining(['at home', 'second'])); 
    })

    describe('DELETE', () => {
        let contextID = null;

        beforeEach( async () => {
            const response = await api
                .post('/api/contexts')
                .set('Authorization', `bearer ${token}`)
                .send(context1);
            contextID = response.body.id;
        })

        it('can delete context', async () => {
            await api
                .delete(`/api/contexts/${contextID}`)
                .set('Authorization', `bearer ${token}`)
                .expect(204)
            
            const response = await api
                .get('/api/contexts')
                .set('Authorization', `bearer ${token}`)
            
            expect(response.body).toEqual([]);
        })


    })
})


const context1 = {
    name: 'at home'
}