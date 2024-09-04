const mongoose =  require('mongoose');

const ClubUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            min: 6,
            max: 70,
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
            unique: true,

        },
        location: {
            type: String,
            required: true,
            min:3,
            max:70
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
            default: 0
        },
        picturePath: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        serviceProviderInterests: {
            type: Array,
            default: []
        },
        followers: {
            type: Array,
            default: []
        },
        reviews: {
            type: Array,
            default: []
        },
        events: {
            type: Array,
            default: []
        }
    },
    {timestamps:true}
);

const ClubUser = mongoose.model("ClubUser", ClubUserSchema);
module.exports = ClubUser;