import { MongoClient, Collection } from "mongodb";
import { CourtScheduleEntry } from "../models/CourtScheduleEntry";
export declare class MongoConnection {
    private static client;
    private static dbName;
    private static collectionName;
    static connect(): Promise<MongoClient>;
    static getCollection(): Promise<Collection<CourtScheduleEntry>>;
    static close(): Promise<void>;
}
