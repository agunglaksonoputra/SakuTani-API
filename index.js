require("dotenv").config({
  path: process.env.ENV_FILE || ".env",
});
const express = require("express");
const cors = require("cors");
const app = express();

const db = require("./models");
const routes = require("./routes");
const v2Routes = require("./routes/v2");

const allowedOrigins = ["https://dashboard.sakutani.my.id", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );
app.use(express.json());

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: false,
  legacyHeaders: false,
});

app.use("/api", apiLimiter, routes);
app.use("/api/v2", apiLimiter, v2Routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected!");

    // Untuk sync model dengan tabel (opsional)
    // await db.sequelize.sync({ alter: true });

    console.log(`Server running at http://0.0.0.0:${PORT}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
