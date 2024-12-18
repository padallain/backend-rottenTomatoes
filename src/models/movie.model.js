import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the Movie schema
const movieSchema = new Schema(
  {
    movieId: {
      type: String,
      unique: true,    // Ensure the movieId is unique
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    banner: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    director: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    cast: [
      {
        name: {
          type: String,
          trim: true,
        },
        role: {
          type: String,
          trim: true,
        },
        profile_path: { // Add profile_path field
          type: String,
          trim: true,
        },
      },
    ],
    ratings: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    myScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    categories: {
      type: [String],
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    budget: {
      type: Number,
      required: true,
    },
    originalLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt` fields
  }
);

// Add validation to limit the cast array to 10 members
movieSchema.path('cast').validate(function (value) {
  return value.length <= 10;
}, 'The cast array exceeds the limit of 10 members.');

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;