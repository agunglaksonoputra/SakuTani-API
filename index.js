// require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const db = require("./models");
const routes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const auth = require("./middlewares/auth.middleware");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", auth, routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected!");

    // Untuk sync model dengan tabel (opsional)
    // await db.sequelize.sync({ alter: true });

    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
});
