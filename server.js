const mongoose = require('mongoose')
const dotenv = require('dotenv')


dotenv.config({path: '../monter/config.env'})
// console.log(process.env.NODE_ENV)



const app = require('./app')

const port = process.env.PORT || 8000

const server = app.listen(port,()=>{
    console.log(`App is Running on port ${port}`)
})
