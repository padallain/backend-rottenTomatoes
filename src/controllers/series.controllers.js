import fetch from "node-fetch";

class Series {


  // Save a series in the database
  async saveSeries(req, res) {
    const { seriesId, title, description, genre, releaseDate } = req.body;

    try {
      const newSeries = new SeriesModel({
        seriesId,
        title,
        description,
        genre,
        releaseDate,
      });

      await newSeries.save();
      res.status(201).json({ message: "Series saved successfully", series: newSeries });
    } catch (error) {
      console.error("Error saving series:", error);
      res.status(500).json({ message: "Error saving series", error: error.message });
    }
  }

  // Save a series to the user's watchlist
  async addToWatchlist(req, res) {
    const { userId, seriesId } = req.body;

    try {
      const user = await User.findById(userId).populate("watchlist");
      const series = await SeriesModel.findOne({ seriesId });

      if (!user || !series) {
        return res.status(404).json({ message: "User or Series not found" });
      }

      user.watchlist.push(series);

      if (user.watchlist.length > 15) {
        user.watchlist.shift();
      }

      await user.save();
      res.status(200).json({ message: "Series added to watchlist", watchlist: user.watchlist });
    } catch (error) {
      console.error("Error adding series to watchlist:", error);
      res.status(500).json({ message: "Error adding series to watchlist", error: error.message });
    }
  }


  async getWatchlist(req, res) {
    const { personId } = req.params;
  
    try {
      const user = await User.findById(personId).populate("watchlist");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ watchlist: user.watchlist });
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
