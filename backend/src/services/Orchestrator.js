import { TennisBcHubScrapper } from './TennisBcHubScrapper/TennisBcHubScrapper.js';
import UbcTennisCenterScrapper from './ubc-scrapper.js';
import { UeTennisScrapper } from './UeTennisCourtScrapper/UeTennisWebScrapper.ts';

class Orchestrator {
  constructor() {
    this.scrapers = [new TennisBcHubScrapper(), new UbcTennisCenterScrapper(), new UeTennisScrapper()];
  }

  async onDemandUpdate(requestedAt, startDate, endDate) {
    const promises = this.scrapers.map((scraper) =>
      scraper.getCourtBooking()
    );
    const results = await Promise.all(promises);
    results = results.flat();
    return results;
  }
}

(async () => {
  const orchestrator = new Orchestrator();
  const results = await orchestrator.onDemandUpdate();
  console.log(results);
})();