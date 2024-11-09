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
});

// El método pre-guardado, si es necesario, para generar el token puede añadirse aquí

module.exports = mongoose.model('User', userSchema);
