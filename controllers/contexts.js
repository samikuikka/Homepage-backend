const contextRouter = require('express').Router();
const Context = require('../models/Context');
const middleware = require('../utils/middleware');

//Get all contexts of user
contextRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const contexts = await Context.find({ user: user._id});
    response.status(200).json(contexts);
});

//New context
contextRouter.post('/', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const body = request.body;

    const context = new Context({
        name: body.name,
        user: user._id
    });
    const savedContext = await context.save();
    response.status(201).json(savedContext);
});

contextRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const project = await Context.findById(request.params.id);

    if(project.user.toString() === user._id.toString()) {
        await Context.findByIdAndRemove(request.params.id);
        return response.status(204).end();
    } else {
        return response.status(400).json({ error: 'wrong user token'});
    }
})


module.exports = contextRouter;