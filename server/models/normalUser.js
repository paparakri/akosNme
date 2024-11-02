const mongoose =  require('mongoose');

const initialSettings = {
    notifications: {
        email: true,
        push: false,
        choice: {
            clubToggle: true,
            friendToggle: false,
            artistToggle: true,
            timeBefore: 30, // Example: 30 minutes before
            timeToggle: true,
        },
    },
    security: {
        twoFactor: false,
    },
    privacy: {
        shareData: true,
        publicProfile: false,
        shareLocation: true,
        shareEmail: false,
        sharePhone: false,
        shareReservations: true,
    },
    themeAccessibility: {
        theme: 'light', // Options: light, dark, system
        accessibility: 'normal', // Options: normal, high, extreme
    },
  };

const NormalUserSchema = new mongoose.Schema(
    {
        username: {
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
        dateOfBirth: {
            type: Date,
            required: true
        },
        friends: {
            type: Array,
            default: []
        },
        friendRequests: {
            type: Array,
            default: []
        },
        sentFriendRequests: {
            type: Array,
            default: []
        },
        phoneNumber: {
            type: String,
            required: true,
            min: 8
        },
        bio: {
            type: String,
            default: ""
        },
        favoriteGenres: {
            type: Array,
            default: []
        },
        reservations: {
            type: Array,
            default: []
        },
        loyaltyPoints: {
            type: Number,
            default: 0
        },
        accountSettings: {
            type: Object,
            default: initialSettings
        },
        picturePath: {
            type: String,
            default: ""
        },
        refreshToken: {
            type: String,
            default: ""
        },
        serviceProviderInterests: {
            type: Array,
            default: []
        },
        clubInterests: {
            type: Array,
            default: []
        },
        yourReviews: {
            type: Array,
            default: []
        },
        favoriteClubs: {
            type: Array,
            default: []
        }
    },
    {timestamps:true}
);

const NormalUser = mongoose.model("NormalUser", NormalUserSchema);
module.exports = NormalUser;