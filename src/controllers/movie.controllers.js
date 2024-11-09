import fetch from 'node-fetch';
import Movie from '../models/movie.model.js';

class Movies {
  // Create a new movie
  async createMovie(req, res) {
    const { movieId } = req.body; // Assuming movieId is passed in the request body
    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
    const castUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8'
      }
    };

    try {
      // Fetch movie details
      const movieResponse = await fetch(movieUrl, options);
      const movieData = await movieResponse.json();

      // Fetch cast information
      const castResponse = await fetch(castUrl, options);
      const castData = await castResponse.json();

      // Map cast information
      const cast = castData.cast ? castData.cast.map(member => ({
        name: member.name,
        role: member.character,
        profile_path: member.profile_path,
        character: member.character,
      })) : [];

      const newMovie = new Movie({
        movieId: movieData.id, // Add movieId here
        title: movieData.original_title,
        banner: movieData.backdrop_path,
        caratula: movieData.poster_path,
        duration: movieData.runtime,
        briefDescription: movieData.tagline,
        description: movieData.overview,
        releaseDate: movieData.release_date,
        genre: movieData.genres ? movieData.genres.map(genre => genre.name) : [],
        director: movieData.production_companies ? movieData.production_companies.map(company => company.name).join(', ') : '',
        createdBy: movieData.production_companies ? movieData.production_companies.map(company => company.name).join(', ') : '',
        cast: cast,
        ratings: movieData.vote_average,
        categories: movieData.genres ? movieData.genres.map(genre => genre.name) : [],
        budget: movieData.budget,
        originalLanguage: movieData.original_language,
      });

      const savedMovie = await newMovie.save();
      res.status(201).json({ message: "Movie created successfully", movie: savedMovie });
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Error creating movie", error: error.message });
    }
  }

  // Get a single movie by ID
  async getOneMovie(req, res) {
    res.send('Get one movie');
  }

  // Get trending movies
  async getTrendingMovies(req, res) {
    const url = 'https://api.themoviedb.org/3/trending/all/day?language=en-US';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMDk4ODMyOC4xODI2MDA1LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.teR3vdfItSFXOHQsLQAdjiG0cos3Owbtf2cjyvKjTDI'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ message: "Error fetching trending movies", error: error.message });
    }
  }

  // Update a movie by ID
  async updateMovie(req, res) {
    try {
      const { movieId } = req.params;
      const {
        title,
        banner,
        caratula,
        duration,
        briefDescription,
        description,
        releaseDate,
        genre,
        director,
        createdBy,
        cast,
        ratings,
        categories,
        budget,
        originalLanguage,
      } = req.body;

      const updatedMovie = await Movie.findByIdAndUpdate(
        movieId,
        {
          title,
          banner,
          caratula,
          duration,
          briefDescription,
          description,
          releaseDate,
          genre,
          director,
          createdBy,
          cast,
          ratings,
          categories,
          budget,
          originalLanguage,
        },
        { new: true } // Return the updated document
      );

      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json({ message: "Movie updated successfully", movie: updatedMovie });
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(500).json({ message: "Error updating movie", error: error.message });
    }
  }

  // Delete a movie by ID
  async deleteMovie(req, res) {
    try {
      const { movieId } = req.params;
      const deletedMovie = await Movie.findByIdAndDelete(movieId);

      if (!deletedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Error deleting movie", error: error.message });
    }
  }
}

export default new Movies();