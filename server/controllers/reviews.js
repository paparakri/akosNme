const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");
const ServiceProviderUser = require("../models/serviceProviderUser.js");
const Review = require("../models/review.js");
const mongoose = require('mongoose');

//POST
const addReview = async (req, res) => {
    try {
        console.log(`Adding Review`);
        console.log(req.body);

        const id = req.params.id;
        const { club, type, rating, reviewText } = req.body;

        const existingReview = await Review.findOne({ user: id, club: club });

        if (existingReview) {
            return res.status(400).json({ message: "Review already exists." });
        }

        const normalUser = await NormalUser.findById(id);
        let InterestUserModel = type === "club" ? ClubUser : ServiceProviderUser;
        let interestUser = await InterestUserModel.findById(club);

        const newReview = await Review.create({
            user: normalUser._id,
            club: interestUser._id,
            rating: rating,
            reviewText: reviewText,
            date: Date.now()
        });

        await NormalUser.updateOne(
            { _id: id },
            { $push: { yourReviews: newReview._id } }
        );

        await InterestUserModel.updateOne(
            { _id: club },
            { $push: { reviews: newReview._id } }
        );

        // If it's a club, calculate the club's new rating
        if (type === "club") {
            const clubReviews = await Review.find({ club: club });
            const newAvgRating = clubReviews.reduce((sum, review) => sum + review.rating, 0) / clubReviews.length;
            await ClubUser.updateOne({ _id: club }, { rating: newAvgRating });
        }

        res.status(200).json({ message: "Review added.", review: newReview });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//DELETE
const removeReview = async (req, res) => {
    try {
        // console.log(`Removing Review`);
        // console.log('Request body:', req.body);
        // console.log('Request params:', req.params);
        const userId = req.params.id;
        const { reviewId } = req.body;
        // console.log('User ID:', userId);
        // console.log('Review ID:', reviewId);
        const review = await Review.findById(reviewId);
        // console.log('Found review:', review);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }
        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own reviews." });
        }
        // Remove the review
        const deleteResult = await Review.deleteOne({ _id: reviewId });
        // console.log('Delete result:', deleteResult);
        // Remove the review ID from the user's yourReviews array
        const userUpdateResult = await NormalUser.updateOne(
            { _id: userId },
            { $pull: { yourReviews: new mongoose.Types.ObjectId(reviewId) } }
        );
        // console.log('User update result:', userUpdateResult);
        // Remove the review ID from the club's reviews array
        const clubUpdateResult = await ClubUser.updateOne(
            { _id: review.club },
            { $pull: { reviews: new mongoose.Types.ObjectId(reviewId) } }
        );
        // console.log('Club update result:', clubUpdateResult);
        // Recalculate the club's rating
        const clubReviews = await Review.find({ club: review.club });
        const newAvgRating = clubReviews.length > 0
            ? clubReviews.reduce((sum, rev) => sum + rev.rating, 0) / clubReviews.length
            : 0;
        const ratingUpdateResult = await ClubUser.updateOne(
            { _id: review.club },
            { $set: { rating: newAvgRating } }
        );
        // console.log('Rating update result:', ratingUpdateResult);
        res.status(200).json({ message: "Review removed." });
    } catch (err) {
        // console.error('Error in removeReview:', err);
        res.status(400).json({ error: err.message });
    }
};

//GET
const getReviews = async (req, res) => {
    try{
        const username = req.params.id;
        const normalUser = await NormalUser.findById(username);

        let reviews = await Promise.all(
            normalUser.yourReviews.map((id) => Review.findById(id))
        );

        reviews = await Promise.all(reviews.map(async (review) => {
            const user = await NormalUser.findById(review.user);
            const club = await ClubUser.findById(review.club);
            return {
                ...review._doc,
                user: user ? user.username : null,
                club: club ? club.displayName : null
            };
        }));

        res.status(200).json(reviews);
    } catch(err){
        res.status(400).json({ error: err.message });
    }
}

//PUT
const updateReview = async (req, res) => {
    try{
        const username = req.params.id;
        const { reviewId, rating, reviewText } = req.body;
        const normalUser = await NormalUser.findById(username);
        const review = await Review.findByIdAndUpdate(reviewId, { rating, reviewText }, { new: true });

        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        if (review.user.toString() !== username) {
            return res.status(403).json({ message: "You can only update your own reviews." });
        }

        // If it's a club review, recalculate the club's rating
        const club = await ClubUser.findById(review.club);
        if (club) {
            const clubReviews = await Review.find({ club: review.club });
            const newAvgRating = clubReviews.reduce((sum, review) => sum + review.rating, 0) / clubReviews.length;
            await ClubUser.updateOne({ _id: review.club }, { rating: newAvgRating });
        }

        res.status(200).json({ message: "Review updated.", review: review });
    } catch(err){
        res.status(400).json({ error: err.message });
    }
};

const getReviewById = async (req, res) => {
    try{
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }
        res.status(200).json(review);
    } catch(err){
        res.status(400).json({ error: err.message });
    }
}

module.exports = { addReview, removeReview, getReviews, updateReview, getReviewById };