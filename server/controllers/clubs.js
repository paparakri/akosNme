const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");
const ServiceProviderUser = require("../models/serviceProviderUser.js");

const getClubUser = async (req, res) => {
    try{
        const user = req.params.user.toLowerCase();
        const clubUser = await ClubUser.findOne({username: user});
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
        data.username = data.username.toLowerCase();
        const clubUser = await ClubUser.create(data);
        res.status(201).json(clubUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const addRemoveInterest = async (req, res) => {
    try{
        const user = req.params.user.toLowerCase();
        const { interestId } = req.body; // I'm also adding a type variable here. So I know if it's a club or S.P.
        const clubUser = await ClubUser.findOne({ username: user });
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
        const user = req.params.user.toLowerCase();
        const clubUser = await ClubUser.findOne({username: user});
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
        const user = req.params.user.toLowerCase();
        const clubUser = await ClubUser.findOne({username: user});
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
        const clubUser = await ClubUser.findOneAndUpdate({username: req.params.user}, req.body, {new: true});
        if(clubUser==null) throw new Error("User not found.");

        res.status(200).json(clubUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const deleteClubUser = async (req, res) => {
    try{
        const clubUser = await ClubUser.findOneAndDelete({username: req.params.user, email: req.body.email});
        if(clubUser==null) throw new Error("User not found.");

        res.status(200).json(clubUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

module.exports = { getClubUser, createClubUser, getFollowers, addRemoveInterest, getInterests, updateClubUser, deleteClubUser };