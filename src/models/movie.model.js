const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Movie schema
const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
      },
    ],
    ratings: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    reviews: [
      {
        reviewer: {
          type: String,
          trim: true,
        },
        comment: {
          type: String,
          trim: true,
        },
        rating: {
          type: Number,
          min: 0,
          max: 10,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt` fields
  }
);

// Create and export the Movie model
module.exports = mongoose.model('Movie', movieSchema);