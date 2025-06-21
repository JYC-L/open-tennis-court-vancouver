"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtScheduleRepository = void 0;
const MongoCollection_1 = require("./MongoCollection");
class CourtScheduleRepository {
    /**
     *
     * @returns all court schedule entries .
     */
    getAllAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield MongoCollection_1.MongoConnection.getCollection();
        });
    }
    getAllAvailabilityAsArr() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield MongoCollection_1.MongoConnection.getCollection();
            const docs = yield collection.find({}).toArray();
            return docs.map((doc) => {
                const _a = doc, { _id, _pk } = _a, rest = __rest(_a, ["_id", "_pk"]);
                return rest;
            });
        });
    }
    saveAllAvailability(entries) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.overwrite(entries);
        });
    }
    // Overwrite with full upsert strategy
    overwrite(entries) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            const lastUpdated = new Date();
            for (const entry of entries) {
                const pk = this.computePrimaryKey(entry);
                yield collection.updateOne({ _pk: pk }, {
                    $set: Object.assign(Object.assign({}, entry), { _pk: pk, lastUpdated: lastUpdated }),
                }, { upsert: true });
            }
            console.log(`✅ Overwrite completed for court-schedule with ${entries.length} entries.`);
        });
    }
    // On-demand insert with upsert
    addScheduleByEntry(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const pk = this.computePrimaryKey(entry);
            const collection = yield this.getAllAvailability();
            yield collection.updateOne({ _pk: pk }, { $set: Object.assign(Object.assign({}, entry), { _pk: pk }) }, { upsert: true });
        });
    }
    // Cleanup duplicates based on compound _pk
    cleanup(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            const pipeline = [
                {
                    $group: { _id: "$_pk", ids: { $addToSet: "$_id" }, count: { $sum: 1 } },
                },
                { $match: { count: { $gt: 1 } } },
            ];
            const duplicates = yield collection.aggregate(pipeline).toArray();
            for (const doc of duplicates) {
                const [keepId, ...deleteIds] = doc.ids;
                if (deleteIds.length > 0) {
                    yield collection.deleteMany({ _id: { $in: deleteIds } });
                }
            }
            console.log(`Cleanup done for "${collectionName}". Duplicate sets: ${duplicates.length}`);
        });
    }
    // Fetch all by date
    fetchByDate(collectionName, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            return yield collection.find({ date }).toArray();
        });
    }
    // Fetch all by startHour
    fetchByStartHour(collectionName, startHour) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            return yield collection.find({ startHour }).toArray();
        });
    }
    // Fetch all by clubName
    fetchByClubName(collectionName, clubName) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            return yield collection.find({ clubName }).toArray();
        });
    }
    // Fetch all by clubName and courtNumber
    fetchByClubAndCourt(collectionName, clubName, courtNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            return yield collection.find({ clubName, courtNumber }).toArray();
        });
    }
    // Primary key logic for upsert
    computePrimaryKey(entry) {
        return `${entry.clubName}_${entry.courtNumber}_${entry.date}_${entry.startTime}`;
    }
    getCollectionBatchTimestamp() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.getAllAvailability();
            const randomDoc = yield collection.findOne({});
            if (!randomDoc || !randomDoc.lastUpdated)
                return null;
            const date = randomDoc.lastUpdated;
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const hour = date.getHours().toString().padStart(2, "0");
            const minute = date.getMinutes().toString().padStart(2, "0");
            return `${year}-${month}-${day} ${hour}:${minute}`;
        });
    }
}
exports.CourtScheduleRepository = CourtScheduleRepository;
