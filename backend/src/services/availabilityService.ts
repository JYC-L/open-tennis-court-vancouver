import { connectToDatabase } from './mongoClient';

interface Query {
  clubName?: string;
  startDate: string;
  endDate: string;
}

interface CourtAvailability {
  clubName: string;
  courtNumber: string;
  date: string;
  startHour: string;
  startTime: string;
  endTime: string;
  status: string;
  courtBookingLink: string;
}

export const fetchAvailability = async (query: Query): Promise<CourtAvailability[]> => {
  const db = await connectToDatabase();
  const collection = db.collection('court_availability');

  // Build MongoDB filter
  const filter: any = {
    date: {
      $gte: query.startDate,
      $lte: query.endDate
    }
  };

  if (query.clubName) {
    filter.clubName = { $regex: query.clubName, $options: 'i' }; // case-insensitive partial match
  }

  const results = await collection.find(filter).toArray();

  // Sort results by date and courtNumber
  results.sort((a, b) => {
    if (a.date === b.date) {
      return a.courtNumber.localeCompare(b.courtNumber);
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return results.map(doc => ({
    clubName: doc.clubName,
    courtNumber: doc.courtNumber,
    date: doc.date,
    startHour: doc.startHour,
    startTime: doc.startTime,
    endTime: doc.endTime,
    status: doc.status,
    courtBookingLink: doc.courtBookingLink
  }));
};
