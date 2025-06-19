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
    this.collection = this.dbClient.db().collection('availability');
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
   * Main method to get availability data
   * @param {Object} params
   * @param {string} params.court
   * @param {Date} params.startDate
   * @param {Date} params.endDate
   * @param {Date} params.requestedAt
   * @returns {Promise<Object>} AvailabilityResult
   * @throws on orchestrator or db failure
   */
  async getAvailability({ court, startDate, endDate, requestedAt }) {
    // 1. Try to get data from DB
    let record;
    try {
      record = await this.collection.findOne({ court, startDate, endDate });
    } catch (err) {
      throw new Error('Database error: ' + err.message);
    }

    // 2. Check freshness (stubbed to always true for now)
    let isFresh = true;
    let lastUpdated = record ? record.lastUpdated : null;
    if (record && await this.isFresh(lastUpdated, requestedAt)) {
      return {
        data: record.data,
        requested_at: requestedAt,
        last_updated: lastUpdated,
        source: 'db',
      };
    }

    // 3. If missing/stale, call orchestrator (with 5s timeout)
    let orchestratorData, orchestratorLastUpdated;
    try {
      orchestratorData = await this._withTimeout(
        this.orchestrator.onDemandUpdate(requestedAt, startDate, endDate),
        5000,
        'Orchestrator timed out after 5 seconds.'
      );
      orchestratorLastUpdated = new Date();
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
   * Stub: Always returns true (for now)
   * @private
   */
  async isFresh(lastUpdated, requestedAt) {
    // TODO: Implement real freshness logic
    return true;
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
