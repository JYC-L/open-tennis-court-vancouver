const {
  TennisBcHubScrapper,
} = require("./TennisBcHubScrapper/TennisBcHubScrapper.js");
const UbcTennisCenterScrapper = require("./UBCScrapper/ubc-scrapper.js");
const {
  UeTennisScrapper,
} = require("../../dist/services/UeTennisCourtScrapper/UeTennisWebScrapper");
const {
  saveAvailabilityToJSON,
} = require("./TennisBcHubScrapper/runScraper.js");
const {
  CourtScheduleRepository,
} = require("../../dist/db/CourtScheduleRepository");
const { saveBookingsToCSV } = require("./TennisBcHubScrapper/saveBookingsToCSV.js");
const { error } = require("console");
const fs = require("fs");
const path = require("path");

class Orchestrator {
  constructor(autoSchedule = true) {
    try {
      this.scrapers = [
        new UeTennisScrapper(),
        new TennisBcHubScrapper(),
        new UbcTennisCenterScrapper(),
      ];
      this.courtScheduleRepository = new CourtScheduleRepository();
      this.lastUpdated = null;
      this.records = null;
      this.scheduledTimeoutID = null;
    } catch (error) {
      throw new Error(
        "Orchestrator.constructor: Error when initializing fields in the orchestrator;",
        { cause: error }
      );
    }
    if (autoSchedule) {
      this.scheduledUpdate();
    }
  }

  async onDemandUpdate(requestedAt, startDate, endDate) {
    const now = new Date();
    const vancouverDate = now.toLocaleDateString("en-CA", {
      timeZone: "America/Vancouver",
    });
    const logDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, `${vancouverDate}.txt`);

    try {
      const logMsg = `[${now.toLocaleString("en-CA", {
        timeZone: "America/Vancouver",
      })}] Orchestrator.onDemandUpdate Started.\n`;
      fs.appendFileSync(logFile, logMsg, "utf8");
    } catch (logErr) {
      console.error("Log Write Error:", logErr);
    }

    const promiseStart = Date.now();
    const promises = this.scrapers.map((scraper) =>
      scraper.getCourtBooking().catch((error) => {
        console.error("Orchestrator.onDemandUpdate: a scraper failed;", error);
        return null;
      })
    );
    let results = await Promise.all(promises);
    console.log(`all promise resolved in ${Date.now() - promiseStart} ms.`);
    results = results.filter(Boolean).flat();
    try {
      await this.pushDataToDBandLoadFromDB(results);
    } catch (e) {
      throw new Error(
        "Orchestrator.onDemandUpdate: Error in orchestrator on demand update push step;",
        { cause: e }
      );
    }
    return results;
  }

  async pushDataToDBandLoadFromDB(results) {
    try {
      const databaseUpdateStart = Date.now();
      console.log("Pushing to database...");
      // saveAvailabilityToJSON(results, "all_availabilities.json");
      await this.courtScheduleRepository.saveAvailabilityByArr(results);
      console.log(`Pushing data took ${Date.now() - databaseUpdateStart} ms.`);
      this.lastUpdated = await this.courtScheduleRepository.getUTCDateLastUpdated();
      this.records =
        await this.courtScheduleRepository.getAllAvailabilityAsArr();
      console.log(
        "Pushed results to DB at ",
        this.lastUpdated.toLocaleString("en-US", {
          timeZone: "America/Vancouver",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
      saveBookingsToCSV(results);
    } catch (err) {
      throw new Error("Orchestrator.saveData: Error saving data;", {
        cause: err,
      });
    }
  }

  // Schedules onDemandUpdate at minutes 01 and 45 of each hour in Pacific Time
  async scheduledUpdate(onUpdateCallback) {
    const scheduleNext = () => {
      const now = new Date();

      // Get current hour and minute in Pacific timezone
      const pacificTimeString = now.toLocaleString("en-US", {
        timeZone: "America/Vancouver",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const [pacificHour, pacificMinute] = pacificTimeString
        .split(":")
        .map(Number);

      // Check if we're outside the allowed window (5:45 AM to 10:01 PM PST)
      const isOutsideWindow =
        pacificHour < 5 ||
        (pacificHour === 5 && pacificMinute < 45) ||
        pacificHour > 22 ||
        (pacificHour === 22 && pacificMinute > 1);

      if (isOutsideWindow) {
        // Schedule for 5:45 AM PST (next day if needed)
        let minutesUntil545AM;
        if (pacificHour < 5 || (pacificHour === 5 && pacificMinute < 45)) {
          // Today at 5:45 AM
          minutesUntil545AM = 5 * 60 + 45 - (pacificHour * 60 + pacificMinute);
        } else {
          // Tomorrow at 5:45 AM
          minutesUntil545AM =
            24 * 60 - (pacificHour * 60 + pacificMinute) + (5 * 60 + 45);
        }

        const msUntilNext = minutesUntil545AM * 60 * 1000;
        console.log(
          `Outside operating window (5:45-22:01 PST). Scheduling for 5:45 AM PST in ${minutesUntil545AM} minutes`
        );

        this.scheduledTimeoutID = setTimeout(async () => {
          try {
            const requestedAt = new Date();
            const startDate = new Date();
            const endDate = new Date(
              startDate.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            console.log("Running scheduled onDemandUpdate...");
            await this.onDemandUpdate(requestedAt, startDate, endDate);
            if (onUpdateCallback) onUpdateCallback(new Date());
          } catch (err) {
            console.error(
              "Orchestrator.scheduledUpdate.scheduleNext: Error during onDemandUpdate, outside operating window;"
            );
            console.error(err);
          }
          scheduleNext(); // Schedule the next update
        }, msUntilNext);
        return;
      }

      // Calculate minutes until next target (01 or 45) within operating window
      let minutesUntilNext;
      if (pacificMinute < 1) {
        minutesUntilNext = 1 - pacificMinute;
      } else if (pacificMinute < 45) {
        minutesUntilNext = 45 - pacificMinute;
      } else {
        // Check if next hour (at minute 1) would still be in window
        const nextHour = pacificHour + 1;
        if (nextHour > 22) {
          // Next update would be outside window, schedule for 5:45 AM tomorrow
          minutesUntilNext =
            24 * 60 - (pacificHour * 60 + pacificMinute) + (5 * 60 + 45);
          console.log(
            `Next update would be outside window. Scheduling for 5:45 AM PST tomorrow in ${minutesUntilNext} minutes`
          );
        } else {
          minutesUntilNext = 60 - pacificMinute + 1; // Next hour at minute 1
        }
      }

      const msUntilNext = minutesUntilNext * 60 * 1000;

      console.log(
        `Current Pacific minute: ${pacificMinute}, scheduling update in ${minutesUntilNext} minutes (${Math.round(
          msUntilNext / 1000
        )} seconds)`
      );

      this.scheduledTimeoutID = setTimeout(async () => {
        try {
          const requestedAt = new Date();
          const startDate = new Date();
          const endDate = new Date(
            startDate.getTime() + 7 * 24 * 60 * 60 * 1000
          );

          const now = new Date();
          const vancouverDate = now.toLocaleDateString("en-CA", {
            timeZone: "America/Vancouver",
          });
          const logDir = path.join(__dirname, "logs");
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }
          const logFile = path.join(logDir, `${vancouverDate}.txt`);

          try {
            const logMsg = `[${now.toLocaleString("en-CA", {
              timeZone: "America/Vancouver",
            })}] Scheduled Orchestrator.onDemandUpdate Started.\n`;
            fs.appendFileSync(logFile, logMsg, "utf8");
          } catch (logErr) {
            console.error("Log Write Error:", logErr);
          }

          console.log("Running scheduled onDemandUpdate...");
          await this.onDemandUpdate(requestedAt, startDate, endDate);
          if (onUpdateCallback) onUpdateCallback(new Date());
        } catch (err) {
          console.error(
            "Orchestrator.scheduledUpdate.scheduleNext: Error during onDemandUpdate, in operating window;"
          );
          console.error(err);
        }
        scheduleNext(); // Schedule the next update
      }, msUntilNext);
    };

    scheduleNext();
  }

  // (async () => {
  //   const orchestrator = new Orchestrator();
  //   orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
  // })();
}

module.exports = { Orchestrator };
