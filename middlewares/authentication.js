"use strict";
const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    jwt.verify(bearerToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ errors: { type: "Not authorized", data: null } });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res
      .status(401)
      .json({ errors: { type: "Not authorized", data: null } });
  }
};

module.exports = authentication;
