import express from 'express';
import { register, createLogin, resetPassword, checkResetToken, savePassword, eraseAccount } from '../controllers/auth.controllers.js';
import Movie from '../controllers/movie.controllers.js'; 
import Series from '../controllers/series.controllers.js';


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

// Series routes
router.get('/popularSeries', Series.getPopularSeries.bind(Series));
  
export default router;