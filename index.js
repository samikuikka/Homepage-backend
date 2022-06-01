const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())

const port = process.env.PORT

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.json())
app.use(requestLogger)

app.get('/', (req, res) => {
    res.send('GET request to the homepage')
})

app.listen(port,() => {
    console.log(`Listening to port ${port}`)
})
