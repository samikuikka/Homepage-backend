const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');

const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

let token = null;
let projects = null;

/**
 * Reset database
 */
beforeEach( async () => {
    await Project.deleteMany({});
    await User.deleteMany({});
    await Task.deleteMany({});

     //Add user
     const passwordHash = await bcrypt.hash('sekret', 10);
     const user = new User({username: 'root', passwordHash});
     await user.save();
     const result = await api
         .post('/api/login')
         .send({username: 'root', password: 'sekret'});
     token = result.body.token;

     //Add project
     const projectObjects = initialProjects.map(project => new Project({...project, user: user._id}));
     const promiseArray = projectObjects.map(project => project.save());
     await Promise.all(promiseArray);

     //Get projects
     let response = await api
        .get('/api/projects')
        .set('Authorization', `bearer ${token}`);
    projects = response.body;
})

describe('task', () => {


    /**
     * Initialize tasks
     */
    beforeEach( async () => {
        await Task.deleteMany({});
    })

    it.only('a task can be added', async () => {

        const projectID = projects[0]._id;

        const task = {
            name: 'Test task',
            project: projectID,
            dueDate: Date.now(),
            duration: 60
        }

        /**
         * Response ok
         */
        const response = await api
            .post(`/api/projects/${projectID}/tasks`)
            .set('Authorization', `bearer ${token}`)
            .send(task)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body.name).toBe('Test task')
        expect(response.body.project).toBe(projectID)

        /**
         * Project updated
         */
        
        
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