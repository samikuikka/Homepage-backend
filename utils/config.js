require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI = process.env.MONGO_DB

module.exports = {
    PORT,
    MONGODB_URI
}