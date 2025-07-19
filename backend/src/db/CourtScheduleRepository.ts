import { MongoConnection } from "./MongoCollection";
import { CourtScheduleEntry } from "../models/CourtScheduleEntry";
import { Collection, ObjectId } from "mongodb";
import { toZonedTime } from "date-fns-tz";

export class CourtScheduleRepository {
  /**
   *
   * @returns all court schedule entries .
   */
  public async getAllAvailability(): Promise<Collection<CourtScheduleEntry>> {
    try {
      return await MongoConnection.getCollection();
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.getAllAvailability]: " + error.message
      );
    }
  }

  public async getAllAvailabilityAsArr(): Promise<CourtScheduleEntry[]> {
    try {
      const collection = await MongoConnection.getCollection();
      const docs = await collection.find({}).toArray();
      return docs.map((doc) => {
        const { _id, _pk, ...rest } = doc as CourtScheduleEntry & {
          _id?: any;
          _pk?: string;
        };
        return rest;
      });
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.getAllAvailabilityAsArr]: " + error.message
      );
    }
  }

  public async saveAvailabilityByArr(
    entries: CourtScheduleEntry[]
  ): Promise<void> {
    try {
      await this.insertBulkDataWithUpsertStrategy(entries);
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.saveAvailabilityByArr]: " + error.message
      );
    }
  }

  // Overwrite with full upsert strategy
  public async insertBulkDataWithUpsertStrategy(
    entries: CourtScheduleEntry[]
  ): Promise<void> {
    try {
      const collection = await this.getAllAvailability();
      const lastUpdated = new Date();
      for (const entry of entries) {
        const pk = this.computePrimaryKey(entry);
        await collection.updateOne(
          { _pk: pk },
          {
            $set: {
              ...entry,
              _pk: pk,
              lastUpdated: lastUpdated,
            },
          },
          { upsert: true }
        );
      }
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.insertBulkDataWithUpsertStrategy]: " +
          error.message
      );
    }
  }

  public async fullOverwrite(entries: CourtScheduleEntry[]) {
    try {
      const collection = await MongoConnection.getCollection();
      const lastUpdated = new Date(); // Store UTC time
      await collection.deleteMany({});
      const bulkEntries = entries.map((entry) => ({
        ...entry,
        _pk: this.computePrimaryKey(entry),
        lastUpdated: lastUpdated,
      }));
      if (bulkEntries.length > 0) {
        await collection.insertMany(bulkEntries);
      }
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.fullOverwrite]: " + error.message
      );
    }
  }

  // On-demand insert with upsert
  public async addScheduleByEntry(entry: CourtScheduleEntry): Promise<void> {
    try {
      const pk = this.computePrimaryKey(entry);
      const collection = await this.getAllAvailability();
      await collection.updateOne(
        { _pk: pk },
        { $set: { ...entry, _pk: pk } },
        { upsert: true }
      );
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.addScheduleByEntry]: " + error.message
      );
    }
  }

  // Cleanup duplicates based on compound _pk
  public async cleanup(collectionName: string): Promise<void> {
    try {
      const collection = await this.getAllAvailability();
      const pipeline = [
        {
          $group: {
            _id: "$_pk",
            ids: { $addToSet: "$_id" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ];
      const duplicates = await collection.aggregate(pipeline).toArray();
      for (const doc of duplicates) {
        const [keepId, ...deleteIds] = doc.ids;
        if (deleteIds.length > 0) {
          await collection.deleteMany({ _id: { $in: deleteIds } });
        }
      }
      console.log(
        `Cleanup done for "${collectionName}". Duplicate sets: ${duplicates.length}`
      );
    } catch (error: any) {
      throw new Error("[CourtScheduleRepository.cleanup]: " + error.message);
    }
  }

  // Fetch all by date
  public async fetchByDate(
    collectionName: string,
    date: string
  ): Promise<CourtScheduleEntry[]> {
    try {
      const collection = await this.getAllAvailability();
      return await collection.find({ date }).toArray();
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.fetchByDate]: " + error.message
      );
    }
  }

  // Fetch all by startHour
  public async fetchByStartHour(
    collectionName: string,
    startHour: string
  ): Promise<CourtScheduleEntry[]> {
    try {
      const collection = await this.getAllAvailability();
      return await collection.find({ startHour }).toArray();
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.fetchByStartHour]: " + error.message
      );
    }
  }

  // Fetch all by clubName
  public async fetchByClubName(
    collectionName: string,
    clubName: string
  ): Promise<CourtScheduleEntry[]> {
    try {
      const collection = await this.getAllAvailability();
      return await collection.find({ clubName }).toArray();
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.fetchByClubName]: " + error.message
      );
    }
  }

  // Fetch all by clubName and courtNumber
  public async fetchByClubAndCourt(
    collectionName: string,
    clubName: string,
    courtNumber: string
  ): Promise<CourtScheduleEntry[]> {
    try {
      const collection = await this.getAllAvailability();
      return await collection.find({ clubName, courtNumber }).toArray();
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.fetchByClubAndCourt]: " + error.message
      );
    }
  }

  // Primary key logic for upsert
  private computePrimaryKey(entry: CourtScheduleEntry): string {
    try {
      return `${entry.clubName}_${entry.courtNumber}_${entry.date}_${entry.startTime}`;
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.computePrimaryKey]: " + error.message
      );
    }
  }

  /**
   *
   * @returns the timestamp of the last update in the format YYYY-MM-DD HH:mm
   */

  public async getCollectionBatchTimestamp(): Promise<string | null> {
    try {
      const collection = await this.getAllAvailability();
      const randomDoc = await collection.findOne({});
      if (!randomDoc || !randomDoc.lastUpdated) return null;

      const date = randomDoc.lastUpdated as Date;
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");

      return `${year}-${month}-${day} ${hour}:${minute}`;
    } catch (error: any) {
      throw new Error(
        "[CourtScheduleRepository.getCollectionBatchTimestamp]: " +
          error.message
      );
    }
  }

  /**
   * Gets the most recent lastUpdated timestamp from the database as UTC
   * @returns The most recent lastUpdated timestamp as a UTC Date object, or null if no documents exist
   */
  public async getUTCDateLastUpdated(): Promise<Date | null> {
    const collection = await this.getAllAvailability();
    const mostRecentDoc = await collection
      .find({ lastUpdated: { $exists: true } })
      .sort({ lastUpdated: -1 })
      .limit(1)
      .toArray();

    if (mostRecentDoc.length === 0) {
      return null;
    }

    // Return the UTC Date object directly from MongoDB
    return mostRecentDoc[0].lastUpdated as Date;
  }
}
