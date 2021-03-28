"use strict";
const express = require("express");
const { query, body } = require("express-validator");
const {
  getMonthlyBalance,
  create,
  edit,
  destroy,
} = require("../controllers/monthly-balance");
const authentication = require("../middlewares/authentication");
const validationError = require("../middlewares/validation-error");
const router = express.Router();

router.use(authentication);
router.delete("/:id", destroy);
router.put(
  "/:id",
  body("actualDate").notEmpty().isDate(),
  body("balance").notEmpty().isInt(),
  validationError,
  edit
);
router.get(
  "/",
  query("offset").optional().isInt(),
  query("limit").optional().isInt(),
  validationError,
  getMonthlyBalance
);

router.post(
  "/",
  body("actualDate").notEmpty().isDate(),
  body("balance").notEmpty().isInt(),
  validationError,
  create
);

module.exports = router;
