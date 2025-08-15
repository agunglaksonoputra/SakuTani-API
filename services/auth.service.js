const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User, Role, PasswordResetCode } = require("../models");
const createError = require("http-errors");
const { Op } = require("sequelize");

exports.register = async ({ username, password, validationCode, role_id }) => {
  if (validationCode !== process.env.VALIDATION_CODE) {
    throw createError(403, "Invalid validation code");
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw createError(400, "Username must be 3–20 characters, only letters, numbers, and underscores");
  }

  if (!password || password.length < 6) {
    throw createError(400, "Password must be at least 6 characters long");
  }

  const existing = await User.findOne({ where: { username } });
  if (existing) throw createError(409, "Username already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed,
    ...(role_id && { role_id }),
  });

  return { id: user.id, username: user.username, role_id: user.role_id };
};

exports.login = async ({ username, password }) => {
  const user = await User.findOne({
    where: { username },
    include: {
      model: Role,
      as: "role",
      attributes: ["name"],
    },
  });

  if (!user) {
    throw createError(401, "Invalid username or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(401, "Invalid username or password");
  }

  if (!user.role) {
    throw createError(403, "User does not have a valid role.");
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role.name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    token,
    user: payload,
  };
};

exports.verifyToken = async (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    throw createError(401, "Unauthorized: Invalid or expired token");
  }
};

exports.resetPassword = async ({ username, validationCode, newPassword }) => {
    // Cek user
    const user = await User.findOne({ where: { username } });
    if (!user) {
        throw createError(404, "User not found");
    }

    // Cek kode reset
    const codeEntry = await PasswordResetCode.findOne({ where: { username, code: validationCode } });
    if (!codeEntry) {
        throw createError(403, "Invalid or expired validation code");
    }

    // Cek masa berlaku kode
    if (codeEntry.expiresAt < new Date()) {
        // Jika sudah kadaluarsa, hapus dari DB
        await codeEntry.destroy();
        throw createError(403, "Validation code has expired");
    }

    // Validasi password baru
    if (!newPassword || newPassword.length < 6) {
        throw createError(400, "New password must be at least 6 characters long");
    }

    // Hash password baru
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password user
    await user.update({ password: hashed });

    // Hapus kode reset setelah dipakai
    await codeEntry.destroy();

    return { message: "Password successfully updated" };
};

exports.changeUsername = async ({ currentUsername, newUsername }) => {
  const user = await User.findOne({ where: { username: currentUsername } });

  if (!user) {
    throw createError(404, "User not found");
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(newUsername)) {
    throw createError(400, "New username must be 3–20 characters, only letters, numbers, and underscores");
  }

  const existing = await User.findOne({ where: { username: newUsername } });
  if (existing) {
    throw createError(409, "Username is already taken");
  }

  await user.update({ username: newUsername });

  return { message: "Username successfully updated", newUsername };
};

exports.generateResetCode = async ({ username }) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
        throw createError(404, "User not found");
    }

    // Generate kode acak (8 karakter alfanumerik)
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Hapus kode lama untuk user ini (jika ada)
    await PasswordResetCode.destroy({ where: { username } });

    // Set masa berlaku 15 menit dari sekarang
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordResetCode.create({
        username,
        code,
        expiresAt,
    });

    return {
        username,
        code,
        expiresAt,
    };
};

exports.getActiveResetCodes = async () => {
    const now = new Date();

    // Hapus semua kode yang sudah expired
    await PasswordResetCode.destroy({
        where: {
            expiresAt: { [Op.lte]: now }
        }
    });

    // Ambil semua kode yang belum expired
    const codes = await PasswordResetCode.findAll({
        where: {
            expiresAt: { [Op.gt]: now }
        },
        attributes: ["username", "code", "expiresAt"]
    });

    return codes;
};

