const fs = require("fs");
const path = require("path");
const { findFreedCourts } = require("../services/FreedCourtDetector");
const AvailabilityManager = require("../services/DataManager");

const manager = new AvailabilityManager();

function getFullErrorStack(error) {
  let stack = error.stack || error.toString();
  let current = error;
  while (current.cause) {
    stack += `\nCaused by: ${current.cause.stack || current.cause.toString()}`;
    current = current.cause;
  }
  return stack;
}

exports.getFreedCourts = async (req, res) => {
  try {
    // Get current availability data from DataManager
    // We'll use a broad court filter to get all data
    const allCourts = "all";
    const availabilityResponse = await manager.getAvailability(
      allCourts,
      new Date().toISOString().slice(0, 10), // today's date
      new Date(), // start date
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // end date (7 days from now)
      new Date() // requested at
    );

    // The getAvailability method returns the data directly, not wrapped in a response object
    const currentAvailability = Array.isArray(availabilityResponse)
      ? availabilityResponse
      : availabilityResponse.data || [];

    // Use FreedCourtDetector to find newly available courts
    const freedCourts = findFreedCourts(currentAvailability);

    // Format response
    const response = {
      freed_courts: freedCourts,
      count: freedCourts.length,
      generated_at: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    // Log error
    try {
      const now = new Date();
      const vancouverDate = now.toLocaleDateString("en-CA", {
        timeZone: "America/Vancouver",
      });
      const logDir = path.join(__dirname, "logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `${vancouverDate}.txt`);
      const logMsg = `[${now.toLocaleString("en-CA", {
        timeZone: "America/Vancouver",
      })}] FreedCourts API Error: ${getFullErrorStack(err)}\n`;
      fs.appendFileSync(logFile, logMsg, "utf8");
    } catch (logErr) {
      console.error("Log Write Error:", logErr);
    }

    console.error("FreedCourts Controller Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error while fetching freed courts." });
  }
};
