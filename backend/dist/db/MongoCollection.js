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
exports.MongoConnection = void 0;
const mongodb_1 = require("mongodb");
class MongoConnection {
    static getDb() {
        throw new Error("Method not implemented.");
    }
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!MongoConnection.client) {
                const uri = "mongodb+srv://vancouver-tennis:cpsc445-team16@cluster0.rro8xzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
                MongoConnection.client = new mongodb_1.MongoClient(uri);
                yield MongoConnection.client.connect();
                console.log("MongoDB connected");
            }
            return MongoConnection.client;
        });
    }
    static getCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield MongoConnection.connect();
            const db = client.db(MongoConnection.dbName);
            return db.collection(this.collectionName);
        });
    }
    static close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (MongoConnection.client) {
                yield MongoConnection.client.close();
                console.log("MongoDB connection closed");
            }
        });
    }
}
exports.MongoConnection = MongoConnection;
MongoConnection.dbName = "Vancouver-tennis-court-availability";
MongoConnection.collectionName = "court-schedule";
