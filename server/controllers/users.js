const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");
const ServiceProviderUser = require("../models/serviceProviderUser.js");
const helper = require('./../helpers/userObject.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET */
const getNormalUser = async (req, res) => {
    try{
        const { id } = req.params;
        const normalUser = await NormalUser.findOne({username: id});
        if(normalUser==null) throw new Error("User not found.");

        res.status(200).json(normalUser);
    } catch(err){
        console.log(err);
        require('./../config/404.js')(req, res);
    }
};

const getNormalUserClubInterests = async (req, res) => {
    try{
        const user = req.params.id;
        const normalUser = await NormalUser.findOne({username: user})

        const clubInterests = await Promise.all(
            normalUser.clubInterests.map((id) => ClubUser.findById(id))
        );
        const formattedClubInterests = clubInterests.map(
            ({_id, displayName, picturePath, location}) => { return {_id, displayName, picturePath, location};}
        );
        res.status(200).json(formattedClubInterests);
    }catch(err){
        res.status(404).json( { error: err.message });
    }
};

const getNormalUserServiceProviderInterests = async (req, res) => {
    try{
        const user = req.params.id;
        const normalUser = await NormalUser.findOne({username: user})

        const serviceProviderInterests = await Promise.all(
            normalUser.serviceProviderInterests.map((id) => ServiceProviderUser.findById(id))
        );
        const formattedServiceProviderInterests = serviceProviderInterests.map(
            ({_id, displayName, firstName, lastName, picturePath, type}) => { return {_id, displayName, firstName, lastName, picturePath, type};}
        );
        res.status(200).json(formattedServiceProviderInterests);
    }catch(err){
        res.status(404).json( { error: err.message });
    }
};

/* UPDATE */
const addRemoveInterest = async (req, res) => {
    try{
        const id = req.params.id;
        const { interestId, type } = req.body;    // I'm also adding a type variable here. So I know if it's a club or S.P.
        const normalUser = await NormalUser.findOne({ username: id });
        if(type=="Club"){
            const interestUser = await ClubUser.findById(interestId);

            if(normalUser.clubInterests.includes(interestId)){
                normalUser.clubInterests = normalUser.clubInterests.filter((id) => id !== interestId);
                interestUser.followers = interestUser.followers.filter((id) => id !== id);
            } else {
                normalUser.clubInterests.push(interestUser._id);
                console.log("pushed interest");
                interestUser.followers.push(normalUser._id);
            }
            
            await normalUser.save();
            await interestUser.save();

            console.log("clubInterests of user ", normalUser.clubInterests);

            const clubInterests = await Promise.all(
                normalUser.clubInterests.map((id) => ClubUser.findById(id))
            );

            

            const formattedClubInterests = clubInterests.map(
                ({_id, displayName, picturePath, location}) => { return {_id, displayName, picturePath, location};}
            );
            res.status(200).json(formattedClubInterests);
        } else if(type=="ServiceProvider"){
            const interestUser = await ServiceProviderUser.findById(interestId);

            if(normalUser.serviceProviderInterests.includes(interestId)){
                normalUser.serviceProviderInterests = normalUser.serviceProviderInterests.filter((id) => id !== interestId);
                interestUser.followers = interestUser.followers.filter((id) => id !== id);
            } else {
                normalUser.serviceProviderInterests.push(interestUser._id);
                console.log("pushed interest");
                interestUser.followers.push(normalUser._id);
            }

            await normalUser.save();
            await interestUser.save();

            const serviceProviderInterests = await Promise.all(
                normalUser.serviceProviderInterests.map((id) => ServiceProviderUser.findById(id))
            );
            const formattedServiceProviderInterests = serviceProviderInterests.map(
                ({_id, displayName, firstName, lastName, picturePath, type}) => { return {_id, displayName, firstName, lastName, picturePath, type};}
            );
            res.status(200).json(formattedServiceProviderInterests);
        } else {
            res.status(500).json( {msg: "Invalid interest type."} );
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
};

/* ERROR HANDLING FOR USER CREATION (WILL REMOVE WHEN I CREATE THE AUTH ROUTES) */
const userCreationErrorHandling = (err) => {
    let errors = { username: '', firstName: '', lastName: '', email: '', password: '' };

    // duplicate error code
    if (err.code === 11000) {
        errors.username = 'That username is already registered';
        errors.email = 'That email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('NormalUser validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

/* CREATE */
const createNormalUser = async (req, res) => {
    try {
        // Retrieve the user data from the request body
        const userData = req.body;

        const salt = await bcrypt.genSalt(10);
        const uniqueSalt = `${salt}${req.body.username}`;

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, uniqueSalt);
        userData.password = hashedPassword;

        // Create a new normal user in the database
        const newUser = await NormalUser.create(userData);

        //const token = jwt.sign({ username: newUser.username }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 });

        // Return the newly created user as a JSON response
        res.status(201).json({token: token, user: newUser});
    } catch (error) {
        console.log(error);
        const errors = userCreationErrorHandling(error);
        const errorValues = Object.values(errors);
        const filteredErrors = errorValues.filter((error) => error !== "");
        // Handle any errors that occur during the creation process
        res.status(500).json({ filteredErrors });
    }
};

/* UPDATE */
const updateNormalUser = async (req,res) => {
    try{
        let data = req.body;
        const salt = await bcrypt.genSalt(10);
        const uniqueSalt = `${salt}${req.body.username}`;
        data.password = await bcrypt.hash(req.body.password, uniqueSalt);
        const normalUser = await NormalUser.findOneAndUpdate({username: req.params.id}, data, {new: true});
        if(normalUser==null) throw new Error("User not found.");

        res.status(200).json(normalUser);
    } catch(err){
        console.log(err);
        res.status(400).json( { error: err.message });
    }
};

/* DELETE */
const deleteNormalUser = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming you have the user ID in the request parameters
        const deletedUser = await NormalUser.findOneAndDelete({username: userId, email: req.body.email});

        if (!deletedUser) throw new Error("User not found.");

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getNormalUser, createNormalUser, getNormalUserClubInterests, getNormalUserServiceProviderInterests, addRemoveInterest, updateNormalUser, deleteNormalUser };