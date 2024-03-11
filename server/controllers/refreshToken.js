require('dotenv').config();
const jwt = require('jsonwebtoken');
const NormalUser = require('./../models/normalUser');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.status(401).json({ msg: "No token provided." });

    const refreshToken = cookies.jwt;

    const user = await NormalUser.findOne({ refreshToken: refreshToken });
    if(!user) return res.status(403).json({ msg: "Invalid token." });
    
    //evaluate the refresh token
    jwt.verify(cookies.jwt, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if(err || user.username !== decoded.username) return res.status(403).json({ msg: "Invalid token." });
        const accessToken = jwt.sign({"username": decoded.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
        res.json({ accessToken });
    });
};

module.exports = handleRefreshToken;