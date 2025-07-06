const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const createError = require("http-errors");

exports.register = async ({ username, password, validationCode }) => {
  // Validasi kode
  if (validationCode !== process.env.VALIDATION_CODE) {
    throw createError(403, "Invalid validation code");
  }

  // Validasi username
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw createError(400, "Username must be 3–20 characters, only letters, numbers, and underscores");
  }

  // Validasi password
  if (!password || password.length < 6) {
    throw createError(400, "Password must be at least 6 characters long");
  }

  // Cek username sudah ada atau belum
  const existing = await User.findOne({ where: { username } });
  if (existing) throw createError(409, "Username already exists");

  // Hash password dan buat user
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed });

  return { id: user.id, username: user.username };
};

exports.login = async ({ username, password }) => {
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return token;
};

exports.verifyToken = async (token) => {
  try {
    // Verifikasi token menggunakan JWT_SECRET
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user berdasarkan payload id
    const user = await User.findByPk(payload.id);

    if (!user) {
      throw createError(404, "User not found");
    }

    // Berhasil: kembalikan info user
    return {
      id: user.id,
      username: user.username,
    };
  } catch (err) {
    throw createError(401, "Unauthorized: Invalid or expired token");
  }
};
