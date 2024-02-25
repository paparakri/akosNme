const mongoose = require('mongoose');

async function mongoInit() {
    const uri = process.env.MONGO_URL;

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
}

module.exports = mongoInit;