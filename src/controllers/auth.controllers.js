import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'; 
import nodemailer from "nodemailer";
import crypto from 'crypto';
import e from "express";

const userGmail = "padallain2000@gmail.com"
const passwordGmail = "ywun mzua oxyw swlo"

const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio que uses
  auth: {
    user: userGmail, // Tu correo
    pass: passwordGmail    // Contraseña o App Password
  },
  logger: true,  // Habilitar el registro de errores
  debug: true    // Habilitar modo de depuración
});


export const register = async (req, res) => {
  try {
    const { email_user, password, username } = req.body;

    // Verificar que los campos requeridos estén presentes
    if (!email_user || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validación del formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_user)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const passwordRegex = /^.{8,}$/; // At least 8 characters
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Verificar si el usuario o el correo ya existen en la base de datos
    const existingEmail = await User.findOne({ email_user });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Crear un nuevo usuario
    const newUser = new User({
      username,
      email_user,
      password_user: password,
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log("Error en el registro:", err);
    res.status(500).json({ message: 'Error registering user' });
  }
};


export const createLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Use 'identifier' to accept either username or email
    console.log(identifier, password);

    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email_user: identifier }],
    });
    console.log(user);

    if (user) {
      // Compare the password (assuming it's not hashed)
      if (password === user.password_user) {
        // Log in and store information in the session
        req.session.isLoggedIn = true;
        req.session.username = user.email_user;

        const sessionId = req.session.id;
        const personId = user._id;
        console.log(`All good and your sessionId is ${sessionId}`);

        res.status(200).json({
          success: true,
          message: "Login successful",
          personId,
        });
        return;
      }
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    console.error('Error creating login:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



console.log("mi rey")



export const resetPassword = async (req, res) => {
  const { email_user } = req.body;

  // Verificar si el correo fue proporcionado
  if (!email_user) {
    return res.status(400).json({ message: 'El correo electrónico es obligatorio.' });
  }

  try {
    // Buscar al usuario por su correo electrónico
    const user = await User.findOne({ email_user });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Generar un código aleatorio de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Establecer el tiempo de expiración a 10 minutos desde ahora
    const expiresIn = new Date();
    expiresIn.setMinutes(expiresIn.getMinutes() + 10);

    // Guardar el código de restablecimiento en el campo "token" y la expiración en "resetTokenExpires"
    user.token = resetCode;
    user.resetTokenExpires = expiresIn;

    // Guardar el usuario con el nuevo token y la fecha de expiración
    await user.save();

    // Configurar las opciones para el correo electrónico
    const mailOptions = {
      from: 'tuemail@gmail.com', // Tu correo
      to: email_user,            // Correo del destinatario
      subject: 'Restablecimiento de contraseña',
      text: `Hola ${user.username},\n\nTu código de restablecimiento de contraseña es: ${resetCode}. Este código es válido por 10 minutos.\n\nSaludos,\nTu equipo`
    };

    // Enviar el correo con el token
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ message: 'Error al enviar el correo.' });
      } else {
        console.log('Correo enviado: ' + info.response);
        return res.status(200).json({ message: 'Correo de restablecimiento enviado exitosamente.', resetCode });
      }
    });

  } catch (err) {
    console.error('Error en la solicitud de restablecimiento de contraseña:', err);
    return res.status(500).json({ message: 'Error en la solicitud de restablecimiento de contraseña.' });
  }
};


export const checkResetToken = async (req, res) => {
  const { email_user, resetCode } = req.body;
  console.log(req.body)
  console.log(email_user, resetCode)

  try {
    // Buscar al usuario por su correo electrónico
    const user = await User.findOne({ email_user });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar si el código es correcto y si no ha expirado
    if (user.token !== resetCode || new Date() > user.resetTokenExpires) {
      return res.status(400).json({ message: 'Código inválido o ha expirado.' });
    }

    // Si todo es correcto, enviar un mensaje de éxito
    return res.status(200).json({ message: 'El código es válido. Puedes restablecer la contraseña.' });

  } catch (err) {
    console.error('Error verificando el código:', err);
    return res.status(500).json({ message: 'Error verificando el código.' });
  }
};



export const savePassword = async (req, res) => {
  const { email_user, newPassword, confirmPassword } = req.body;

  console.log(req.body)

  // Verificar si las contraseñas coinciden
  if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
  }

  // Validación de la contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.^#])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character' });
  }

  try {
     
      // Actualizar la contraseña del usuario en la base de datos
      const user = await User.findOneAndUpdate(
          { email_user },
          { password_user:newPassword },
          { new: true }
      );

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
      console.error('Error updating password:', err);
      res.status(500).json({ message: 'Server error' });
  }
};

// Get email and username by user ID
export const getUserInfoById = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  try {
    const user = await User.findById(userId, 'email_user username'); // Select only email_user and username fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ email: user.email_user, username: user.username });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Error fetching user info", error: error.message });
  }
};


export const eraseAccount = async (req, res) => {
  const { username } = req.body;

  try {
      const result = await User.findOneAndDelete({username});
      if (result) {
          res.status(200).json({ message: `User with email ${username} deleted successfully.` });
      } else {
          res.status(404).json({ message: `User with email ${username} not found.` });
      }
  } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};


export const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error('Error logging out:', err);
    res.status(500).json({ message: "Server error" });
  }
}
