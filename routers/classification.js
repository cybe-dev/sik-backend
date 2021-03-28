"use strict";
const express = require("express");
const { body } = require("express-validator");
const {
  create,
  getAll,
  edit,
  destroy,
} = require("../controllers/classification");
const authentication = require("../middlewares/authentication");
const validationError = require("../middlewares/validation-error");
const router = express.Router();

router.use(authentication);

router.delete("/:id", destroy);
router.put(
  "/:id",
  body("code").notEmpty(),
  body("name").notEmpty(),
  validationError,
  edit
);
router.get("/", getAll);
router.post(
  "/",
  body("code").notEmpty(),
  body("name").notEmpty(),
  validationError,
  create
);

module.exports = router;
