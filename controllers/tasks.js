const tasksRouter = require('express').Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const middleware = require('../utils/middleware');

tasksRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const projects = await Project.find({ user: user._id}).select('tasks -_id').populate('tasks');
    const flatten = projects.map(project => project.tasks).flat();
    response.status(200).json(flatten);
});

tasksRouter.post('/:id', middleware.userExtractor, async (request, response) => {
    const body = request.body;
    const project = await Project.findById(request.params.id);
    const task = new Task({
        name: body.name,
        done: body.done,
        dueDate: body.dueDate,
        context: body.context,
        project: project._id,
        duration: body.duration
    });

    const savedTask = await task.save();
    project.tasks = project.tasks.concat(savedTask._id);
    await project.save();
    response.status(201).json(savedTask);
});

module.exports = tasksRouter;