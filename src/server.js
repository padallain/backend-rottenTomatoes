import express from "express";
import session from "express-session";
import morgan from "morgan";
import cors from "cors";
import { connectToDatabase } from "./db.js";
import startRoutes from "./routes/start.routes.js";
import { PORT, SECRET_KEY } from "./config.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json()); // Ensure this line is present to parse JSON request bodies

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use("/", startRoutes);

connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });