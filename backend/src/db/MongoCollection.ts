import { MongoClient, Db, Collection } from "mongodb";
import { CourtScheduleEntry } from "../models/CourtScheduleEntry";
import { config } from "dotenv";

config(); // Load environment variables from .env file

export class MongoConnection {
  private static client: MongoClient;
  private static dbName = "Vancouver-tennis-court-availability";
  private static collectionName = "court-schedule";

  static async connect(): Promise<MongoClient> {
    try {
      if (!MongoConnection.client) {
        const uri =
          process.env.MONGODB_CONNECTION_STR || "mongodb://localhost:27017";
        MongoConnection.client = new MongoClient(uri);
        await MongoConnection.client.connect();
        console.log("MongoDB connected");
      }
      return MongoConnection.client;
    } catch (error: any) {
      throw new Error("[MongoCollection.connect] " + error.message);
    }
  }

  static async getCollection(): Promise<Collection<CourtScheduleEntry>> {
    try {
      const client = await MongoConnection.connect();
      const db: Db = client.db(MongoConnection.dbName);
      return db.collection<CourtScheduleEntry>(this.collectionName);
    } catch (error: any) {
      throw new Error("[MongoCollection.getCollection] " + error.message);
    }
  }

  static async close(): Promise<void> {
    try {
      if (MongoConnection.client) {
        await MongoConnection.client.close();
        console.log("MongoDB connection closed");
      }
    } catch (error: any) {
      throw new Error("[MongoCollection.close] " + error.message);
    }
  }
}
