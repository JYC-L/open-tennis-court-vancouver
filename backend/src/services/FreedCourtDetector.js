const { parse } = require("csv-parse/sync");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "TennisBcHubScrapper", "bookings.csv");

function parseBookingsCSV(csvFilePath = filePath) {
  try {
    // Read file synchronously
    const data = fs.readFileSync(csvFilePath, "utf8");

    // Parse CSV synchronously
    const records = parse(data, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Parsed ${records.length} booking records`);
    return records; // This is your list of objects!
  } catch (error) {
    console.error("Error reading or parsing CSV file:", error);
    throw error;
  }
}

function findFreedCourts(new_results) {
  try {
    // Parse existing CSV data
    const existing_bookings = parseBookingsCSV();

    // Create a Set of all existing court+time combinations
    const existingSlots = new Set();
    let latestDateTime = null;

    existing_bookings.forEach((booking) => {
      const key = `${booking.clubName}|${booking.courtNumber}|${booking.date}|${booking.startTime}`;
      existingSlots.add(key);

      // Track the latest date+time in old data
      const dateTime = new Date(`${booking.date} ${booking.startTime}`);
      if (!latestDateTime || dateTime > latestDateTime) {
        latestDateTime = dateTime;
      }
    });

    console.log(`Latest date+time in old data: ${latestDateTime}`);

    const freedCourts = [];

    // Check each new result
    new_results.forEach((newBooking) => {
      // Skip bookings with missing required fields
      if (
        !newBooking.clubName ||
        !newBooking.courtNumber ||
        !newBooking.date ||
        !newBooking.startTime ||
        !newBooking.bookable
      ) {
        return; // Skip this booking
      }

      const key = `${newBooking.clubName}|${newBooking.courtNumber}|${newBooking.date}|${newBooking.startTime}`;
      const newDateTime = new Date(
        `${newBooking.date} ${newBooking.startTime}`
      );

      // If slot is NOT in old data AND date+time is before latest old time AND bookable is '0'
      if (
        !existingSlots.has(key) &&
        newDateTime <= latestDateTime &&
        newBooking.bookable === "0"
      ) {
        freedCourts.push(newBooking);
      }
    });

    console.log(`Found ${freedCourts.length} newly available court slots`);

    return freedCourts;
  } catch (error) {
    console.error("Error finding freed courts:", error);
    throw error;
  }
}

module.exports = { findFreedCourts };
