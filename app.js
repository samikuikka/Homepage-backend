const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')

//Routers
const userRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URI)
    .then( () => {
        console.log("Connected to database.");
    })
    .catch( (e) => {
        console.error("Error connecting to database", e.message);
    })

app.use(cors())


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.json())
app.use(express.static('build'))
app.use(requestLogger)

//Routes
app.use('/api/register', userRouter);
app.use('/api/login', loginRouter);

module.exports = app;