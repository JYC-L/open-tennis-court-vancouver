const AvailabilityManager = require("../services/DataManager");
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoUri);

const dummyOrchestrator = {
  onDemandUpdate: async (requestedAt, startDate, endDate) => {
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
      }
    ];
  }
};

let availabilityManager;
client.connect().then(() => {
  availabilityManager = new AvailabilityManager(client, dummyOrchestrator);
});

const getAvailability = async (req, res) => {
  try {
    const { court, start_date, end_date, requested_at } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({ error: "start_date and end_date are required" });
      return;
    }

    const result = await availabilityManager.getAvailability({
      court,
      startDate: new Date(start_date),
      endDate: new Date(end_date),
      requestedAt: requested_at ? new Date(requested_at) : new Date()
    });

    res.json(result);
  } catch (error) {
    console.error("getAvailability error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = { getAvailability };
