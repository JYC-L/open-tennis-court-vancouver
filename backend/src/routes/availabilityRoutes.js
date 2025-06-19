const express = require("express");
const { getAvailability } = require("../controllers/availabilityController");

const setAvailabilityRoutes = (app) => {
  const router = express.Router();
  router.get("/", getAvailability);
  app.use("/api/availability", router);
};

module.exports = { setAvailabilityRoutes };
