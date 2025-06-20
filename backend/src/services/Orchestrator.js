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

  //TODO: for 12:00 to 24:00, every 30 minutes +- random number < 10 minutes, trigger a onDemandUpdate. Assume the server is running 24/7.
  async scheduledUpdate() {
    const MS_PER_MINUTE = 60 * 1000;
    const MS_PER_30_MIN = 30 * MS_PER_MINUTE;
    const MAX_OFFSET = 10 * MS_PER_MINUTE; // 10 minutes

    const scheduleNext = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12 || hour >= 24) {
        // Not in the scheduling window, calculate ms until next 12:00
        let nextNoon = new Date(now);
        nextNoon.setHours(12, 0, 0, 0);
        if (now >= nextNoon) {
          nextNoon.setDate(nextNoon.getDate() + 1);
        }
        const msUntilNextNoon = nextNoon - now;
        setTimeout(scheduleNext, msUntilNextNoon);
        return;
      }
      // Find next 30-min mark
      const nextHalfHour = new Date(now);
      nextHalfHour.setSeconds(0, 0);
      if (now.getMinutes() < 30) {
        nextHalfHour.setMinutes(30);
      } else {
        nextHalfHour.setMinutes(0);
        nextHalfHour.setHours(nextHalfHour.getHours() + 1);
      }
      // Random offset between -10 and +10 minutes
      const offset = Math.floor(Math.random() * (2 * MAX_OFFSET + 1)) - MAX_OFFSET;
      let msUntilNext = nextHalfHour - now + offset;
      // Ensure we don't schedule outside the window
      const nextRun = new Date(now.getTime() + msUntilNext);
      if (nextRun.getHours() >= 24) {
        // Schedule for next day at 12:00
        let nextNoon = new Date(now);
        nextNoon.setDate(nextNoon.getDate() + 1);
        nextNoon.setHours(12, 0, 0, 0);
        setTimeout(scheduleNext, nextNoon - now);
        return;
      }
      setTimeout(async () => {
        try {
          const requestedAt = new Date();
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          await this.onDemandUpdate(requestedAt, startDate, endDate);
        } catch (err) {
          console.error('Error during scheduled onDemandUpdate:', err);
        }
        scheduleNext();
      }, msUntilNext);
    };
    scheduleNext();
  }

  // (async () => {
  //   const orchestrator = new Orchestrator();
  //   orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
  // })();
}

export { Orchestrator };