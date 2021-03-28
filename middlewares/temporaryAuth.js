"use strict";
const jwt = require("jsonwebtoken");

const temporaryAuth = (req, res, next) => {
  const { token } = req.query;

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ errors: { type: "Not authorized", data: null } });
    } else {
      next();
    }
  });
};

module.exports = temporaryAuth;
