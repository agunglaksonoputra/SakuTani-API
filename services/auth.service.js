const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.register = async ({ username, password }) => {
  const existing = await User.findOne({ where: { username } });
  if (existing) throw new Error("Username already exists");

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
