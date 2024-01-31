const { format } = require('date-fns')
const { v4:uuid } = require('uuid')
const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises

const logEvents = async(message,logName) => {
    const dateTime = `${format(new Date(),'dd:MM:yyyy\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname,'..','logs',logName), logItem);
    } catch (err) {
        console.log(err);
    }
};

const logger = (req,res,next) => {
    const message = `${req.method} request to ${req.url} from ${req.headers.origin}`;
    logEvents(message,'reqLog.txt')
    next()
};

module.exports = { logger, logEvents };