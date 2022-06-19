const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');

const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Delete Users and projects
 */

beforeAll( async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
});

describe('project', () => {
    let token1 = null;
    let token2 = null;

    beforeEach(async () => {
        await User.deleteMany({});

        //Save 1 user and get token
        const passwordHash1 = await bcrypt.hash('sekret', 10);
        const user1 = new User({username: 'tester1', passwordHash: passwordHash1});
        await user1.save();
        const result1 = await api
            .post('/api/login')
            .send({username: 'tester1', password: 'sekret'});
        token1 = result1.body.token

        //Second user
        const passwordHash2 = await bcrypt.hash('secret', 10);
        const user2 = new User({username: 'tester2', passwordHash: passwordHash2});
        await user2.save();
        const result2 = await api
            .post('/api/login')
            .send({username: 'tester2', password: 'secret'});
        token2 = result2.body.token;

        await Project.deleteMany({});
    })

    it('user can delete own project', async () => {
        const response = await api
            .post('/api/projects')
            .set('Authorization', `bearer ${token1}`)
            .send(exampleProject)
            .expect(201)

        const projectID = response.body._id;
        expect(projectID).not.toBeNull();

        await api
            .delete(`/api/projects/${projectID}`)
            .set('Authorization', `bearer ${token1}`)
            .expect(204)
        
        const response2 = await api
            .get('/api/projects')
            .set('Authorization', `bearer ${token1}`)

        expect(response2.body).not.toContain(projectID)
    })

    it('user can not delete other users projects', async () => {
        const response = await api
            .post('/api/projects')
            .set('Authorization', `bearer ${token1}`)
            .send(exampleProject)
            .expect(201)

        const projectID = response.body._id;
        expect(projectID).not.toBeNull();

        const response2 = await api
            .delete(`/api/projects/${projectID}`)
            .set('Authorization', `bearer ${token2}`)
            .expect(400)
        
        expect(response2.body).toEqual({error: 'wrong user token'});
    })
})

const exampleProject = {
    name: 'Test project'
};