const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors"); 
const { connectToDatabase } = require("./db");
const startRoutes = require("./routes/start.routes");
const { PORT, SECRET_KEY } = require("./config");

const app = express();

app.use(cors());
app.use(morgan("dev"));

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

app.use(express.json());
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