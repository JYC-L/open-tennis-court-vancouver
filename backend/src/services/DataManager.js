const {
  CourtScheduleRepository,
} = require("../../dist/db/CourtScheduleRepository");
const { Orchestrator } = require("./Orchestrator");

class AvailabilityManager {
  /**
   * @param {MongoClient} dbClient - Connected MongoDB client
   * @param {object} orchestrator - Orchestrator instance with onDemandUpdate(requestedAt, startDate, endDate)
   * @param {object} [options]
   * @param {number} [options.freshnessCutoffMinutes=20] - Freshness window in minutes
   */
  constructor(
    freshnessCutoffMinutes = 20,
    orchestrator = null,
    courtScheduleRepository = null
  ) {
    try {
      this.courtScheduleRepository =
        courtScheduleRepository || new CourtScheduleRepository();
      this.orchestrator = orchestrator || new Orchestrator();
      this.freshnessCutoffMinutes = freshnessCutoffMinutes;
      this.updatePromise = null;
    } catch (error) {
      throw new Error(
        "AvailabilityManager.constructor: error when initializing fields;",
        { cause: error }
      );
    }
  }

  /**
   * Get the current freshness cutoff in minutes
   */
  getFreshnessCutoff() {
    return this.freshnessCutoffMinutes;
  }

  /**
   * Set the freshness cutoff in minutes
   */
  setFreshnessCutoff(minutes) {
    this.freshnessCutoffMinutes = minutes;
  }

  /**
   * Main method to get availability data for a club/location
   * @param {string} clubName - The name of the club/location to fetch availability for
   * @param {string} date - The date for which to fetch availability (format: YYYY-MM-DD)
   * @param {Date} startDate - The start of the date range (if applicable)
   * @param {Date} endDate - The end of the date range (if applicable)
   * @param {Date} requestedAt - The time the client requested the data (used for freshness checks)
   * @returns {Promise<Object>} AvailabilityResult - The availability data and metadata
   * @throws {Error} On orchestrator or database failure
   */
  async getAvailability(clubName, date, startDate, endDate, requestedAt) {
    // // Simulate DB fetch delay
    // await new Promise(resolve => setTimeout(resolve, 100));

    // const filePath = path.join(__dirname, 'TennisBcHubScrapper', 'all_availabilities.json');
    // console.log('Reading file from:', filePath);

    // const buffer = fs.readFileSync(filePath, "utf8");
    // const results = JSON.parse(buffer);

    // // Return mocked availability data
    // return results
    // 1. Check freshness using orchestrator's cached timestamp
    let isFresh = false;
    const orchestratorLastUpdated = this.orchestrator.lastUpdated;
    const dbLastUpdated =
      await this.courtScheduleRepository.getLastUpdatedTimestamp();
    if (!orchestratorLastUpdated || orchestratorLastUpdated < dbLastUpdated) {
      console.log("Cache missing or older than db data.");
      try {
        await this._cacheFromDB();
      } catch (error) {
        throw new Error(
          "DataManager.getAvailability: error when updating cache because it's missing or older than DB",
          { cause: error }
        );
      }
    }

    isFresh = this.isFresh(this.orchestrator.lastUpdated, requestedAt);

    if (isFresh) {
      try {
        console.log(
          "DataManager.getAvailability: Data is fresh, using cached orchestrator data."
        );
        return {
          data: this.orchestrator.records,
          updated_at: this.orchestrator.lastUpdated,
        };
      } catch (err) {
        throw new Error(
          "DataManager.getAvailability: Error when accessing cached data from orchestrator;",
          { cause: err }
        );
      }
    }

    if (!isFresh && !this.updatePromise) {
      const timeoutWindow = 600000; // 10 minutes
      console.log(
        "DataManager.getAvailability: Data is stale, invoking onDemand Parsing for fresh data."
      );
      this.updatePromise = this._withTimeout(
        this.orchestrator.onDemandUpdate(requestedAt, startDate, endDate),
        timeoutWindow,
        `Orchestrator timed out after ${timeoutWindow / 1000} seconds.`
      )
        .catch((err) => {
          console.error(
            "DataManager.getAvailability: Error when data not fresh and invoked Orchestrator;"
          );
          console.error("Caused by:", err);
        })
        .finally(() => {
          this.updatePromise = null;
        });
    }

    console.log(
      "DataManager.getAvailability: Update in progress, returning stale cached data."
    );

    return {
      data: this.orchestrator.records,
      updated_at: this.orchestrator.lastUpdated,
    };
  }

  /**
   * Check if data is fresh based on lastUpdated timestamp
   * @private
   */
  isFresh(lastUpdated, requestedAt) {
    if (!lastUpdated) {
      return false; // No data means not fresh
    }

    const timeDiffMs = requestedAt.getTime() - lastUpdated.getTime();
    const timeDiffMinutes = timeDiffMs / (1000 * 60);

    console.log(`Last updated at:${lastUpdated}`)
    return timeDiffMinutes < this.freshnessCutoffMinutes;
  }

  /**
   * Utility: Promise with timeout
   * @private
   */
  async _withTimeout(promise, ms, timeoutMsg) {
    let timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error(timeoutMsg)), ms);
    });
    return Promise.race([
      promise.finally(() => clearTimeout(timeout)),
      timeoutPromise,
    ]);
  }

  async _cacheFromDB() {
    this.orchestrator.records =
      await this.courtScheduleRepository.getAllAvailabilityAsArr();
    this.orchestrator.lastUpdated =
      await this.courtScheduleRepository.getLastUpdatedTimestamp();
    console.log("Updating cache with data from DB.");
  }
}

module.exports = AvailabilityManager;
