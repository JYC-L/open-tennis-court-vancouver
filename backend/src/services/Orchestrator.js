import { TennisBcHubScrapper } from './TennisBcHubScrapper/TennisBcHubScrapper.js';
import UbcTennisCenterScrapper from './ubc-scrapper.js';
import { UeTennisScrapper } from './UeTennisCourtScrapper/UeTennisWebScrapper.ts';
import { saveAvailabilityToJSON } from './TennisBcHubScrapper/runScraper.js';

class Orchestrator {
  constructor() {
    this.scrapers = [new TennisBcHubScrapper(), new UbcTennisCenterScrapper(), new UeTennisScrapper()];
  }

  async onDemandUpdate(requestedAt, startDate, endDate) {
    const promises = this.scrapers.map((scraper) =>
      scraper.getCourtBooking()
    );
    let results = await Promise.all(promises);
    results = results.flat();
    saveAvailabilityToJSON(results, "all_availabilities.json");
    this.pushToDB(results);
  }

  async pushToDB(results) {
    console.log("Pushing results to DB...");
    console.log("Pushed to db at ", new Date().toISOString());
  }
}

(async () => {
  const orchestrator = new Orchestrator();
  orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
})();