const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');

const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Delete projects and user at start
 */
beforeAll( async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
});

describe('project', () => {
    let token = null;
    
    beforeEach( async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({ username: 'test', passwordHash});
        await user.save();
        const result = await api
            .post('/api/login')
            .send({ username: 'test', password: 'sekret'});
        token = result.body.token;
    })

    it('let user show projects with valid token', async () => {
        
        await api
            .get('/api/projects')
            .set('Authorization', `bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
    })

    it('normal project can be added', async () => {

        const response = await api
            .post('/api/projects')
            .set('Authorization', `bearer ${token}`)
            .send(project1)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(response.body.name).toBe('Test project');
        expect(response.body.tasks).toHaveLength(0);
    })

    it('daily project can be added', async () => {
        
        const response = await api
            .post('/api/projects')
            .set('Authorization', `bearer ${token}`)
            .send(dailyProject)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(response.body.name).toBe('Daily task');
        expect(response.body.reviewFreq).toBe(1);
    })

    describe('with multiple projects', () => {
        let token2 = null;
        beforeEach( async () => {
            await Project.deleteMany({})
            const passwordHash = await bcrypt.hash('secret',10)
            const testUser = new User({username: 'root', passwordHash});
            await testUser.save();

            const result = await api
                .post('/api/login')
                .send({username: 'root', password: 'secret'})
            token2= result.body.token;

            const blogObjects = initialProjects.map(project => new Project({...project, user: testUser._id}));
            const promiseArray = blogObjects.map(blog => blog.save());
            await Promise.all(promiseArray);
        })

        it('should show initial projects', async () => {
            const response = await api
                .get('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            
            expect(response.body).toHaveLength(3);
            expect(response.body.map(object => object.name)).toContain('Third');
        },)

        it('adding project with initial projects should work', async () => {
            await api
                .post('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .send(project1)
                .expect(201)
                .expect('Content-Type', /application\/json/)


            const response2 = await api
                .get('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            expect(response2.body).toHaveLength(4)
            expect(response2.body.map(object => object.name)).toContain('Test project');
        })

        it('a project can reviewed', async () => {
            const response = await api
                .post('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .send(project1)
            
            const projectID = response.body._id;
            expect(projectID).not.toBeNull();
            const oldDate = new Date(response.body.lastReview).getTime();
            expect(oldDate).toBeDefined();

            const response2 = await api
                .put(`/api/projects/${projectID}`)
                .set('Authorization', `bearer ${token2}`)
                .expect(200);
            
            const newDate = new Date(response2.body.lastReview).getTime()
            expect(newDate).toBeGreaterThan(oldDate);
        })

        it('a name and reviewFreq can be updated', async () => {
            const response = await api
                .post('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .send(project1)
            
            const update = {
                name: 'new project name',
                reviewFreq: 10
            }

            const projectID = response.body._id;
            const oldDate = new Date(response.body.lastReview).getTime();
            expect(oldDate).toBeDefined();

            const response2 = await api
                .put(`/api/projects/${projectID}`)
                .set('Authorization', `bearer ${token2}`)
                .send(update)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            
            const newDate = new Date(response2.body.lastReview).getTime()
            expect(newDate).toBeGreaterThan(oldDate);
            expect(response2.body.name).toBe('new project name');
            expect(response2.body.reviewFreq).toBe(10);

        })

        it('only name and reviewFreq can be updated', async () => {
            const response = await api
                .post('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .send(project1)
            
            const update = {
                reviewFreq: 10,
                createdAt: Date.now()
            }

            const projectID = response.body._id;
            const oldDate = new Date(response.body.lastReview).getTime();
            expect(oldDate).toBeDefined();

            const response2 = await api
                .put(`/api/projects/${projectID}`)
                .set('Authorization', `bearer ${token2}`)
                .send(update)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            
            const newDate = new Date(response2.body.lastReview).getTime()
            expect(newDate).toBeGreaterThan(oldDate);
            expect(response2.body.name).toBe('Test project');
            expect(response2.body.reviewFreq).toBe(10);
            expect(response2.body.createdAt).toBe(response.body.createdAt);
        })

        it('single project can be viewed', async () => {
            const res = await api
                .get('/api/projects')
                .set('Authorization', `bearer ${token2}`)
                .expect(200)
            
            const project = res.body[0]
            const projectID = project._id;
            expect(projectID).not.toBeNull();
            
            const response = await api
                .get(`/api/projects/${projectID}`)
                .set('Authorization', `bearer ${token}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            expect(response.body).toEqual(project);
        })

        

    })
})

const initialProjects = [
    {
        name: 'Project 1'
    },
    {
        name: 'Second daily project',
        reviewFreq: 1
    },
    {
        name: 'Third'
    }
]


const project1 = {
    name: 'Test project'
}

const dailyProject = {
    name: 'Daily task',
    reviewFreq: 1
}