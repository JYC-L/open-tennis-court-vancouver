import { CourtScheduleEntry } from "../models/CourtScheduleEntry";
import { Collection } from "mongodb";
export declare class CourtScheduleRepository {
    /**
     *
     * @returns all court schedule entries .
     */
    getAllAvailability(): Promise<Collection<CourtScheduleEntry>>;
    getAllAvailabilityAsArr(): Promise<CourtScheduleEntry[]>;
    saveAvailabilityByArr(entries: CourtScheduleEntry[]): Promise<void>;
    insertBulkDataWithUpsertStrategy(entries: CourtScheduleEntry[]): Promise<void>;
    fullOverwrite(entries: CourtScheduleEntry[]): Promise<void>;
    addScheduleByEntry(entry: CourtScheduleEntry): Promise<void>;
    cleanup(collectionName: string): Promise<void>;
    fetchByDate(collectionName: string, date: string): Promise<CourtScheduleEntry[]>;
    fetchByStartHour(collectionName: string, startHour: string): Promise<CourtScheduleEntry[]>;
    fetchByClubName(collectionName: string, clubName: string): Promise<CourtScheduleEntry[]>;
    fetchByClubAndCourt(collectionName: string, clubName: string, courtNumber: string): Promise<CourtScheduleEntry[]>;
    private computePrimaryKey;
    /**
     *
     * @returns the timestamp of the last update in the format YYYY-MM-DD HH:mm
     */
    getCollectionBatchTimestamp(): Promise<string | null>;
    /**
     * Gets the most recent lastUpdated timestamp from the database as UTC
     * @returns The most recent lastUpdated timestamp as a UTC Date object, or null if no documents exist
     */
    getUTCDateLastUpdated(): Promise<Date | null>;
}
