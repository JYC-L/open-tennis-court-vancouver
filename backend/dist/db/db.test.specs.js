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
Object.defineProperty(exports, "__esModule", { value: true });
const MongoCollection_1 = require("./MongoCollection");
function testMongoConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield MongoCollection_1.MongoConnection.getCollection();
            const count = yield collection.countDocuments();
            yield MongoCollection_1.MongoConnection.close();
        }
        catch (error) {
            console.error("❌ MongoDB connection failed:", error);
        }
    });
}
function insertSampleDocument() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conne = yield MongoCollection_1.MongoConnection.connect();
            yield conne
                .db("Vancouver-tennis-court-availability")
                .collection("court-schedule")
                .insertOne({
                courtId: "court-001",
                date: new Date(),
                availableTimes: ["08:00", "09:00"],
                lastUpdated: new Date(),
            });
            console.log("✅ Sample document inserted successfully");
            yield MongoCollection_1.MongoConnection.close();
            const count = yield MongoCollection_1.MongoConnection.getCollection();
            console.log("Total documents in collection:", count.countDocuments());
        }
        catch (error) {
            console.error("❌ Error inserting sample document:", error);
        }
    });
}
insertSampleDocument();
