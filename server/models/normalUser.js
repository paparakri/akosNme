const mongoose =  require('mongoose');

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
        picturePath: {
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
        }
    },
    {timestamps:true}
);

const NormalUser = mongoose.model("NormalUser", NormalUserSchema);
module.exports = NormalUser;