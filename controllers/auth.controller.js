const authService = require("../services/auth.service");
const dataMasterservice = require("../services/data-master.service");

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
    const { token, user } = await authService.login(req.body);
    res.json({ success: true, token, user });
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

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: false, result });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

exports.changeUsername = async (req, res) => {
  try {
    const result = await authService.changeUsername(req.body);
    res.json({ success: false, result });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

exports.generateResetPassword = async (req, res) => {
  try {
      const { username } = req.body;
      const data = await authService.generateResetCode({ username });
      res.json({ success: true, message: "Reset code generated successfully", data });
  } catch (err) {
      res.status(401).json({ success: false, error: err.message });
  }
};

exports.getActiveResetCodes = async (req, res) => {
    try {
        const data = await authService.getActiveResetCodes();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
