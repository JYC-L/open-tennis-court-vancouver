const fs = require("fs");

function saveBookingsToCSV(bookings, filePath = "bookings.csv") {
  // Define the CSV headers (order must match booking object keys)
  const headers = [
    "clubName",
    "courtNumber",
    "date",
    "startHour",
    "startTime",
    "endTime",
    "bookable",
    "courtBookingLink",
    "location"
  ];
  // Create header line
  const headerLine = headers.join(",") + "\n";

  // Map each booking to a CSV row (values are escaped)
  const rows = bookings.map(booking => {
    return headers
      .map(field => {
        const value = booking[field] != null ? booking[field] : "";
        // Escape double quotes by replacing with two double quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",");
  }).join("\n");

  // Write the CSV content to file (synchronously)
  fs.writeFileSync(filePath, headerLine + rows, "utf8");
  console.log(`Bookings saved to ${filePath}`);
}

module.exports = { saveBookingsToCSV };