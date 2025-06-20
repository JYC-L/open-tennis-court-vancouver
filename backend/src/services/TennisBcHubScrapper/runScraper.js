import { TennisBcHubScrapper } from "./TennisBcHubScrapper.js";
import { saveBookingsToCSV } from "./saveBookingsToCSV.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file's directory (works with ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function saveAvailabilityToJSON(availability, filename = "availability.json") {
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

run();