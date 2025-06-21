export = AvailabilityManager;
declare class AvailabilityManager {
    /**
     * @param {MongoClient} dbClient - Connected MongoDB client
     * @param {object} orchestrator - Orchestrator instance with onDemandUpdate(requestedAt, startDate, endDate)
     * @param {object} [options]
     * @param {number} [options.freshnessCutoffMinutes=30] - Freshness window in minutes
     */
    constructor(orchestrator: object, options?: {
        freshnessCutoffMinutes?: number;
    });
    courtScheduleRepository: any;
    orchestrator: any;
    freshnessCutoffMinutes: number;
    collection: any;
    /**
     * Get the current freshness cutoff in minutes
     */
    getFreshnessCutoff(): number;
    /**
     * Set the freshness cutoff in minutes
     */
    setFreshnessCutoff(minutes: any): void;
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
    getAvailability(clubName: string, date: string, startDate: Date, endDate: Date, requestedAt: Date): Promise<any>;
    /**
     * Check if data is fresh based on lastUpdated timestamp
     * @private
     */
    private isFresh;
    /**
     * Utility: Promise with timeout
     * @private
     */
    private _withTimeout;
    /**
     * Update the DB with new data and lastUpdated timestamp
     * @private
     */
    private updateDatabase;
}
