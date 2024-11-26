import fetch from "node-fetch";
import SeriesModel from "../models/series.model.js";
import User from "../models/user.model.js";

class Series {


  async saveSeries(req, res) {
    const { seriesId } = req.body; // Assuming seriesId is passed in the request body
    const seriesUrl = `https://api.themoviedb.org/3/tv/${seriesId}?language=en-US`;
    const castUrl = `https://api.themoviedb.org/3/tv/${seriesId}/credits?language=en-US`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMTAwOTM2MS41MDY2MjY4LCJzdWIiOiI2NzI2ZWRmODU1NDA4M2E1NmEwZDVkNGUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.0RZFQ_u-V1-I9RU-Kk6Qt-HB2v-MASBmHryZu9pLLD8'
      }
    };

    try {
      // Fetch series details
      const seriesResponse = await fetch(seriesUrl, options);
      const seriesData = await seriesResponse.json();

      // Fetch cast information
      const castResponse = await fetch(castUrl, options);
      const castData = await castResponse.json();

      // Map cast information and limit to the first 10 members
      const cast = castData.cast ? castData.cast.slice(0, 10).map(member => ({
        id: member.id, // Include the id from the API
        name: member.name,
        role: member.character,
        profile_path: member.profile_path,
        character: member.character,
      })) : [];

      const newSeries = new SeriesModel({
        seriesId: seriesData.id, // Add seriesId here
        title: seriesData.original_name,
        banner: seriesData.poster_path,
        caratula: seriesData.poster_path,
        duration: seriesData.episode_run_time ? seriesData.episode_run_time[0] : null,
        briefDescription: seriesData.tagline,
        description: seriesData.overview,
        releaseDate: seriesData.first_air_date,
        genre: seriesData.genres ? seriesData.genres.map(genre => genre.name) : [],
        director: seriesData.created_by ? seriesData.created_by.map(creator => creator.name).join(', ') : '',
        createdBy: seriesData.created_by ? seriesData.created_by.map(creator => creator.name).join(', ') : '',
        cast: cast,
        ratings: seriesData.vote_average,
        categories: seriesData.genres ? seriesData.genres.map(genre => genre.name) : [],
        budget: seriesData.budget,
        originalLanguage: seriesData.original_language,
      });

      const savedSeries = await newSeries.save();
      res.status(201).json({ message: "Series created successfully", series: savedSeries });
    } catch (error) {
      console.error("Error creating series:", error);
      res.status(500).json({ message: "Error creating series", error: error.message });
    }
  }

   // Update lastSeen to the current date and time for a series
   async updateLastSeen(req, res) {
    const { seriesId } = req.body; // Assuming seriesId is passed as a URL parameter

    try {
      const series = await SeriesModel.findOneAndUpdate(
        { seriesId },
        { lastSeen: new Date() },
        { new: true } // Return the updated document
      );

      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      res.status(200).json({ message: "Last seen updated successfully", series });
    } catch (error) {
      console.error("Error updating last seen:", error);
      res.status(500).json({ message: "Error updating last seen", error: error.message });
    }
  }

   // Check if a series is in the user's last seen list
   async isSeriesInLastSeen(req, res) {
    const { userId, seriesId } = req.params; // Assuming userId and seriesId are passed as URL parameters

    try {
      const user = await User.findById(userId).populate("lastSeenSeries");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const seriesInLastSeen = user.lastSeenSeries.some(series => series._id.toString() === seriesId);

      if (!seriesInLastSeen) {
        return res.status(404).json({ message: "Series not found in last seen list" });
      }

      res.status(200).json({ message: "Series is in last seen list" });
    } catch (error) {
      console.error("Error checking series in last seen list:", error);
      res.status(500).json({ message: "Error checking series in last seen list", error: error.message });
    }
  }

  // Remove a series from the user's watchlist
  async removeFromWatchlist(req, res) {
    const { userId, seriesId } = req.body;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const seriesIndex = user.watchlistSeries.findIndex(series => series.toString() === seriesId);

      if (seriesIndex === -1) {
        return res.status(404).json({ message: "Series not found in watchlist" });
      }

      user.watchlistSeries.splice(seriesIndex, 1);
      await user.save();

      res.status(200).json({ message: "Series removed from watchlist", watchlistSeries: user.watchlistSeries });
    } catch (error) {
      console.error("Error removing series from watchlist:", error);
      res.status(500).json({ message: "Error removing series from watchlist", error: error.message });
    }
  }

 // Get a single series by seriesId and title
 async getSeriesByIdAndTitle(req, res) {
  const { seriesId, title } = req.params; // Assuming seriesId and title are passed as URL parameters

  try {
    const series = await SeriesModel.findOne({ seriesId, title });

    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    res.status(200).json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    res.status(500).json({ message: "Error fetching series", error: error.message });
  }
}

  // Save a series to the user's watchlist
  async addToWatchlist(req, res) {
    const { userId, seriesId } = req.body;

    try {
      const user = await User.findById(userId).populate("watchlistSeries");
      const series = await SeriesModel.findOne({ seriesId });

      if (!user || !series) {
        return res.status(404).json({ message: "User or Series not found" });
      }

      user.watchlistSeries.push(series);

      if (user.watchlistSeries.length > 15) {
        user.watchlistSeries.shift();
      }

      await user.save();
      res.status(200).json({ message: "Series added to watchlist", watchlistSeries: user.watchlistSeries });
    } catch (error) {
      console.error("Error adding series to watchlist:", error);
      res.status(500).json({ message: "Error adding series to watchlist", error: error.message });
    }
  }


  async getWatchlist(req, res) {
    const { personId } = req.params;

    try {
      const user = await User.findById(personId).populate("watchlistSeries");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ watchlistSeries: user.watchlistSeries });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Error fetching watchlist", error: error.message });
    }
  }

  // Get user's last seen series
  async getLastSeen(req, res) {
    const { personId } = req.params;

    try {
      const user = await User.findById(personId).populate("lastSeenSeries");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ lastSeenSeries: user.lastSeenSeries });
    } catch (error) {
      console.error("Error fetching last seen series:", error);
      res.status(500).json({ message: "Error fetching last seen series", error: error.message });
    }
  }

  // Save a series to the user's last seen list
  async addLastSeen(req, res) {
    const { userId, seriesId } = req.body;

    try {
      const user = await User.findById(userId).populate("lastSeenSeries");
      const series = await SeriesModel.findOne({ seriesId });

      if (!user || !series) {
        return res.status(404).json({ message: "User or Series not found" });
      }

      user.lastSeenSeries.push(series);

      if (user.lastSeenSeries.length > 15) {
        user.lastSeenSeries.shift();
      }

      await user.save();
      res.status(200).json({ message: "Series added to last seen list", lastSeenSeries: user.lastSeenSeries });
    } catch (error) {
      console.error("Error adding series to last seen list:", error);
      res.status(500).json({ message: "Error adding series to last seen list", error: error.message });
    }
  }



  // Get popular TV series
  async getPopularSeries(req, res) {
    const url = "https://api.themoviedb.org/3/tv/popular?language=en-US";
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
      console.error("Error fetching popular TV series:", error);
      res
        .status(500)
        .json({
          message: "Error fetching popular TV series",
          error: error.message,
        });
    }
  }

  // Get top-rated TV series
  async getTopRatedSeries(req, res) {
    const url =
      "https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMjM2MzA0NC4wMjA3NTQsInN1YiI6IjY3MjZlZGY4NTU0MDgzYTU2YTBkNWQ0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A36jP2inD2g3vtF4S9laLNNkF9YL0RW867OXvK1G_Nc",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching top-rated TV series:", error);
      res
        .status(500)
        .json({
          message: "Error fetching top-rated TV series",
          error: error.message,
        });
    }
  }

  async getActionAdventureSeries(req, res) {
    const url =
      "https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=10759";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMjM2MzA0NC4wMjA3NTQsInN1YiI6IjY3MjZlZGY4NTU0MDgzYTU2YTBkNWQ0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A36jP2inD2g3vtF4S9laLNNkF9YL0RW867OXvK1G_Nc",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching action and adventure TV series:", error);
      res
        .status(500)
        .json({
          message: "Error fetching action and adventure TV series",
          error: error.message,
        });
    }
  }

  // get animatimation movies
  async getAnimationSeries(req, res) {
    const url = 'https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMjM2MzA0NC4wMjA3NTQsInN1YiI6IjY3MjZlZGY4NTU0MDgzYTU2YTBkNWQ0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A36jP2inD2g3vtF4S9laLNNkF9YL0RW867OXvK1G_Nc'
      }
    };
  
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching animation TV series:", error);
      res.status(500).json({
        message: "Error fetching animation TV series",
        error: error.message,
      });
    }
  }

  //getDramaSeries
  async getDramaSeries(req, res) {
    const url =
      "https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=18";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMjM2MzA0NC4wMjA3NTQsInN1YiI6IjY3MjZlZGY4NTU0MDgzYTU2YTBkNWQ0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A36jP2inD2g3vtF4S9laLNNkF9YL0RW867OXvK1G_Nc",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching drama TV series:", error);
      res
        .status(500)
        .json({
          message: "Error fetching drama TV series",
          error: error.message,
        });
    }
  }

  //get Comedy
  async getComedySeries(req, res) {
    const url = 'https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=35';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNDZhMWU5Y2NkMTZmZjliYmRmZTZiNmVmNjhiYzAxYyIsIm5iZiI6MTczMjM2MzA0NC4wMjA3NTQsInN1YiI6IjY3MjZlZGY4NTU0MDgzYTU2YTBkNWQ0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A36jP2inD2g3vtF4S9laLNNkF9YL0RW867OXvK1G_Nc'
      }
    };
  
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching comedy TV series:", error);
      res.status(500).json({
        message: "Error fetching comedy TV series",
        error: error.message,
      });
    }
  }

}

export default new Series();
