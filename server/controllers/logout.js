const NormalUser = require('./../models/normalUser');
const path = require('path');

const handleLogout = async (req, res) => {
    try{
        const cookies = req.cookies;
        if(!cookies?.jwt) return res.sendStatus(204);
        
        const refreshToken = cookies.jwt;
        const user = await NormalUser.findOne({ refreshToken: refreshToken });
        if(!user) {
            res.clearCookie("jwt", refreshToken, { httpOnly: true, sameSite: None, secure: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.sendStatus(403);
        }

        //Delete refresh token from the DB
        const deletedToken = await NormalUser.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: null });
        res.clearCookie("jwt", refreshToken, { httpOnly: true, sameSite: None, secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.sendStatus(204);
    } catch (err){
        res.status(500).json({ error: err.message });
    }
};

module.exports = handleLogout;