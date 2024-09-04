const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const NormalUser = require('../models/normalUser.js');

/* REGISTERING NORMAL USER*/
const register = async (req, res) => {
    try {
        // Retrieve the user data from the request body
        const userData = req.body;

        // Create unique salt for the user
        const salt = await bcrypt.genSalt(10);
        const uniqueSalt = `${salt}${req.body.username}`;

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, uniqueSalt);
        userData.password = hashedPassword;

        const refreshToken = jwt.sign({
            username: userData.username
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10d'});

        userData.refreshToken = refreshToken;

        // Create a new normal user in the database
        const newUser = await NormalUser.create(userData);

        const token = jwt.sign({ username: newUser.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 * 24 });

        // Return the newly created user as a JSON response
        res.status(201).json({token: token, user: newUser, userType: 'normal'});
    } catch (error) {
        console.log(error);
        // Handle any errors that occur during the creation process
        res.status(500).json({ error: error.message });
    }
}

/* LOGGING IN FOR NORMAL USER*/ /* THIS IS NOT SECURE. DIFFERENT AUTHENTICATION NEEDED. POSSIBLY FROM THIRD-PARTY. */
const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        const normalUser = await NormalUser.findOne({ email: email });
        if(!normalUser) return res.status(400).json ({ msg: "No user associated with that e-mail." });
        const isMatch = await bcrypt.compare(password, normalUser.password);
        if(!isMatch) return res.status(400).json({ msg: "Wrong password." });
        //Create JWTs
        const accessToken = jwt.sign({username: normalUser.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
        const refreshToken = jwt.sign({username: normalUser.username}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
        //Add the refresh token to the user
        normalUser.refreshToken = refreshToken;
        await normalUser.save();
        res.status(200).json({ "token": accessToken, "user": normalUser, 'userType': 'normal' });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

module.exports = { register, login };