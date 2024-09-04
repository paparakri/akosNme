const ServiceProviderUser = require("../models/serviceProviderUser.js");
const NormalUser = require("../models/normalUser.js");
const ClubUser = require("../models/clubUser.js");

const createServiceProviderUser = async (req, res) => {
    try{
        const data = req.body;
        data.username = data.username.toLowerCase();
        const serviceProviderUser = await ServiceProviderUser.create(data);
        res.status(201).json(serviceProviderUser);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const getServiceProviderUser = async (req, res) => {
    try{
        const user = req.params.user;
        const providerUser = await ServiceProviderUser.findById(user);
        if(providerUser==null) throw new Error("User not found.");
        res.status(200).json(providerUser);
    } catch(err){
        console.log(err);
        require('./../config/404.js')(req, res);
    }
};

module.exports = { createServiceProviderUser, getServiceProviderUser };