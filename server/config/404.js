const path = require('path');

const handle404 = (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
    } else if(req.accepts('json')) {
        res.json({error: "404 Page Not Found"});
    } else {
        res.type('txt').send("404 Page Not Found");
    }
}

module.exports = handle404;