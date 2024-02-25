const mongoose = require('mongoose');

const getFormattedUser = (user) => {
    console.log(user);
    console.log(user.modelName);
    if(user.modelName=="ClubUser"){
        return {
            _id: user._id,
            displayName: user.displayName,
            picturePath: user.picturePath,
            location: user.location
        };
    } else if(user.type=="ServiceProvider"){
        return {
            _id: user._id,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName,
            picturePath: user.picturePath,
            type: user.type
        };
    } else if(user) {

    } else {
        return {msg: "Invalid user type."};
    }
};

module.exports = getFormattedUser;