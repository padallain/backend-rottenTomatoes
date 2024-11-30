import fetch from "node-fetch";
import mongoose from "mongoose";
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

      // Map cast information and limit to the first 10 members
      const cast = castData.cast
        ? castData.cast.slice(0, 10).map((member) => ({
            id: member.id, // Include the id from the API
            name: member.name,
            role: member.character,
            profile_path: member.profile_path, // Include the profile_path from the API
          }))
        : [];

      const newMovie = new Movie({
        movieId: movieData.id, // Add movieId here
        title: movieData.original_title,
        banner: movieData.poster_path,
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

  // Get a single movie by movieId and title
  async getMovieByIdAndTitle(req, res) {
    const { id, title } = req.params; // Assuming movieId and title are passed as URL parameters

    try {
      const movie = await Movie.findOne({ id, title });

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res
        .status(500)
        .json({ message: "Error fetching movie", error: error.message });
    }
  }

  // Get a single movie by _id
  async getMovieById(req, res) {
    const { id } = req.params; // Assuming _id is passed as a URL parameter

    try {
      const movie = await Movie.findById(id);

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.status(200).json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res
        .status(500)
        .json({ message: "Error fetching movie", error: error.message });
    }
  }

  // Update lastSeen to the current date and time for a movie in the user's last seen list
  async updateLastSeen(req, res) {
    const { userId, movieId } = req.body; // Assuming userId and movieId are passed in the request body

    try {
      // Update the lastSeen field in the Movie document
      const movie = await Movie.findByIdAndUpdate(
        movieId,
        { lastSeen: new Date() },
        { new: true } // Return the updated document
      );

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Update the lastSeen field in the User document
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const lastSeenMovie = user.lastSeenMovies.find(
        (movie) => movie.movie && movie.movie.toString() === movieId
      );

      if (lastSeenMovie) {
        lastSeenMovie.seenAt = new Date();
      } else {
        user.lastSeenMovies.push({ movie: movieId, seenAt: new Date() });
      }

      await user.save();

      res
        .status(200)
        .json({ message: "Last seen updated successfully", movie, user });
    } catch (error) {
      console.error("Error updating last seen:", error);
      res
        .status(500)
        .json({ message: "Error updating last seen", error: error.message });
    }
  }

  // Remove a movie from the user's watchlist
  async removeFromWatchlist(req, res) {
    const { userId, movieId } = req.body;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const movieIndex = user.watchlist.findIndex(
        (movie) => movie.toString() === movieId
      );

      if (movieIndex === -1) {
        return res
          .status(404)
          .json({ message: "Movie not found in watchlist" });
      }

      user.watchlist.splice(movieIndex, 1);
      await user.save();

      res
        .status(200)
        .json({
          message: "Movie removed from watchlist",
          watchlist: user.watchlist,
        });
    } catch (error) {
      console.error("Error removing movie from watchlist:", error);
      res
        .status(500)
        .json({
          message: "Error removing movie from watchlist",
          error: error.message,
        });
    }
  }

  // Check if a movie is in the user's last seen list
  async isMovieInLastSeen(req, res) {
    const { userId, movieId } = req.params; // Assuming userId and movieId are passed as URL parameters

    try {
      const user = await User.findById(userId).populate("lastSeenMovies");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const movieInLastSeen = user.lastSeenMovies.some(
        (movie) => movie._id.toString() === movieId
      );

      if (!movieInLastSeen) {
        return res
          .status(404)
          .json({ message: "Movie not found in last seen list" });
      }

      res.status(200).json({ message: "Movie is in last seen list" });
    } catch (error) {
      console.error("Error checking movie in last seen list:", error);
      res
        .status(500)
        .json({
          message: "Error checking movie in last seen list",
          error: error.message,
        });
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

      res.status(200).json({
        message: "Movie added to last seen movies",
        lastSeenMovies: user.lastSeenMovies,
      });
    } catch (error) {
      console.error("Error adding movie to last seen movies:", error);
      res.status(500).json({
        message: "Error adding movie to last seen movies",
        error: error.message,
      });
    }
  }

  // Get user's last seen movies with full movie details
  async getLastSeen(req, res) {
    const { personId } = req.params;

    try {
      const user = await User.findById(personId).populate({
        path: "lastSeenMovies.movie",
        model: "Movie",
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Populate the movie details for each last seen movie
      const lastSeenMovies = user.lastSeenMovies.map((lastSeen) => ({
        _id: lastSeen._id,
        seenAt: lastSeen.seenAt,
        movie: lastSeen.movie,
      }));

      res.status(200).json({ lastSeenMovies });
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

      // Search for movies and TV shows
      async searchMulti(req, res) {
        const { query } = req.query; // Get the query parameter from the request
    
        if (!query) {
          return res.status(400).json({ message: "Query parameter is required" });
        }
    
        const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
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
    
          // Filter the required fields
          const filteredResults = data.results.map(item => ({
            movieId: item.id,
            name: item.name || item.title,
            overview: item.overview,
            poster_path: item.poster_path,
            media_type: item.media_type,
            popularity: item.popularity,
            first_air_date: item.first_air_date || item.release_date,
            gen_id:item.genre_ids,
            vote_average: item.vote_average,
          }));
    
          res.status(200).json(filteredResults);
        } catch (error) {
          console.error("Error fetching search results:", error);
          res.status(500).json({
            message: "Error fetching search results",
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
      res.status(500).json({
        message: "Error fetching trending movies",
        error: error.message,
      });
    }
  }

  // Get trending movies
  async getTrendingWeekMovies(req, res) {
    const url = "https://api.themoviedb.org/3/trending/all/week?language=en-US";
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
      res.status(500).json({
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
      res.status(500).json({
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
      res.status(500).json({
        message: "Error fetching top rated movies",
        error: error.message,
      });
    }
  }
  async discoverMovies(req, res) {
    const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&release_date.gte=2024-01-01&sort_by=popularity.desc';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching discovered movies:", error);
      res.status(500).json({
        message: "Error fetching discovered movies",
        error: error.message,
      });
    }
  }

  async getUpcomingPopularSeries(req, res) {
    const url = 'https://api.themoviedb.org/3/discover/tv?first_air_date.gte=2024-01-01&include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return res.status(404).json({ message: "No upcoming popular TV series found" });
      }

      // Filter the required fields
      const filteredResults = data.results.map(item => ({
        name: item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        media_type: item.media_type,
        popularity: item.popularity,
        first_air_date: item.first_air_date,
      }));

      res.status(200).json(filteredResults);
    } catch (error) {
      console.error("Error fetching upcoming popular TV series:", error);
      res.status(500).json({
        message: "Error fetching upcoming popular TV series",
        error: error.message,
      });
    }
  }

  // Save a movie to the user's watchlist
  async addToWatchlist(req, res) {
    const { userId, movieId } = req.body; // Assuming userId and movieId are passed in the request body

    try {
      const user = await User.findById(userId).populate("watchlist");
      const movie = await Movie.findOne({ movieId: movieId });

      if (!user || !movie) {
        return res.status(404).json({ message: "User or Movie not found" });
      }

      // Add the movie to the user's last seen movies
      user.watchlist.push(movie);

      // Ensure the array does not exceed 15 movies
      if (user.watchlist.length > 15) {
        user.watchlist.shift(); // Remove the oldest movie
      }

      await user.save();

      res.status(200).json({
        message: "Movie added to watchlist movies",
        lastSeenMovies: user.watchlist,
      });
    } catch (error) {
      console.error("Error adding movie to watch movies:", error);
      res.status(500).json({
        message: "Error adding movie to watch movies",
        error: error.message,
      });
    }
  }

  // Remove a movie from the user's watchlist
  async removeFromWatchlist(req, res) {
    const { userId, movieId } = req.body;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const movieIndex = user.watchlist.findIndex(
        (movie) => movie.toString() === movieId
      );

      if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not found in watchlist" });
      }

      user.watchlist.splice(movieIndex, 1);
      await user.save();

      res.status(200).json({ message: "Movie removed from watchlist", watchlist: user.watchlist });
    } catch (error) {
      console.error("Error removing movie from watchlist:", error);
      res.status(500).json({ message: "Error removing movie from watchlist", error: error.message });
    }
  }

  // Get all watchlist movies for a user
  async getWatchlist(req, res) {
    const { personId } = req.params; // Assuming userId is passed as a URL parameter

    try {
      const user = await User.findById(personId).populate("watchlist");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ watchlist: user.watchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res
        .status(500)
        .json({ message: "Error fetching watchlist", error: error.message });
    }
  }

  async addLastSeen(req, res) {
    const { userId, movieId } = req.body; // Assuming userId and movieId are passed in the request body

    try {
      const user = await User.findById(userId).populate("lastSeenMovies");
      const movie = await Movie.findById(movieId);

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

  // Get all last seen movies for a user
  async getLastSeen(req, res) {
    const { personId } = req.params; // Assuming userId is passed as a URL parameter

    try {
      const user = await User.findById(personId).populate("lastSeenMovies");

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

  async moviesInTheater(req, res) {
    const url =
      "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }

      res.status(200).json(data.results);
    } catch (error) {
      console.error("Error fetching movies in theaters:", error);
      res
        .status(500)
        .json({
          message: "Error fetching movies in theaters",
          error: error.message,
        });
    }
  }

  async getActionMoviesByRating(req, res) {
    const url =
      "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=10&with_genres=28";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }

      res.status(200).json(data.results);
    } catch (error) {
      console.error("Error fetching action movies by rating:", error);
      res
        .status(500)
        .json({
          message: "Error fetching action movies by rating",
          error: error.message,
        });
    }
  }

  async getComedyMoviesByRating(req, res) {
    const url =
      "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=10&with_genres=35";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }

      res.status(200).json(data.results);
    } catch (error) {
      console.error("Error fetching comedy movies by rating:", error);
      res
        .status(500)
        .json({
          message: "Error fetching comedy movies by rating",
          error: error.message,
        });
    }
  }

  async getAnimatedMoviesByRating(req, res) {
    const url =
      "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=10&with_genres=16";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }

      res.status(200).json(data.results);
    } catch (error) {
      console.error("Error fetching animated movies by rating:", error);
      res
        .status(500)
        .json({
          message: "Error fetching animated movies by rating",
          error: error.message,
        });
    }
  }

  async getHorrorMoviesByRating(req, res) {
    const url =
      "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_average.desc&vote_count.gte=10&with_genres=27";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }

      res.status(200).json(data.results);
    } catch (error) {
      console.error("Error fetching horror movies by rating:", error);
      res
        .status(500)
        .json({
          message: "Error fetching horror movies by rating",
          error: error.message,
        });
    }
  }
}

export default new Movies();
