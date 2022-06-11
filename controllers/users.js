const userRouter = require('express').Router();
const userService = require('../services/userService');
const User = require('../models/User');

userRouter.post('/', async (request, response) => {
    const body = request.body;

    //Formatting options
    if(!body.password || body.password.length < 4) {
        return response.status(400).send({
            error: 'Password should be at least 4 characters long.'
        });
    } else if (!body.username || body.username.length < 3) {
        return response.status(400).send({
            error: 'Username must be at least 3 characters long.'
        }); 
    }

    const savedUser = await userService.create(body);

    response.json(savedUser);
})

userRouter.get('/', async (request, response) => {
    const users = await User.find({});
    response.json(users);
})

module.exports = userRouter;