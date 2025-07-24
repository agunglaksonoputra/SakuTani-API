require("dotenv").config({
  path: process.env.ENV_FILE || ".env",
});
const express = require("express");
const cors = require("cors");
const app = express();

const db = require("./models");
const routes = require("./routes");
const v2Routes = require("./routes/v2");

const allowedOrigins = ["http://localhost:5173", "https://dashboard.sakutani.my.id"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or mobile app)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", routes);
app.use("/api/v2", v2Routes);

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
