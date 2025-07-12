const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Tidak ada Authorization header
  if (!authHeader) {
    return next(createError(401, "Authorization header missing"));
  }

  const [scheme, token] = authHeader.split(" ");

  // Format harus "Bearer <token>"
  if (scheme !== "Bearer" || !token) {
    return next(createError(400, "Invalid token format. Expected 'Bearer <token>'"));
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ JWT Verified:");
    console.log("Payload:", decoded);

    req.user = decoded; // Simpan payload JWT ke req.user
    next();
  } catch (err) {
    return next(createError(401, "Invalid or expired token"));
  }
};
