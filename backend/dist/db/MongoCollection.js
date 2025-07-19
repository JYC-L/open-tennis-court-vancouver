"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConnection = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Load environment variables from .env file
class MongoConnection {
    static async connect() {
        try {
            if (!MongoConnection.client) {
                const uri = process.env.MONGODB_CONNECTION_STR || "mongodb://localhost:27017";
                MongoConnection.client = new mongodb_1.MongoClient(uri);
                await MongoConnection.client.connect();
                console.log("MongoDB connected");
            }
            return MongoConnection.client;
        }
        catch (error) {
            throw new Error("[MongoCollection.connect] " + error.message);
        }
    }
    static async getCollection() {
        try {
            const client = await MongoConnection.connect();
            const db = client.db(MongoConnection.dbName);
            return db.collection(this.collectionName);
        }
        catch (error) {
            throw new Error("[MongoCollection.getCollection] " + error.message);
        }
    }
    static async close() {
        try {
            if (MongoConnection.client) {
                await MongoConnection.client.close();
                console.log("MongoDB connection closed");
            }
        }
        catch (error) {
            throw new Error("[MongoCollection.close] " + error.message);
        }
    }
}
exports.MongoConnection = MongoConnection;
MongoConnection.dbName = "Vancouver-tennis-court-availability";
MongoConnection.collectionName = "court-schedule";
