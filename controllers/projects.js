const projectRouter = require('express').Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const middleware = require('../utils/middleware');


//Get projects of user
projectRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const projects = await Project.find({ user: user._id})
    response.status(200).json(projects);
})

projectRouter.get('/:id', middleware.userExtractor, async (request, response) => {
    const project = await Project.findById(request.params.id).populate('tasks');
    response.status(200).json(project);
})


//New project
projectRouter.post('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const body = request.body;

    const project = new Project({
        name: body.name,
        reviewFreq: body.reviewFreq,
        tasks: [],
        user: user._id
    });
    
    const savedProject = await project.save();
    response.status(201).json(savedProject);
})

//New task
projectRouter.post('/:id/tasks', middleware.userExtractor, async (request, response) => {
    const body = request.body;
    const project = await Project.findById(request.params.id);
    const task = new Task({
        name: body.name,
        done: body.done,
        dueDate: body.dueDate,
        context: body.context,
        project: project._id,
        duration: body.duration
    })

    const savedTask = await task.save();
    project.tasks = project.tasks.concat(savedTask._id);
    await project.save();
    response.status(201).json(savedTask);
})

//Delete task
projectRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const project = await Project.findById(request.params.id);
    if(project.user.toString() === user._id.toString()) {
        await Project.findByIdAndRemove(request.params.id);
        return response.status(204).end();
    } else {
        return response.status(400).json({ error: 'wrong user token'});
    }
})

// Review project
projectRouter.put('/:id', middleware.userExtractor, async (request, response) => {
    const body = request.body;
    const update = {
        name: body.name,
        reviewFreq: body.reviewFreq
    }

    const project = await Project.findByIdAndUpdate(request.params.id, update, { new: true});
    const res = project.review();

    response.status(200).json(res);
})

module.exports = projectRouter;