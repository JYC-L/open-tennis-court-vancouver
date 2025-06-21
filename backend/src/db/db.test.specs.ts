import { MongoConnection } from "./MongoCollection";

async function testMongoConnection() {
  try {
    const collection = await MongoConnection.getCollection();
    const count = await collection.countDocuments();

    await MongoConnection.close();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

async function insertSampleDocument() {
  try {
    const conne = await MongoConnection.connect();
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
    await MongoConnection.close();
    const count = await MongoConnection.getCollection();
    console.log("Total documents in collection:", count.countDocuments());
  } catch (error) {
    console.error("❌ Error inserting sample document:", error);
  }
}

insertSampleDocument();
