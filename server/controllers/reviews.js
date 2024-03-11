const ClubUser = require("../models/clubUser.js");
const NormalUser = require("../models/normalUser.js");
const ServiceProviderUser = require("../models/serviceProviderUser.js");
const Review = require("../models/review.js");

//POST
const addRemoveReview = async (req, res) => {
    try{
        const id = req.params.id;
        const { interestId, type, rating, reviewText } = req.body;    // I'm also adding a type variable here. So I know if it's a club or S.P.
        const normalUser = await NormalUser.findOne({ username: id });
        if(type == "Club"){
            //Get the club user
            const interestUser = await ClubUser.findById(interestId);
            
            //Check if the user has already reviewed the club
            if (await Review.findOne({ reviewer: normalUser._id, revieweye: interestUser._id })){
                throw new Error("You have already reviewed this club.");
            }

            //Create the review and add it to the review DB & reference it in the club user & the normal user
            const review = { rating, reviewText, reviewer: normalUser._id , reviewDate: Date.now() , revieweye: interestUser._id};
            const newReview = await Review.create(review);

            normalUser.yourReviews.push(newReview._id);
            await normalUser.save();
            interestUser.reviews.push(newReview._id);
            await interestUser.save();

            res.status(200).json({message: "Review added."});
        } else if ("ServiceProvider"){
            //Get the club user
            const interestUser = await ServiceProviderUser.findById(interestId);
            
            //Check if the user has already reviewed the club
            if (await Review.findOne({ reviewer: normalUser._id, revieweye: interestUser._id })){
                throw new Error("You have already reviewed this club.");
            }

            //Create the review and add it to the review DB & reference it in the club user & the normal user
            const review = { rating, reviewText, reviewer: normalUser._id , reviewDate: Date.now() , revieweye: interestUser._id};
            const newReview = await Review.create(review);

            normalUser.yourReviews.push(newReview._id);
            await normalUser.save();
            interestUser.reviews.push(newReview._id);
            await interestUser.save();

            res.status(200).json({message: "Review added."});
        }
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

//GET
const getReviews = async (req, res) => {
    try{
        const username = req.params.id;
        const normalUser = await NormalUser.findOne({username: username});

        let reviews = await Promise.all(
            normalUser.yourReviews.map((id) => Review.findById(id))
        );

        reviews = await Promise.all(reviews.map(async (review) => {
            const reviewer = await NormalUser.findById(review.reviewer);
            const revieweye = await ClubUser.findById(review.revieweye);
            return {
                ...review._doc,
                reviewer: reviewer ? reviewer.username : null,
                revieweye: revieweye ? revieweye.displayName : null
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
        const normalUser = await NormalUser.findOne({ username: username });
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
        const normalUser = await NormalUser.findOne({ username: username });
        const review = await Review.findById(reviewId);
        const revieweye = await ClubUser.findById(review.revieweye);
        if (review.reviewer != normalUser._id){
            throw new Error("You can only delete your own reviews.");
        }
        await Review.findByIdAndDelete(reviewId);
        normalUser.yourReviews = normalUser.yourReviews.filter((id) => id != reviewId);
        revieweye.reviews = revieweye.reviews.filter((id) => id != reviewId);
        await normalUser.save();
        res.status(200).json({message: "Review deleted."});
    } catch(err){
        res.status(400).json( { error: err.message });
    }
};

module.exports = { addRemoveReview, getReviews, updateReview, deleteReview };