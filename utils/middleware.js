const jwt = require('jsonwebtoken');
const User = require('../models/User');

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      request.token =  authorization.substring(7)
    }
    next()
}

const userExtractor = async (request, response, next) => {
    if(!request.token) {
        return response.status(401).json({error: 'no token'});
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    request.user = user
    next()
  }

module.exports = {
    tokenExtractor,
    userExtractor,
}