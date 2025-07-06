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
    const token = await authService.login(req.body);
    res.json({ success: true, token });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};
