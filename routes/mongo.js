import mongoose from 'mongoose'
import 'dotenv/config'

const ALBUM_DB_NAME = 'album_db'

let connection = undefined

async function connect() {
    try {
        connection = await mongoose.connect(process.env.MONGODB_CONNECT_STRING)
        console.log("Successfully connected using Mongoose")
    } catch(err) {
        console.log(err)
        throw Error(`Couldn't connect to MongoDB ${err.message}`)
    }
}




