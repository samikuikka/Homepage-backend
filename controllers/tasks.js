const tasksRouter = require('express').Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const middleware = require('../utils/middleware');

tasksRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const projects = await Project.find({ user: user._id}).select('_id')
    const tasks = await Task.find({project: { $in: projects}}).populate({
        path: 'project',
        select: 'name -_id'
    });
    
    response.status(200).json(tasks);
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

tasksRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const task = await Task.findById(request.params.id);
    const project = await Project.findById(task.project);

    if(project.user.toString() === user._id.toString() ) {
        project.tasks = project.tasks.filter(id => id !== task._id);
        project.save();
        await Task.findByIdAndRemove(request.params.id);
        return response.status(204).end();
    } else {
        return response.status(400).json({ error: 'wrong user token'});
    }
});

tasksRouter.put('/:id', middleware.userExtractor, async (request, response) => {
    const body = request.body;

    const update = {
        name: body.name,
        done: body.done,
        hiPriority: body.hiPriority,
        duration: body.duration
    };

    const task = await Task.findByIdAndUpdate(request.params.id, update, { new: true });

    response.status(200).json(task);
})

module.exports = tasksRouter;