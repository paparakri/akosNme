const cors = require('cors');

const whitelist = ['https://www.sitename.com', 'http://localhost:3500', 'http://localhost:3000'];//Final frontend || server || react dev
const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) != -1 || !origin){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccesStatus: 200
};

module.exports = cors(corsOptions);