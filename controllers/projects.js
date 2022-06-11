const projectRouter = require('express').Router();
const Project = require('../models/Project');
const middleware = require('../utils/middleware');

projectRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const projects = await Project.find({ user: user._id})
    response.status(200).json(projects);
})

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

projectRouter.put('/:id', middleware.userExtractor, async (request, response) => {
    const project = await Project.findById(request.params.id);
    const res = project.review();
    response.status(200).json(res);
})

module.exports = projectRouter;