const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");
const ServiceProviderUser = require("../models/serviceProviderUser.js");
const Review = require("../models/review.js");

//POST
const addRemoveReview = async (req, res) => {
    try {
        console.log(`Adding/Removing Review`);
        console.log(req.body);

        const id = req.params.id;
        const { club, type, rating, reviewText } = req.body; // type variable indicates if it's a club or service provider
        let exists = false;

        const existingReview = await Review.findOne({ user: id, club: club });

        if (existingReview) {
            exists = true;
            // Remove the review from the Review collection
            const response = await Review.deleteOne({ user: id, club: club });

            // Remove the review from the lists in the user and the club/service provider
            const normalUser = await NormalUser.findById(id);
            let interestUser;

            if (type === "club") {
                interestUser = await ClubUser.findById(club);
            } else if (type === "serviceProvider") {
                interestUser = await ServiceProviderUser.findById(club);
            } else {
                throw new Error("Invalid type specified.");
            }

            // Remove the review ID from the user's yourReviews array
            normalUser.yourReviews = normalUser.yourReviews.filter(reviewId => 
                reviewId.toString() !== existingReview._id.toString()
            );
            await normalUser.save();

            // Remove the review ID from the club/service provider's reviews array
            interestUser.reviews = interestUser.reviews.filter(reviewId => 
                reviewId.toString() !== existingReview._id.toString()
            );
            await interestUser.save();

            // If it's a club, recalculate the club's rating
            if (type === "club") {
                const clubReviews = await Review.find({ club: interestUser._id });
                if (clubReviews.length > 0) {
                    const totalRating = clubReviews.reduce((sum, review) => sum + review.rating, 0);
                    const newAvgRating = totalRating / clubReviews.length;
                    interestUser.rating = newAvgRating;
                } else {
                    interestUser.rating = 0; // or any default value you prefer
                }
                await interestUser.save();
            }

            console.log(response);
            res.status(200).json({ message: "Review removed." });
        }
        if(!exists){
            const normalUser = await NormalUser.findById(id);
            let interestUser;
            if (type === "club") {
                // Get the club user
                interestUser = await ClubUser.findById(club);
            } else if (type === "serviceProvider") {
                // Get the service provider user
                interestUser = await ServiceProviderUser.findById(club);
            } else {
                throw new Error("Invalid type specified.");
            }

            // Check if the user has already reviewed the club/service provider

            // Create the review and add it to the review DB & reference it in the user
            const review = {
                user: normalUser._id,
                club: interestUser._id, // Assuming 'club' refers to the interestUser in both cases
                rating: rating,
                reviewText: reviewText,
                date: Date.now()
            };
            const newReview = await Review.create(review);

            normalUser.yourReviews.push(newReview._id);
            await normalUser.save();
            interestUser.reviews.push(newReview._id);
            await interestUser.save();

            // If it's a club, calculate the club's new rating
            if (type === "club") {
                const clubReviews = await Review.find({ club: interestUser._id });
                const totalRating = clubReviews.reduce((sum, review) => sum + review.rating, 0);
                const newAvgRating = totalRating / clubReviews.length;
                interestUser.rating = newAvgRating;
                await interestUser.save();
            }

            res.status(200).json({ message: "Review added." });
        }
    } catch (err) {
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
        res.status(400).json( { error: err.message });
    }
}

//PUT
const updateReview = async (req, res) => {
    try{
        const username = req.params.id;
        const { reviewId, rating, reviewText } = req.body;
        const normalUser = await NormalUser.findById(username);
        const review = await Review.findByIdAndUpdate(reviewId, { rating, reviewText });

        res.status(200).json({message: "Review updated."});
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

//DELETE
const deleteReview = async (req, res) => {
    try{
        const username = req.params.id;
        const { reviewId } = req.body;
        const normalUser = await NormalUser.findById(username);
        const review = await Review.findById(reviewId);
        const club = await ClubUser.findById(review.club);
        if (review.user != normalUser._id){
            throw new Error("You can only delete your own reviews.");
        }
        await Review.findByIdAndDelete(reviewId);
        normalUser.yourReviews = normalUser.yourReviews.filter((id) => id != reviewId);
        club.reviews = club.reviews.filter((id) => id != reviewId);
        await normalUser.save();
        res.status(200).json({message: "Review deleted."});
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

const getReviewById = async (req, res) => {
    try{
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        res.status(200).json(review);
    } catch(err){
        res.status(400).json( { error: err.message });
    }
}

module.exports = { addRemoveReview, getReviews, updateReview, deleteReview, getReviewById };