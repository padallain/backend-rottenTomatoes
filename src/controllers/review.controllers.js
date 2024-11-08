const Review = require('../models/review.model'); // Assuming you have a Review model

class ReviewController {
  // Create a new review
  async createReview(req, res) {
    const { content, author, movie } = req.body;

    if (!content || !author || !movie) {
      return res.status(400).json({ message: 'Content, author, and movie are required' });
    }

    try {
      const newReview = new Review({ content, author, movie });
      await newReview.save();
      res.status(201).json({ message: 'Review created successfully', newReview });
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ message: 'Error creating review' });
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

module.exports = new ReviewController();