import { Express, Router } from "express";
import { getAvailability } from "../controllers/availabilityController";

export const setAvailabilityRoutes = (app: Express) => {
  const router = Router();

  router.get("/", getAvailability); // Handles GET /api/availability

  app.use("/api/availability", router);
};
