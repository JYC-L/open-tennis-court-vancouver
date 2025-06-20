import { TennisBcHubScrapper } from './TennisBcHubScrapper/TennisBcHubScrapper.js';
import UbcTennisCenterScrapper from './ubc-scrapper.js';
import { UeTennisScrapper } from './UeTennisCourtScrapper/UeTennisWebScrapper.ts';
import { saveAvailabilityToJSON } from './TennisBcHubScrapper/runScraper.js';
import { CourtScheduleRepository } from '../db/CourtScheduleRepository.js';

class Orchestrator {
  constructor() {
    this.scrapers = [new TennisBcHubScrapper(), new UbcTennisCenterScrapper(), new UeTennisScrapper()];
    this.courtScheduleRepository = new CourtScheduleRepository();
  }

  async onDemandUpdate(requestedAt, startDate, endDate) {
    // console.log("Running onDemandUpdate...");
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // console.log("Getting availabilty for Tennis BC Courts..");
    // await new Promise(resolve => setTimeout(resolve, 3000));
    // console.log("Getting availabilty for UE Courts..");
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // console.log("Getting availabilty for UBC Courts..");
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // console.log("pushing data to db...");
    // console.log("Writing availability to all_availabilities.json");
    // return;
    const promises = this.scrapers.map((scraper) =>
      scraper.getCourtBooking()
    );
    let results = await Promise.all(promises);
    results = results.flat();
    saveAvailabilityToJSON(results, "all_availabilities.json");
    await this.pushToDB(results);
  }

  async pushToDB(results) {
    try {
      await this.courtScheduleRepository.saveAllAvailability(results);
      console.log("Pushed results to DB at ", new Date().toISOString());
    } catch (err) {
      console.error("Error pushing results to DB:", err);
    }
  }

  // Schedules onDemandUpdate every intervalSeconds (±offsetSeconds) between 00:00 and 00:00 the next day (full 24 hours).
  // intervalSeconds and offsetSeconds are in seconds. Defaults: 1800s (30min), 600s (10min)
  async scheduledUpdate(intervalSeconds = 1800, offsetSeconds = 600, onUpdateCallback) {
    const MS_PER_SECOND = 1000;
    const INTERVAL = intervalSeconds * MS_PER_SECOND;
    const MAX_OFFSET = offsetSeconds * MS_PER_SECOND;

    const scheduleNext = () => {
      console.log("Scheduling next update...");
      const now = new Date();
      // Calculate the next run time
      const offset = Math.floor(Math.random() * (2 * MAX_OFFSET + 1)) - MAX_OFFSET;
      let msUntilNext = INTERVAL + offset;

      // If this would cross into the next day, schedule for midnight
      const nextRun = new Date(now.getTime() + msUntilNext);
      if (nextRun.getDate() !== now.getDate()) {
        let nextMidnight = new Date(now);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);
        msUntilNext = nextMidnight - now;
      }

      setTimeout(async () => {
        try {
          const requestedAt = new Date();
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          console.log("Running onDemandUpdate...");
          await this.onDemandUpdate(requestedAt, startDate, endDate);
          if (onUpdateCallback) onUpdateCallback(new Date());
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