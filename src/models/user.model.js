import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password_user: {
    type: String,
    required: true,
  },
  email_user: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String, 
  },
  resetTokenExpires: {
    type: Date, 
  },
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  lastSeenMovies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  watchlistSeries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series'
  }],
  lastSeenSeries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series'
  }],
  movieLastSeen: {
    type: Date, 
  }
});

// El método pre-guardado, si es necesario, para generar el token puede añadirse aquí

const User = mongoose.model('User', userSchema);
export default User;