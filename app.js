const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware');

//Routers
const userRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const projectRouter = require('./controllers/projects');

const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URI)
    .then( () => {
        console.log("Connected to database.");
    })
    .catch( (e) => {
        console.error("Error connecting to database", e.message);
    })

app.use(cors())

app.use(express.json());
app.use(express.static('build'));
app.use(middleware.tokenExtractor);

//Routes
app.use('/api/register', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/projects', projectRouter);

module.exports = app;