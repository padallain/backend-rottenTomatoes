import Review from '../models/review.model.js';
import Movie from '../models/movie.model.js';

class ReviewController {
  // Create a new review
  async createReview(req, res) {
    const { content, author, movie, rating } = req.body;

    if (!content || !author || !movie || !rating) {
      return res.status(400).json({ message: 'Content, author, movie, and rating are required' });
    }

    try {
      // Create a new review
      const newReview = new Review({ content, author, movie, rating });
      await newReview.save();

      // Update the movie with the new review
      const updatedMovie = await Movie.findByIdAndUpdate(
        movie,
        { $push: { reviews: newReview._id } },
        { new: true }
      ).populate('reviews');

      if (!updatedMovie) {
        return res.status(404).json({ message: 'Movie not found' });
      }

      res.status(201).json({ message: 'Review created successfully', newReview, updatedMovie });
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ message: 'Error creating review', error: err.message });
    }
  }

  // Get all reviews
  async getReviews(req, res) {
    try {
      const reviews = await Review.find().populate('author').populate('movie');
      res.status(200).json(reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }

   // Get reviews by movie
   async getReviewsByMovie(req, res) {
    const { movieId } = req.params;

    try {
      const reviews = await Review.find({ movie: movieId }).populate('author').populate('movie');

      if (!reviews || reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found for this movie' });
      }

      res.status(200).json(reviews);
    } catch (err) {
      console.error('Error fetching reviews by movie:', err);
      res.status(500).json({ message: 'Error fetching reviews by movie', error: err.message });
    }
  }
  

  // Get a single review by ID
  async getReviewById(req, res) {
    try {
      const { reviewId } = req.params;
      const review = await Review.findById(reviewId).populate('author').populate('movie');

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.status(200).json(review);
    } catch (err) {
      console.error('Error fetching review:', err);
      res.status(500).json({ message: 'Error fetching review' });
    }
  }

  //get a single review by author
  async getReviewAuthor(req, res) {
    try {
      const { authorID } = req.params;
      const reviews = await Review.find({ authorID }).populate('author').populate('movie');

      if (!reviews || reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found for this author' });
      }

      res.status(200).json(reviews);
    } catch (err) {
      console.error('Error fetching reviews by author:', err);
      res.status(500).json({ message: 'Error fetching reviews by author' });
    }
  }

  // Update a review by ID
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { content, author, movie } = req.body;

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { content, author, movie },
        { new: true } // Return the updated document
      );

      if (!updatedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.status(200).json({ message: 'Review updated successfully', updatedReview });
    } catch (err) {
      console.error('Error updating review:', err);
      res.status(500).json({ message: 'Error updating review' });
    }
  }

  // Delete a review by ID
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const deletedReview = await Review.findByIdAndDelete(reviewId);

      if (!deletedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
      console.error('Error deleting review:', err);
      res.status(500).json({ message: 'Error deleting review' });
    }
  }
}


export default new ReviewController();