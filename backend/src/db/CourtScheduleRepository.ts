import { MongoConnection } from "./MongoCollection";
import { CourtScheduleEntry } from "../models/CourtScheduleEntry";
import { Collection, ObjectId } from "mongodb";

export class CourtScheduleRepository {
  /**
   *
   * @returns all court schedule entries .
   */
  public async getAllAvailability(): Promise<Collection<CourtScheduleEntry>> {
    return await MongoConnection.getCollection();
  }

  public async getAllAvailabilityAsArr(): Promise<CourtScheduleEntry[]> {
    const collection = await MongoConnection.getCollection();
    const docs = await collection.find({}).toArray();
    return docs.map((doc) => {
      const { _id, _pk, ...rest } = doc as CourtScheduleEntry & {
        _id?: any;
        _pk?: string;
      };
      return rest;
    });
  }

  public async saveAllAvailability(
    entries: CourtScheduleEntry[]
  ): Promise<void> {
    await this.overwrite(entries);
  }

  // Overwrite with full upsert strategy
  public async overwrite(entries: CourtScheduleEntry[]): Promise<void> {
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
    console.log(
      `✅ Overwrite completed for court-schedule with ${entries.length} entries.`
    );
  }

  // On-demand insert with upsert
  public async addScheduleByEntry(entry: CourtScheduleEntry): Promise<void> {
    const pk = this.computePrimaryKey(entry);
    const collection = await this.getAllAvailability();
    await collection.updateOne(
      { _pk: pk },
      { $set: { ...entry, _pk: pk } },
      { upsert: true }
    );
  }

  // Cleanup duplicates based on compound _pk
  public async cleanup(collectionName: string): Promise<void> {
    const collection = await this.getAllAvailability();
    const pipeline = [
      {
        $group: { _id: "$_pk", ids: { $addToSet: "$_id" }, count: { $sum: 1 } },
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
  }

  // Fetch all by date
  public async fetchByDate(
    collectionName: string,
    date: string
  ): Promise<CourtScheduleEntry[]> {
    const collection = await this.getAllAvailability();
    return await collection.find({ date }).toArray();
  }

  // Fetch all by startHour
  public async fetchByStartHour(
    collectionName: string,
    startHour: string
  ): Promise<CourtScheduleEntry[]> {
    const collection = await this.getAllAvailability();
    return await collection.find({ startHour }).toArray();
  }

  // Fetch all by clubName
  public async fetchByClubName(
    collectionName: string,
    clubName: string
  ): Promise<CourtScheduleEntry[]> {
    const collection = await this.getAllAvailability();
    return await collection.find({ clubName }).toArray();
  }

  // Fetch all by clubName and courtNumber
  public async fetchByClubAndCourt(
    collectionName: string,
    clubName: string,
    courtNumber: string
  ): Promise<CourtScheduleEntry[]> {
    const collection = await this.getAllAvailability();
    return await collection.find({ clubName, courtNumber }).toArray();
  }

  // Primary key logic for upsert
  private computePrimaryKey(entry: CourtScheduleEntry): string {
    return `${entry.clubName}_${entry.courtNumber}_${entry.date}_${entry.startTime}`;
  }

  public async getCollectionBatchTimestamp(): Promise<string | null> {
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
  }
}
