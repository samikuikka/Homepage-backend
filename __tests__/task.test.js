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


describe('task', () => {


    /**
     * Reset database
    */
    beforeEach(async () => {
        await Project.deleteMany({});
        await User.deleteMany({});
        await Task.deleteMany({});

        //Add user
        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({ username: 'root', passwordHash });
        await user.save();
        const result = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' });
        token = result.body.token;

        //Add project
        const projectObjects = initialProjects.map(project => new Project({ ...project, user: user._id }));
        const promiseArray = projectObjects.map(project => project.save());
        await Promise.all(promiseArray);

        //Get projects
        let response = await api
            .get('/api/projects')
            .set('Authorization', `bearer ${token}`);
        projects = response.body;
    })
    describe('get', () => {
        it('without tasks shows empty list', async () => {
            const response = await api
                .get('/api/tasks')
                .set('Authorization', `bearer ${token}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            
            expect(response.body).toEqual([]);
        })
    })

    describe('post', () => {
        it('can be posted', async () => {
            const projectID = projects[0]._id;
            const task = exampleTask;
            task.project = projectID;
    
            const response = await api
                .post(`/api/tasks/${projectID}`)
                .set('Authorization', `bearer ${token}`)
                .send(task)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
            const taskID = response.body.id;
            expect(response.body.name).toBe('Example task');
            expect(response.body.hiPriority).toBe(false);
    
            const res2 = await api
                .get('/api/tasks')
                .set('Authorization', `bearer ${token}`)
                .expect(200)
    
            expect(res2.body.map(task => task.id)).toContain(taskID);
        })
    
        it('multiple tasks can be posted', async () => {
            const projectID= projects[0]._id;
            let task1 = exampleTask;
            task1.project = projectID;
    
            let task2 = {
                name: 'second task',
                dueDate: Date.now(),
                duration: 30,
                project: projectID
            }
    
            await api
                .post(`/api/tasks/${projectID}`)
                .set('Authorization', `bearer ${token}`)
                .send(task1)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
            await api
                .post(`/api/tasks/${projectID}`)
                .set('Authorization', `bearer ${token}`)
                .send(task2)
                .expect(201)
                .expect('Content-Type', /application\/json/)
    
            const res = await api
                .get('/api/tasks')
                .set('Authorization', `bearer ${token}`)
                .expect(200)
            
            const res2 = await api
                .get(`/api/projects/${projectID}`)
                .set('Authorization', `bearer ${token}`)
                .expect(200)
            
            
            expect(res.body).toHaveLength(2);
            expect(res.body.map(task => task.name)).toContain('second task')
            expect(res.body.map(task => task.name)).toContain('Example task')
            expect(res2.body.tasks).toHaveLength(2);
    
        })
    })


    describe('delete', () => {
        it('can delete task', async () => {
            const projectID = projects[0]._id;
            const task = exampleTask;
            task.project = projectID;
    
            const res = await api
                .post(`/api/tasks/${projectID}`)
                .set('Authorization', `bearer ${token}`)
                .send(task)
                .expect(201)
            
            const taskID = res.body.id;
    
            const res2 = await api
                .get('/api/tasks')
                .set('Authorization', `bearer ${token}`);
    
            expect(res2.body.map(task => task.id)).toContain(taskID);
    
            await api
                .delete(`/api/tasks/${taskID}`)
                .set('Authorization', `bearer ${token}`)
                .expect(204)
            
            const res3 = await api
                .get('/api/tasks')
                .set('Authorization', `bearer ${token}`);
            
            expect(res3.body.map(task => task.id)).not.toContain(taskID);
        });

        describe('put', () => {

            it('can update task', async () => {
                const projectID = projects[0]._id;
                const task = exampleTask;
                task.project = projectID;
        
                const res = await api
                    .post(`/api/tasks/${projectID}`)
                    .set('Authorization', `bearer ${token}`)
                    .send(task)
                    .expect(201)
                
                const taskID = res.body.id;
                
                const updated = {
                    name: 'updated task',
                    duration: 5,
                    hiPriority: true,
                    done: true
                }

                await api
                    .put(`/api/tasks/${taskID}`)
                    .set('Authorization', `bearer ${token}`)
                    .send(updated)
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
                
                const res2 = await api
                    .get('/api/tasks')
                    .set('Authorization', `bearer ${token}`)
                
                expect(res2.body.map(task => task.name)).toContain('updated task')
                
            })
        })
    })



})

const exampleTask = {
    name: 'Example task',
    dueDate: Date.now(),
    duration: 55
}


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