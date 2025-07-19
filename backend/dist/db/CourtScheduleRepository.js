"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtScheduleRepository = void 0;
const MongoCollection_1 = require("./MongoCollection");
class CourtScheduleRepository {
    /**
     *
     * @returns all court schedule entries .
     */
    async getAllAvailability() {
        try {
            return await MongoCollection_1.MongoConnection.getCollection();
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.getAllAvailability]: " + error.message);
        }
    }
    async getAllAvailabilityAsArr() {
        try {
            const collection = await MongoCollection_1.MongoConnection.getCollection();
            const docs = await collection.find({}).toArray();
            return docs.map((doc) => {
                const { _id, _pk, ...rest } = doc;
                return rest;
            });
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.getAllAvailabilityAsArr]: " + error.message);
        }
    }
    async saveAvailabilityByArr(entries) {
        try {
            await this.insertBulkDataWithUpsertStrategy(entries);
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.saveAvailabilityByArr]: " + error.message);
        }
    }
    // Overwrite with full upsert strategy
    async insertBulkDataWithUpsertStrategy(entries) {
        try {
            const collection = await this.getAllAvailability();
            const lastUpdated = new Date();
            for (const entry of entries) {
                const pk = this.computePrimaryKey(entry);
                await collection.updateOne({ _pk: pk }, {
                    $set: {
                        ...entry,
                        _pk: pk,
                        lastUpdated: lastUpdated,
                    },
                }, { upsert: true });
            }
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.insertBulkDataWithUpsertStrategy]: " +
                error.message);
        }
    }
    async fullOverwrite(entries) {
        try {
            const collection = await MongoCollection_1.MongoConnection.getCollection();
            const lastUpdated = new Date(); // Store UTC time
            await collection.deleteMany({});
            const bulkEntries = entries.map((entry) => ({
                ...entry,
                _pk: this.computePrimaryKey(entry),
                lastUpdated: lastUpdated,
            }));
            if (bulkEntries.length > 0) {
                await collection.insertMany(bulkEntries);
            }
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.fullOverwrite]: " + error.message);
        }
    }
    // On-demand insert with upsert
    async addScheduleByEntry(entry) {
        try {
            const pk = this.computePrimaryKey(entry);
            const collection = await this.getAllAvailability();
            await collection.updateOne({ _pk: pk }, { $set: { ...entry, _pk: pk } }, { upsert: true });
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.addScheduleByEntry]: " + error.message);
        }
    }
    // Cleanup duplicates based on compound _pk
    async cleanup(collectionName) {
        try {
            const collection = await this.getAllAvailability();
            const pipeline = [
                {
                    $group: {
                        _id: "$_pk",
                        ids: { $addToSet: "$_id" },
                        count: { $sum: 1 },
                    },
                },
                { $match: { count: { $gt: 1 } } },
            ];
            const duplicates = await collection.aggregate(pipeline).toArray();
            for (const doc of duplicates) {
                const [keepId, ...deleteIds] = doc.ids;
                if (deleteIds.length > 0) {
                    await collection.deleteMany({ _id: { $in: deleteIds } });
                }
            }
            console.log(`Cleanup done for "${collectionName}". Duplicate sets: ${duplicates.length}`);
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.cleanup]: " + error.message);
        }
    }
    // Fetch all by date
    async fetchByDate(collectionName, date) {
        try {
            const collection = await this.getAllAvailability();
            return await collection.find({ date }).toArray();
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.fetchByDate]: " + error.message);
        }
    }
    // Fetch all by startHour
    async fetchByStartHour(collectionName, startHour) {
        try {
            const collection = await this.getAllAvailability();
            return await collection.find({ startHour }).toArray();
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.fetchByStartHour]: " + error.message);
        }
    }
    // Fetch all by clubName
    async fetchByClubName(collectionName, clubName) {
        try {
            const collection = await this.getAllAvailability();
            return await collection.find({ clubName }).toArray();
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.fetchByClubName]: " + error.message);
        }
    }
    // Fetch all by clubName and courtNumber
    async fetchByClubAndCourt(collectionName, clubName, courtNumber) {
        try {
            const collection = await this.getAllAvailability();
            return await collection.find({ clubName, courtNumber }).toArray();
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.fetchByClubAndCourt]: " + error.message);
        }
    }
    // Primary key logic for upsert
    computePrimaryKey(entry) {
        try {
            return `${entry.clubName}_${entry.courtNumber}_${entry.date}_${entry.startTime}`;
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.computePrimaryKey]: " + error.message);
        }
    }
    /**
     *
     * @returns the timestamp of the last update in the format YYYY-MM-DD HH:mm
     */
    async getCollectionBatchTimestamp() {
        try {
            const collection = await this.getAllAvailability();
            const randomDoc = await collection.findOne({});
            if (!randomDoc || !randomDoc.lastUpdated)
                return null;
            const date = randomDoc.lastUpdated;
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const hour = date.getHours().toString().padStart(2, "0");
            const minute = date.getMinutes().toString().padStart(2, "0");
            return `${year}-${month}-${day} ${hour}:${minute}`;
        }
        catch (error) {
            throw new Error("[CourtScheduleRepository.getCollectionBatchTimestamp]: " +
                error.message);
        }
    }
    /**
     * Gets the most recent lastUpdated timestamp from the database as UTC
     * @returns The most recent lastUpdated timestamp as a UTC Date object, or null if no documents exist
     */
    async getUTCDateLastUpdated() {
        const collection = await this.getAllAvailability();
        const mostRecentDoc = await collection
            .find({ lastUpdated: { $exists: true } })
            .sort({ lastUpdated: -1 })
            .limit(1)
            .toArray();
        if (mostRecentDoc.length === 0) {
            return null;
        }
        // Return the UTC Date object directly from MongoDB
        return mostRecentDoc[0].lastUpdated;
    }
}
exports.CourtScheduleRepository = CourtScheduleRepository;
