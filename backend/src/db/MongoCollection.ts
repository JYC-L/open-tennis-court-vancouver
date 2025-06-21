import { MongoClient, Db, Collection } from "mongodb";
import { CourtScheduleEntry } from "../models/CourtScheduleEntry";

export class MongoConnection {
  static getDb() {
    throw new Error("Method not implemented.");
  }
  private static client: MongoClient;
  private static dbName = "Vancouver-tennis-court-availability";
  private static collectionName = "court-schedule";

  static async connect(): Promise<MongoClient> {
    if (!MongoConnection.client) {
      const uri =
        "mongodb+srv://vancouver-tennis:cpsc445-team16@cluster0.rro8xzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
      MongoConnection.client = new MongoClient(uri);
      await MongoConnection.client.connect();
      console.log("MongoDB connected");
    }
    return MongoConnection.client;
  }

  static async getCollection(): Promise<Collection<CourtScheduleEntry>> {
    const client = await MongoConnection.connect();
    const db: Db = client.db(MongoConnection.dbName);
    return db.collection<CourtScheduleEntry>(this.collectionName);
  }

  static async close(): Promise<void> {
    if (MongoConnection.client) {
      await MongoConnection.client.close();
      console.log("MongoDB connection closed");
    }
  }
}
