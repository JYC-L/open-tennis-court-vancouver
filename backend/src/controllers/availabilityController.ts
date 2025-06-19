import { Request, Response } from "express";
import { fetchAvailability } from "../services/availabilityService";

export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { court, start_date, end_date, requested_at } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({ error: "start_date and end_date are required" });
      return;
    }

    const data = await fetchAvailability({
      court: court as string,
      startDate: start_date as string,
      endDate: end_date as string,
      requestedAt: requested_at as string
    });

    res.json({ data });
  } catch (error) {
    console.error("Error in getAvailability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
