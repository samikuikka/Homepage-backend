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
        console.error("Error connecting to database");
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
app.use(requestLogger)

//Routes
app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);

app.listen(config.PORT,() => {
    console.log(`Listening to port ${config.PORT}`)
})
