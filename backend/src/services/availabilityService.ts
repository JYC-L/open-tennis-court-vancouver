// import { connectToDatabase } from "./mongoClient";

// interface Query {
//   court?: string;
//   startDate: string;
//   endDate: string;
//   requestedAt?: string;
// }

// export const fetchAvailability = async (query: Query) => {
//   const db = await connectToDatabase();
//   const collection = db.collection("court_availability");

//   const filter: any = {
//     date: {
//       $gte: query.startDate,
//       $lte: query.endDate,
//     },
//   };

//   if (query.court) {
//     filter.courtNumber = { $regex: query.court, $options: "i" };
//   }

//   const results = await collection.find(filter).toArray();

//   // Optional freshness check
//   if (query.requestedAt) {
//     console.log(`Requested at: ${query.requestedAt}`);
//     // Optionally add metadata or freshness logic here
//   }

//   return results.map((doc) => ({
//     clubName: doc.clubName,
//     courtNumber: doc.courtNumber,
//     date: doc.date,
//     startHour: doc.startHour,
//     startTime: doc.startTime,
//     endTime: doc.endTime,
//     status: doc.status,
//     courtBookingLink: doc.courtBookingLink,
//   }));
// };


interface Query {
  court?: string;
  startDate: string;
  endDate: string;
  requestedAt?: string;
}

export const fetchAvailability = async (query: Query) => {
  // MOCK DATA — ignore DB and return static results
  console.log("Mocking fetchAvailability with query:", query);

  return [
    {
      clubName: "UBC Tennis Center",
      courtNumber: "UBC-Court-1",
      date: "2025-06-20",
      startHour: "08:00 AM",
      startTime: "08:00 AM",
      endTime: "09:00 AM",
      status: "Bookable",
      courtBookingLink: "https://example.com/ubc-court-1"
    },
    {
      clubName: "UBC Tennis Center",
      courtNumber: "UBC-Court-1",
      date: "2025-06-20",
      startHour: "09:00 AM",
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      status: "Booked",
      courtBookingLink: "https://example.com/ubc-court-1"
    }
  ];
};
