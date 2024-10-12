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
            min: 3,
            max: 50
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
            default: 0
        },
        images: {
            type: [{type: String}],
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
        },
        formattedPrice: {
            type: Number,
            default: null
        },
        detailedDescription: {
            type: String,
            default: ""
        },
        features: {
            type: Array,
            default: []
        },
        address: {
            type: String,
            default: ""
        },
        tableLayout: {
            type: Array,
            default: []
        },
        refreshToken: {
            type: String,
            default: ""
        },
        genres: {
            type: [{type: String}],
            default: ""
        },
        capacity: {
            type: Number
        },
        openingHours: {
            type:Object
        },
        minAge: {
            type: Number,
            default: 21
        },
        dressCode: {
            type: String
        },
        contactInfo: {
            type: Object
        },
        socialMediaLinks: {
            type: Object
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {timestamps:true}
);

const ClubUser = mongoose.model("ClubUser", ClubUserSchema);
module.exports = ClubUser;