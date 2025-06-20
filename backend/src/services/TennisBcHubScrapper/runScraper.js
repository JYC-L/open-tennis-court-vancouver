const { TennisBcHubScrapper } = require("./TennisBcHubScrapper.js");
const { saveBookingsToCSV } = require("./saveBookingsToCSV.js");
const fs = require("fs");
const path = require("path");

function saveAvailabilityToJSON(availability, filename = "availability.json") {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(availability, null, 2), "utf8");
  console.log(`Availability saved to ${filePath}`);
}

async function run() {
  const scraper = new TennisBcHubScrapper();
  try {
    const availabilities = await scraper.getCourtBooking();
    console.log("Total availabilities scraped:", availabilities.length);
    saveBookingsToCSV(availabilities, "availabilities.csv");
    saveAvailabilityToJSON(availabilities);
  } catch (error) {
    console.error("Error scraping availabilities:", error);
  }
}

// run();

module.exports = { saveAvailabilityToJSON };