const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(createError(401, "Authorization header missing"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(createError(400, "Invalid token format. Expected 'Bearer <token>'"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(createError(401, "Invalid or expired token"));
  }
};
