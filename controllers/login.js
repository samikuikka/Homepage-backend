const loginRouter = require('express').Router();
const loginService = require('../services/loginService');


loginRouter.post('/', async (request, response) => {

    const token = await loginService.login(request.body);

  response
  .status(200)
  .send(token);
})

module.exports = loginRouter;