const fs = require('fs');
const path = require('path');
const CourtScheduleRepository = require('../db/CourtScheduleRepository');

class AvailabilityManager {
  /**
   * @param {MongoClient} dbClient - Connected MongoDB client
   * @param {object} orchestrator - Orchestrator instance with onDemandUpdate(requestedAt, startDate, endDate)
   * @param {object} [options]
   * @param {number} [options.freshnessCutoffMinutes=30] - Freshness window in minutes
   */
  constructor(orchestrator, options = {}) {
    this.courtScheduleRepository = new CourtScheduleRepository();
    this.orchestrator = orchestrator;
    this.freshnessCutoffMinutes = options.freshnessCutoffMinutes || 30;
    this.collection = this.dbClient.db().collection('availabilities');
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
    // Simulate DB fetch delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const filePath = path.join(__dirname, 'TennisBcHubScrapper', 'all_availabilities.json');
    console.log('Reading file from:', filePath);
    
    const buffer = fs.readFileSync(filePath, "utf8");
    const results = JSON.parse(buffer);

    // Return mocked availability data
    return results
    // 1. Check freshness
    const lastUpdated = await this.courtScheduleRepository.getLastUpdatedTimestamp();
    let isFresh = false;
    if (lastUpdated) {
      isFresh = this.isFresh(lastUpdated, requestedAt);
    }

    let records = [];
    if (isFresh) {
      try {
        records = await this.courtScheduleRepository.getAllAvailabilityAsArr();
        return records;
      } catch (err) {
        throw new Error('Database error: ' + err.message);
      }
    }

    // 2. If missing/stale, call orchestrator (with timeout)
    const timeoutWindow = 600000; // 10 minutes
    try {
      await this._withTimeout(
        this.orchestrator.onDemandUpdate(requestedAt, startDate, endDate),
        timeoutWindow,
        `Orchestrator timed out after ${timeoutWindow / 1000} seconds.`
      );
      records = await this.courtScheduleRepository.getAllAvailabilityAsArr();
    } catch (err) {
      throw new Error('Orchestrator error: ' + err.message);
    }

    // 3. Return orchestrator data
    return records;
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

  /**
   * Update the DB with new data and lastUpdated timestamp
   * @private
   */
  async updateDatabase(clubName, court, date, startDate, endDate, data, lastUpdated) {
    await this.collection.updateOne(
      { clubName, court, date, startDate, endDate },
      { $set: { ...data, lastUpdated } },
      { upsert: true }
    );
  }
}

module.exports = AvailabilityManager;