const cors = require('cors');

const whitelist = ['https://www.sitename.com', 'http://localhost:3500', 'http://localhost:3000', 'http://127.0.0.1:3500', 'http://127.0.0.1:3000'];
const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);