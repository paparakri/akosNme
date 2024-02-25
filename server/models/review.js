const mongoose =  require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        reviewText: {
            type: String,
            required: false,
            min: 10,
            max: 500
        },
        reviewer: {
            type: String,
            required: true,
            min: 3,
            max: 50
        },
        revieweye: {
            type: String,
            required: true,
            min: 3,
            max: 50
        },
    },
    {timestamps:true}
);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;