const mongoose =  require('mongoose');

const ServiceProviderUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            min: 3,
            max: 50,
            unique: true
        },
        email: {
            type: String,
            required: true,
            min: 6,
            max: 70,
            unique: true
        },
        //More configurations need to be added for password
        password: {
            type: String,
            required: true,
            min: 8
        },
        displayName: {
            type: String,
            required: true,
            min: 3,
            max: 50,
            unique: true
        },
        firstName: {
            type: String,
            required: true,
            min: 2,
            max: 50
        },
        lastName: {
            type: String,
            required: true,
            min: 2,
            max: 50
        },
        picturePath: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            required: true,
            min: 3,
            max: 50
        },
        musicType: {
            type: String,
            default: ""
        },
        interestedClubs: {
            type: Array,
            default: []
        },
        followers: {
            type: Array,
            default: []
        },
        events: {
            type: Array,
            default: []
        }
    }
);

const ServiceProviderUser = mongoose.model("ServiceProviderUser", ServiceProviderUserSchema);
module.exports = ServiceProviderUser;