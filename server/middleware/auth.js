//AUTHORIZATION (GIVING CERTAIN SERVICES)
require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const auth = req.headers["authorization"];
    if(!auth) return res.sendStatus(401);

    const token = auth.split(" ")[1];
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403);
        req.user = decoded.username;
        next();
    });
}

module.exports = verifyToken;