const fs = require("fs");
const path = require("path");
const AvailabilityManager = require("../services/DataManager");
const manager = new AvailabilityManager(); // No need for DB or orchestrator in mock

function getFullErrorStack(error) {
  let stack = error.stack || error.toString();
  let current = error;
  while (current.cause) {
    stack += `\nCaused by: ${current.cause.stack || current.cause.toString()}`;
    current = current.cause;
  }
  return stack;
}

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
    try {
      const now = new Date();
      const vancouverDate = now.toLocaleDateString("en-CA", {
        timeZone: "America/Vancouver",
      });
      const logDir = path.join(__dirname, "../../logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `${vancouverDate}.txt`);
      const logMsg = `[${now.toLocaleString("en-CA", {
        timeZone: "America/Vancouver",
      })}] ${getFullErrorStack(err)}\n`;
      fs.appendFileSync(logFile, logMsg, "utf8");
    } catch (logErr) {
      console.error("Log Write Error:", logErr);
    }
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
