import fetch from "node-fetch";
import Movie from "../models/movie.model.js";
import User from "../models/user.model.js";

class Movies {
  // Create a new movie
  async createMovie(req, res) {
    const { movieId } = req.body; // Assuming movieId is passed in the request body
    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
    const castUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8",
      },
    };

    try {
      // Fetch movie details
      const movieResponse = await fetch(movieUrl, options);
      const movieData = await movieResponse.json();

      // Fetch cast information
      const castResponse = await fetch(castUrl, options);
      const castData = await castResponse.json();

      // Map cast information
      const cast = castData.cast
        ? castData.cast.map((member) => ({
            id: member.id, // Include the id from the API
            name: member.name,
            role: member.character,
            profile_path: member.profile_path,
            character: member.character,
          }))
        : [];

      const newMovie = new Movie({
        movieId: movieData.id, // Add movieId here
        title: movieData.original_title,
        banner: movieData.backdrop_path,
        caratula: movieData.poster_path,
        duration: movieData.runtime,
        briefDescription: movieData.tagline,
        description: movieData.overview,
        releaseDate: movieData.release_date,
        genre: movieData.genres
          ? movieData.genres.map((genre) => genre.name)
          : [],
        director: movieData.production_companies
          ? movieData.production_companies
              .map((company) => company.name)
              .join(", ")
          : "",
        createdBy: movieData.production_companies
          ? movieData.production_companies
              .map((company) => company.name)
              .join(", ")
          : "",
        cast: cast,
        ratings: movieData.vote_average,
        categories: movieData.genres
          ? movieData.genres.map((genre) => genre.name)
          : [],
        budget: movieData.budget,
        originalLanguage: movieData.original_language,
      });

      const savedMovie = await newMovie.save();
      res
        .status(201)
        .json({ message: "Movie created successfully", movie: savedMovie });
    } catch (error) {
      console.error("Error creating movie:", error);
      res
        .status(500)
        .json({ message: "Error creating movie", error: error.message });
    }
  }

  // Get a single movie by ID
  async saveOurMovies(req, res) {
    const { userId, movieId } = req.body; // Assuming userId and movieId are passed in the request body

    try {
      const user = await User.findById(userId).populate("lastSeenMovies");
      const movie = await Movie.findOne({ movieId: movieId });

      if (!user || !movie) {
        return res.status(404).json({ message: "User or Movie not found" });
      }

      // Add the movie to the user's last seen movies
      user.lastSeenMovies.push(movie);

      // Ensure the array does not exceed 15 movies
      if (user.lastSeenMovies.length > 15) {
        user.lastSeenMovies.shift(); // Remove the oldest movie
      }

      await user.save();

      res
        .status(200)
        .json({
          message: "Movie added to last seen movies",
          lastSeenMovies: user.lastSeenMovies,
        });
    } catch (error) {
      console.error("Error adding movie to last seen movies:", error);
      res
        .status(500)
        .json({
          message: "Error adding movie to last seen movies",
          error: error.message,
        });
    }
  }

  async getLastSeen(req, res) {
    const { userId } = req.body; // Assuming userId is passed in the request body

    try {
      const user = await User.findById(userId).populate("lastSeenMovies");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ lastSeenMovies: user.lastSeenMovies });
    } catch (error) {
      console.error("Error fetching last seen movies:", error);
      res
        .status(500)
        .json({
          message: "Error fetching last seen movies",
          error: error.message,
        });
    }
  }

  // Get trending movies
  async getTrendingMovies(req, res) {
    const url = "https://api.themoviedb.org/3/trending/all/day?language=en-US";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMDk4ODMyOC4xODI2MDA1LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.teR3vdfItSFXOHQsLQAdjiG0cos3Owbtf2cjyvKjTDI",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res
        .status(500)
        .json({
          message: "Error fetching trending movies",
          error: error.message,
        });
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

      res
        .status(200)
        .json({ message: "Movie updated successfully", movie: updatedMovie });
    } catch (error) {
      console.error("Error updating movie:", error);
      res
        .status(500)
        .json({ message: "Error updating movie", error: error.message });
    }
  }

  // get all popular movies
  async getPopularMovies(req, res) {
    const url = "https://api.themoviedb.org/3/movie/popular?language=en-US";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMDk4ODMyOC4xODI2MDA1LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.teR3vdfItSFXOHQsLQAdjiG0cos3Owbtf2cjyvKjTDI",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res
        .status(500)
        .json({
          message: "Error fetching popular movies",
          error: error.message,
        });
    }
  }

  // get top rated movies
  async getTopRatedMovies(req, res) {
    const url = "https://api.themoviedb.org/3/movie/top_rated?language=en-US";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMDk4ODMyOC4xODI2MDA1LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.teR3vdfItSFXOHQsLQAdjiG0cos3Owbtf2cjyvKjTDI",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      res
        .status(500)
        .json({
          message: "Error fetching top rated movies",
          error: error.message,
        });
    }
  }
  
    // Save a movie to the user's watchlist
    async addToWatchlist(req, res) {
      const { userId, movieId } = req.body; // Assuming userId and movieId are passed in the request body
  
      try {
        const user = await User.findById(userId).populate('watchlist');
        const movie = await Movie.findById(movieId);
  
        if (!user || !movie) {
          return res.status(404).json({ message: 'User or Movie not found' });
        }
  
        // Add the movie to the user's watchlist
        user.watchlist.push(movie);
  
        await user.save();
  
        res.status(200).json({ message: 'Movie added to watchlist', watchlist: user.watchlist });
      } catch (error) {
        console.error("Error adding movie to watchlist:", error);
        res.status(500).json({ message: "Error adding movie to watchlist", error: error.message });
      }
    }

  // Get all watchlist movies for a user
  async getWatchlist(req, res) {
    const { personId } = req.params; // Assuming userId is passed as a URL parameter

    try {
      const user = await User.findById(personId).populate('watchlist');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ watchlist: user.watchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Error fetching watchlist", error: error.message });
    }
  }

    async addLastSeen(req, res) {
      const { userId, movieId } = req.body; // Assuming userId and movieId are passed in the request body
  
      try {
        const user = await User.findById(userId).populate('lastSeenMovies');
        const movie = await Movie.findById(movieId);
  
        if (!user || !movie) {
          return res.status(404).json({ message: 'User or Movie not found' });
        }
  
        // Add the movie to the user's last seen movies
        user.lastSeenMovies.push(movie);
  
        // Ensure the array does not exceed 15 movies
        if (user.lastSeenMovies.length > 15) {
          user.lastSeenMovies.shift(); // Remove the oldest movie
        }
  
        await user.save();
  
        res.status(200).json({ message: 'Movie added to last seen movies', lastSeenMovies: user.lastSeenMovies });
      } catch (error) {
        console.error("Error adding movie to last seen movies:", error);
        res.status(500).json({ message: "Error adding movie to last seen movies", error: error.message });
      }
    }

    // Get all last seen movies for a user
  async getLastSeen(req, res) {
    const { personId } = req.params; // Assuming userId is passed as a URL parameter

    try {
      const user = await User.findById(personId).populate('lastSeenMovies');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ lastSeenMovies: user.lastSeenMovies });
    } catch (error) {
      console.error("Error fetching last seen movies:", error);
      res.status(500).json({ message: "Error fetching last seen movies", error: error.message });
    }
  }

  //Search for a name movie
  async getSpecificMovie(req, res) {
    const { nameMovie } = req.params;
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      nameMovie
    )}&language=en-US`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMDk4ODMyOC4xODI2MDA1LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.teR3vdfItSFXOHQsLQAdjiG0cos3Owbtf2cjyvKjTDI",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results.length === 0) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json(data.results);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res
        .status(500)
        .json({ message: "Error fetching movie", error: error.message });
    }
  }
}

export default new Movies();
