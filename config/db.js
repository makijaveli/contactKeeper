const mongoose = require('mongoose')
const config = require('config');
const db = config.get('mongoURINew');


const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 1000
        })
        console.log('MongoDB connected...')
    } catch (err) {
        console.error(err.message)
        process.exit(1);
    }
}

module.exports = connectDB;