import express from 'express';
import { register, createLogin, resetPassword, checkResetToken, savePassword, eraseAccount } from '../controllers/auth.controllers.js';
import Movie from '../controllers/movie.controllers.js'; 
import categoryController from '../controllers/review.controllers.js';

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
router.get('/movie/:movieId', Movie.getOneMovie.bind(Movie));

export default router;