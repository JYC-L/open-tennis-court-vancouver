import { TennisBcHubScrapper } from "./TennisBcHubScrapper.js";
import { saveBookingsToCSV } from "./saveBookingsToCSV.js";

async function run() {
  const scraper = new TennisBcHubScrapper();
  try {
    const availabilities = await scraper.getCourtBooking();
    console.log("Total availabilities scraped:", availabilities.length);
    saveBookingsToCSV(availabilities, "availabilities.csv");
  } catch (error) {
    console.error("Error scraping availabilities:", error);
  }
}availabilities

run();