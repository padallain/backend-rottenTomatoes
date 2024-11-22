import express from 'express';
import { register, createLogin, resetPassword, checkResetToken, savePassword, eraseAccount } from '../controllers/auth.controllers.js';
import Movie from '../controllers/movie.controllers.js'; 
import Series from '../controllers/series.controllers.js';
import ReviewController from '../controllers/review.controllers.js';


const router = express.Router();

router.use(express.json()); 

// Auth routes
router.get('/', (req, res) => {
  res.send('You have to log in.');
});
router.post('/register', register);
router.post('/login', createLogin);
router.post('/resetPassword', resetPassword);
router.post('/checkReset', checkResetToken);
router.post('/newPassword', savePassword);
router.delete('/deleteUser', eraseAccount);

// Movie routes
router.get('/trendingMovies', Movie.getTrendingMovies.bind(Movie)); 
router.post('/createMovie', Movie.createMovie.bind(Movie)); 
router.post('/saveOurMovie', Movie.saveOurMovies.bind(Movie)); 
router.post('/getLast', Movie.getLastSeen.bind(Movie));
router.get('/popularMovies', Movie.getPopularMovies.bind(Movie));
router.get('/topRated', Movie.getTopRatedMovies.bind(Movie));
router.get('/getSpecificMovie/:nameMovie', Movie.getSpecificMovie.bind(Movie));
router.post('/yourWatchlist', Movie.addToWatchlist.bind(Movie));
router.get('/getWatchlist/:personId', Movie.getWatchlist.bind(Movie)); 
router.post('/addLastSeen', Movie.addLastSeen.bind(Movie)); 
router.get('/getLastSeen/:personId', Movie.getLastSeen.bind(Movie));



// Series routes
router.get('/popularSeries', Series.getPopularSeries.bind(Series));

// Review routes
router.post('/createReview', ReviewController.createReview.bind(ReviewController));
router.get('/reviews', ReviewController.getReviews.bind(ReviewController));
router.get('/review/:reviewId', ReviewController.getReviewById.bind(ReviewController));
router.get('/reviews/movie/:movieId', ReviewController.getReviewMovie.bind(ReviewController));
router.get('/reviews/author/:authorId', ReviewController.getReviewAuthor.bind(ReviewController));
router.put('/review/:reviewId', ReviewController.updateReview.bind(ReviewController));
router.delete('/review/:reviewId', ReviewController.deleteReview.bind(ReviewController));
  
export default router;