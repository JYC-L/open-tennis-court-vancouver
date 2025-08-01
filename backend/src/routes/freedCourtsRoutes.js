const express = require("express");
const router = express.Router();
const freedCourtsController = require("../controllers/freedCourtsController");

router.get("/", freedCourtsController.getFreedCourts);

module.exports = router;
