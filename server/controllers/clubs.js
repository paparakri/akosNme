const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");
const ServiceProviderUser = require("../models/serviceProviderUser.js");

const getClubUserByName = async (req, res) => {
    try{
        console.log("In getClubUserByName with req: " + req.params.user);
        const user = req.params.user.toLowerCase();
        const clubUser = await ClubUser.findOne({username: user});
        if(clubUser==null) throw new Error("User not found.");
        res.status(200).json(clubUser);
    } catch(err){
        console.log(err);
        require('./../config/404.js')(req, res);
    }
};

const getClubUser = async (req, res) => {
    try{
        const user = req.params.user;
        const clubUser = await ClubUser.findById(user);
        if(clubUser==null) throw new Error("User not found.");
        res.status(200).json(clubUser);
    } catch(err){
        console.log(err);
        require('./../config/404.js')(req, res);
    }
};

const createClubUser = async (req, res) => {
    try{
        const data = req.body;
        console.log(data);
        data.username = data.username.toLowerCase();

        const salt = await bcrypt.genSalt(10);
        const uniqueSalt = `${salt}${data.username}`;

        const hashedPassword = await bcrypt.hash(data.password, uniqueSalt);
        data.password = hashedPassword;

        const refreshToken = jwt.sign({
            username: data.username
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10d'});

        data.refreshToken = refreshToken;

        const clubUser = await ClubUser.create(data);

        const token = jwt.sign({username: clubUser.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 * 24 })

        res.status(201).json({token: token, user: clubUser, userType: 'club'});
    } catch(err){
        console.log(err);
        res.status(400).json( { error: err.message });
    }
};

const addRemoveInterest = async (req, res) => {
    try{
        const user = req.params.user;
        const { interestId } = req.body; // I'm also adding a type variable here. So I know if it's a club or S.P.
        const clubUser = await ClubUser.findById(user);
        const interestUser = await ServiceProviderUser.findById(interestId);

        if(clubUser.serviceProviderInterests.includes(interestId)){
            clubUser.serviceProviderInterests.pull(interestUser._id);
            interestUser.interestedClubs.pull(clubUser._id);
            await clubUser.save();
            await interestUser.save();
            res.status(200).json({message: "Removed interest."});
        } else {
            clubUser.serviceProviderInterests.push(interestUser._id);
            interestUser.interestedClubs.push(clubUser._id);
            await clubUser.save();
            await interestUser.save();
            res.status(200).json({message: "Added interest."});
        }

    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const getInterests = async (req, res) => {
    try{
        const user = req.params.user;
        const clubUser = await ClubUser.findById(user);
        if(clubUser==null) throw new Error("User not found.");
        const interests = await Promise.all(
            clubUser.serviceProviderInterests.map((id) => ServiceProviderUser.findById(id))
        );
        const formattedInterests = interests.map(
            ({_id, displayName, firstName, lastName, picturePath, type}) => { return {_id, displayName, firstName, lastName, picturePath, type};}
        );
        res.status(200).json(formattedInterests);
    } catch(err){
        console.log(err);
        require('./../config/404.js')(req, res);
    }
};

const getFollowers = async (req, res) => {
    try{
        const user = req.params.user;
        const clubUser = await ClubUser.findById(user);
        if(clubUser==null) throw new Error("User not found.");
        const followers = await Promise.all(
            clubUser.followers.map((id) => NormalUser.findById(id))
        );
        const formattedFollowers = followers.map(
            ({_id, username, displayName, picturePath, location}) => { return {_id, username, displayName, picturePath, location};}
        );
        res.status(200).json(formattedFollowers);
    } catch(err){
        console.log(err);
        require('./../config/404.js')(req, res);
    }
};

const updateClubUser = async (req, res) => {
    try{
        const clubUser = await ClubUser.findByIdAndUpdate(req.params.user, req.body, {new: true});
        if(clubUser==null) throw new Error("User not found.");

        res.status(200).json(clubUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const deleteClubUser = async (req, res) => {
    try{
        const clubUser = await ClubUser.findByIdAndDelete(req.params.user);
        if(clubUser==null) throw new Error("User not found.");

        res.status(200).json(clubUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const saveLayout = async (req, res) => {
    try {
        const userId = req.params.user; // Assuming the user ID is passed as a URL parameter
        console.log(userId);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const clubUser = await ClubUser.findById(userId);
        if (!clubUser) {
            return res.status(404).json({ error: "User not found" });
        }

        clubUser.tableLayout = req.body;
        await clubUser.save();
        res.status(200).json(clubUser);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
    }
};

module.exports = { saveLayout, getClubUser, getClubUserByName, createClubUser, getFollowers, addRemoveInterest, getInterests, updateClubUser, deleteClubUser };