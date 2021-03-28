"use strict";
const express = require("express");
const { body, query } = require("express-validator");
const {
  addIncome,
  getIncome,
  setIncome,
  getOutcome,
  addOutcome,
  destroy,
  setOutcome,
} = require("../controllers/transaction");
const authentication = require("../middlewares/authentication");
const validationError = require("../middlewares/validation-error");
const router = express.Router();

router.use(authentication);

router.delete("/:id", destroy);

router.put(
  "/outcome/:id",
  body("actualDate").notEmpty().isDate(),
  body("note").notEmpty(),
  body("amount").notEmpty().isInt(),
  body("classificationId").notEmpty().isInt(),
  validationError,
  setOutcome
);

router.put(
  "/income/:id",
  body("actualDate").notEmpty().isDate(),
  body("note").notEmpty(),
  body("amount").notEmpty().isInt(),
  validationError,
  setIncome
);

router.get(
  "/outcome",
  query("month").isInt(),
  query("year").isInt(),
  query("classificationId").isInt().optional(),
  query("limit").isInt(),
  query("offset").isInt(),
  validationError,
  getOutcome
);

router.get(
  "/income",
  query("month").isInt(),
  query("year").isInt(),
  query("limit").isInt(),
  query("offset").isInt(),
  validationError,
  getIncome
);

router.post(
  "/outcome",
  body("actualDate").notEmpty().isDate(),
  body("note").notEmpty(),
  body("amount").notEmpty().isInt(),
  body("classificationId").notEmpty().isInt(),
  validationError,
  addOutcome
);

router.post(
  "/income",
  body("actualDate").notEmpty().isDate(),
  body("note").notEmpty(),
  body("amount").notEmpty().isInt(),
  validationError,
  addIncome
);

module.exports = router;
