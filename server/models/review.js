const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReviewSchema = new mongoose.Schema({
        user: {
            type: ObjectId,
            required: true
        },
       club: {
            type: ObjectId,
            required: true
       },
       rating: {
            type: Number,
            required: true
       },
       type: {
          type: String,
          default: "club"
       },
       reviewText: {
            type: String,
            required: true
       },
       likes: {
            type: Number,
            default: 0
       },
       dislikes: {
            type: Number,
            default: 0
       }
    },{timestamps:true}
);

ReviewSchema.post('save', async function(doc) {
     try {
       if (this.isNew) {
         await feedService.createReviewPost(
           doc.user,
           doc.club,
           doc._id,
           doc.rating,
           doc.text
         );
       }
     } catch (error) {
       console.error('Error creating feed post for review:', error);
     }
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;