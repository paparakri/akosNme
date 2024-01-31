const mongoose = require('mongoose');

async function mongoInit() {
    const uri = 'mongodb+srv://papakri:Paparakri13!@cluster0.uw0zdqq.mongodb.net/PlinkoDB?retryWrites=true&w=majority';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
}

module.exports = mongoInit;