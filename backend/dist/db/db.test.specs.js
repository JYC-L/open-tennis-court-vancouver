"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoCollection_1 = require("./MongoCollection");
async function testMongoConnection() {
    try {
        const collection = await MongoCollection_1.MongoConnection.getCollection();
        const count = await collection.countDocuments();
        await MongoCollection_1.MongoConnection.close();
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
    }
}
async function insertSampleDocument() {
    try {
        const conne = await MongoCollection_1.MongoConnection.connect();
        await conne
            .db("Vancouver-tennis-court-availability")
            .collection("court-schedule")
            .insertOne({
            courtId: "court-001",
            date: new Date(),
            availableTimes: ["08:00", "09:00"],
            lastUpdated: new Date(),
        });
        console.log("✅ Sample document inserted successfully");
        await MongoCollection_1.MongoConnection.close();
        const count = await MongoCollection_1.MongoConnection.getCollection();
        console.log("Total documents in collection:", count.countDocuments());
    }
    catch (error) {
        console.error("❌ Error inserting sample document:", error);
    }
}
insertSampleDocument();
