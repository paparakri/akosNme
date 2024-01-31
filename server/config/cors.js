const cors = require('cors');

const whitelist = ['https://www.sitename.com', 'http://localhost:3500', 'http://127.0.0.1:5500'];//Final frontend || server || react dev
const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) != -1 || !origin){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccesStatus: 200
};

module.exports = cors(corsOptions);