// DataManager.js
// AvailabilityManager: Handles fetching and freshness of court availability data from MongoDB and orchestrator

const { MongoClient } = require('mongodb');

/**
 * Example orchestrator import (assume orchestrator is provided elsewhere)
 * const orchestrator = require('./orchestrator');
 */

class AvailabilityManager {
  /**
   * @param {MongoClient} dbClient - Connected MongoDB client
   * @param {object} orchestrator - Orchestrator instance with onDemandUpdate(requestedAt, startDate, endDate)
   * @param {object} [options]
   * @param {number} [options.freshnessCutoffMinutes=30] - Freshness window in minutes
   */
  constructor(dbClient, orchestrator, options = {}) {
    this.dbClient = dbClient;
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
    // 1. Try to get data from DB
    
    let records;
    // records = db.getData(clubName, date, startDate, endDate)  // assume it's a list of objects like thisl
  //   {
  //   "clubName": "Tennis BC Hub @ Richmond",
  //   "courtNumber": "Bubble Court 1",
  //   "date": "2025-06-19",
  //   "startHour": "06:00",
  //   "startTime": "06:30",
  //   "endTime": "09:00",
  //   "bookable": 0,
  //   "courtBookingLink": "https://clubspark.ca/TBCHubRichmond/Booking/bookbycourt#?startDate=2025-06-19&endDate=2025-06-26&resource=0&&role=guest",
  //   "location": "Vancouver DT"
  // }

    // 2. Check freshness (stubbed to always true for now)
    // let lastUpdated = await db.getLastUpdated(); // assume it's a string with format YYYY-MM-DD HH:MM
    // lastUpdated = Date(lastUpdated)
    let isFresh = await this.isFresh(lastUpdated, requestedAt);
    isFresh = true;
    if (records && isFresh) {
      return records;
    }

    // 3. If missing/stale, call orchestrator (with 5s timeout)
    let timeoutWindow = 5000;
    try {
      await this._withTimeout(
        // this.orchestrator.onDemandUpdate(requestedAt, startDate, endDate), orchestrator will trigger all scrappers and push data to the db.
        timeoutWindow,
        `Orchestrator timed out after ${timeoutWindow/1000} seconds.`
      );
      records = getDataFromDB()
    } catch (err) {
      throw new Error('Orchestrator error: ' + err.message);
    }

    // 4. Update DB with new data
    try {
      await this.updateDatabase(court, startDate, endDate, orchestratorData, orchestratorLastUpdated);
    } catch (err) {
      throw new Error('Database update error: ' + err.message);
    }

    // 5. Return orchestrator data
    return {
      data: orchestratorData,
      requested_at: requestedAt,
      last_updated: orchestratorLastUpdated,
      source: 'orchestrator',
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
  async updateDatabase(clubName, courtNumber, date, startTime, data, lastUpdated) {
    await this.collection.updateOne(
      { clubName, courtNumber, date, startTime },
      { $set: { ...data, lastUpdated } },
      { upsert: true }
    );
  }
}

module.exports = AvailabilityManager;
