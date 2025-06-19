import { Express, Router } from "express";
import { getCourtAvailability } from "../controllers/courtController";

export const setCourtRoutes = (app: Express) => {
  const router = Router();

  router.get("/availability", getCourtAvailability);

  app.use("/courts", router); // final route = /courts/availability
};
