"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConnection = void 0;
const mongodb_1 = require("mongodb");
class MongoConnection {
    static getDb() {
        throw new Error("Method not implemented.");
    }
    static async connect() {
        if (!MongoConnection.client) {
            const uri = "mongodb+srv://vancouver-tennis:cpsc445-team16@cluster0.rro8xzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            MongoConnection.client = new mongodb_1.MongoClient(uri);
            await MongoConnection.client.connect();
            console.log("MongoDB connected");
        }
        return MongoConnection.client;
    }
    static async getCollection() {
        const client = await MongoConnection.connect();
        const db = client.db(MongoConnection.dbName);
        return db.collection(this.collectionName);
    }
    static async close() {
        if (MongoConnection.client) {
            await MongoConnection.client.close();
            console.log("MongoDB connection closed");
        }
    }
}
exports.MongoConnection = MongoConnection;
MongoConnection.dbName = "Vancouver-tennis-court-availability";
MongoConnection.collectionName = "court-schedule";
