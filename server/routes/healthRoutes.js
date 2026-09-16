const express = require("express");

const router = express.Router();

const { healthCheck } = require("../controllers/healthController");

const asyncHandler = require("../middleware/asyncHandler");

router.get("/health", asyncHandler(healthCheck));

module.exports = router;