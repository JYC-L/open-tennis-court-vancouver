import { Request, Response } from 'express';
import { fetchAvailability } from '../services/availabilityService';

export const getCourtAvailability = async (req: Request, res: Response) => {
  try {
    const { clubName, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const data = await fetchAvailability({
      clubName: clubName as string,
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({ courts: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
