import dotenv from 'dotenv';
dotenv.config();

export const DB_URI = process.env.DB_URI;
export const PORT = process.env.PORT || 8000;
export const SECRET_KEY = process.env.SECRET_KEY;

const mongoose = require('mongoose');

 export const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};


