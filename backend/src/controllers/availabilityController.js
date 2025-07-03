const AvailabilityManager = require("../services/DataManager");
const manager = new AvailabilityManager(); // No need for DB or orchestrator in mock

exports.getAvailability = async (req, res) => {
  try {
    const { court, start_date, end_date, requested_at } = req.query;

    if (!court || !start_date || !end_date || !requested_at) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters." });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const requestedAt = new Date(requested_at);

    if (isNaN(startDate) || isNaN(endDate) || isNaN(requestedAt)) {
      return res
        .status(400)
        .json({ error: "Invalid date format in query parameters." });
    }

    const results = await manager.getAvailability(
      court,
      start_date.slice(0, 10),
      startDate,
      endDate,
      requestedAt
    );

    res.status(200).json(results);
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
