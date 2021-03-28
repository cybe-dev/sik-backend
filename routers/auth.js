"use strict";
const express = require("express");
const { query, body } = require("express-validator");
const { getToken, changePassword } = require("../controllers/auth");
const authentication = require("../middlewares/authentication");
const validationError = require("../middlewares/validation-error");
const router = express.Router();

router.put(
  "/change-password",
  authentication,
  body("oldPassword").notEmpty(),
  body("newPassword").notEmpty(),
  validationError,
  changePassword
);

router.get(
  "/get-token",
  query("username").notEmpty(),
  query("password").notEmpty(),
  validationError,
  getToken
);

module.exports = router;
