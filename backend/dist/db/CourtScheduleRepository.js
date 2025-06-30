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
        return await MongoCollection_1.MongoConnection.getCollection();
    }
    async getAllAvailabilityAsArr() {
        const collection = await MongoCollection_1.MongoConnection.getCollection();
        const docs = await collection.find({}).toArray();
        return docs.map((doc) => {
            const { _id, _pk, ...rest } = doc;
            return rest;
        });
    }
    async saveAvailabilityByArr(entries) {
        await this.insertBulkDataWithUpsertStrategy(entries);
    }
    // Overwrite with full upsert strategy
    async insertBulkDataWithUpsertStrategy(entries) {
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
    async fullOverwrite(entries) {
        const collection = await MongoCollection_1.MongoConnection.getCollection();
        const lastUpdated = new Date();
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
    // On-demand insert with upsert
    async addScheduleByEntry(entry) {
        const pk = this.computePrimaryKey(entry);
        const collection = await this.getAllAvailability();
        await collection.updateOne({ _pk: pk }, { $set: { ...entry, _pk: pk } }, { upsert: true });
    }
    // Cleanup duplicates based on compound _pk
    async cleanup(collectionName) {
        const collection = await this.getAllAvailability();
        const pipeline = [
            {
                $group: { _id: "$_pk", ids: { $addToSet: "$_id" }, count: { $sum: 1 } },
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
    // Fetch all by date
    async fetchByDate(collectionName, date) {
        const collection = await this.getAllAvailability();
        return await collection.find({ date }).toArray();
    }
    // Fetch all by startHour
    async fetchByStartHour(collectionName, startHour) {
        const collection = await this.getAllAvailability();
        return await collection.find({ startHour }).toArray();
    }
    // Fetch all by clubName
    async fetchByClubName(collectionName, clubName) {
        const collection = await this.getAllAvailability();
        return await collection.find({ clubName }).toArray();
    }
    // Fetch all by clubName and courtNumber
    async fetchByClubAndCourt(collectionName, clubName, courtNumber) {
        const collection = await this.getAllAvailability();
        return await collection.find({ clubName, courtNumber }).toArray();
    }
    // Primary key logic for upsert
    computePrimaryKey(entry) {
        return `${entry.clubName}_${entry.courtNumber}_${entry.date}_${entry.startTime}`;
    }
    async getCollectionBatchTimestamp() {
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
    /**
     * Gets the most recent lastUpdated timestamp from the database
     * @returns The most recent lastUpdated timestamp as a Date object, or null if no documents exist
     */
    async getLastUpdatedTimestamp() {
        const collection = await this.getAllAvailability();
        const mostRecentDoc = await collection
            .find({ lastUpdated: { $exists: true } })
            .sort({ lastUpdated: -1 })
            .limit(1)
            .toArray();
        if (mostRecentDoc.length === 0) {
            return null;
        }
        return mostRecentDoc[0].lastUpdated;
    }
}
exports.CourtScheduleRepository = CourtScheduleRepository;
