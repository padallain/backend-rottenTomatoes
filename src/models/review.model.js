import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for reviews
const reviewSchema = new Schema(
  {
    content: {
      type: String,
      required: true, // The content of the review is required
      trim: true,     // Remove unnecessary spaces
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user who made the review
      ref: 'User',                         // Relate to the User model
      required: true,                      // The author is required
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the movie the review is associated with
      ref: 'Movie',                         // Relate to the Movie model
      required: true,                      // The movie is required
    },
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
    },
    rating: {
      type: Number,
      required: true, // The rating of the review is required
      min: 0,         // Minimum value for rating
      max: 100,        // Maximum value for rating
    },
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt fields
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;