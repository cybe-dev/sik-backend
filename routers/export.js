"use strict";
const express = require("express");
const {
  exportOutcome,
  stream,
  exportIncome,
  exportRecap,
  exportLedger,
} = require("../controllers/export");
const authentication = require("../middlewares/authentication");
const temporaryAuth = require("../middlewares/temporaryAuth");
const router = express.Router();

router.get("/stream/:filename", temporaryAuth, stream);
router.get("/income/:month/:year", authentication, exportIncome);
router.get("/recap/:month/:year", authentication, exportRecap);
router.get("/ledger/:month/:year", authentication, exportLedger);
router.get(
  "/outcome/:month/:year/:classificationId",
  authentication,
  exportOutcome
);

module.exports = router;
