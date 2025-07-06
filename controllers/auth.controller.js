const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    console.log(req.body);
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: "User registered", user });
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login Dipanggil");
    const token = await authService.login(req.body);
    res.json({ success: true, token });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(401, "Authorization header missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    const user = await authService.verifyToken(token);

    res.json({ success: true, user });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ success: false, error: err.message });
  }
};
