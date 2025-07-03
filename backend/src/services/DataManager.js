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
  constructor(freshnessCutoffMinutes = 20) {
    try {
      this.courtScheduleRepository = new CourtScheduleRepository();
      this.orchestrator = new Orchestrator();
      this.freshnessCutoffMinutes = freshnessCutoffMinutes;
    } catch (error) {
      throw new Error(
        "AvailablityManager.constructor: error when initializing fields;",
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
    let lastUpdated = null;
    let isFresh = false;
    const orchestratorLastUpdated = this.orchestrator.lastUpdated;
    const dbLastUpdated =
      await this.courtScheduleRepository.getLastUpdatedTimestamp();
    if (orchestratorLastUpdated) {
      lastUpdated = orchestratorLastUpdated;
    } else if (dbLastUpdated) {
      lastUpdated = dbLastUpdated;
    }

    isFresh = this.isFresh(lastUpdated, requestedAt);

    let records = [];
    if (isFresh && this.orchestrator.records) {
      // Return cached data from orchestrator if fresh and available
      try {
        records = this.orchestrator.records;
        return { data: records, updated_at: lastUpdated };
      } catch (err) {
        throw new Error(
          "DataManager.getAvailability: Error when accessing cached data from orchestrator;",
          { cause: err }
        );
      }
    }

    if (isFresh) {
      try {
        records = await this.courtScheduleRepository.getAllAvailabilityAsArr();
        this.orchestrator.records = records;
        return { data: records, updated_at: requestedAt };
      } catch (err) {
        throw new Error(
          "DataManager.getAvailability: Error when accessing db data using orchestrator;",
          { cause: err }
        );
      }
    }

    // 2. If missing/stale, call orchestrator (with timeout)
    const timeoutWindow = 600000; // 10 minutes
    try {
      records = await this._withTimeout(
        this.orchestrator.onDemandUpdate(requestedAt, startDate, endDate),
        timeoutWindow,
        `Orchestrator timed out after ${timeoutWindow / 1000} seconds.`
      );
    } catch (err) {
      throw new Error(
        "DataManager.getAvailability: Error when data not fresh and invoked Orchestrator;",
        { cause: err }
      );
    }

    // 3. Return orchestrator data
    return { data: records, updated_at: requestedAt };
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
}

module.exports = AvailabilityManager;
