import { Collection } from "mongodb";
import { CourtScheduleEntry } from "../../models/CourtScheduleEntry";
import { CourtScheduleRepository } from "../CourtScheduleRepository";
import { MongoConnection } from "../MongoCollection";

import {
  expect,
  beforeAll,
  afterAll,
  describe,
  it,
  afterEach,
  beforeEach,
} from "@jest/globals";
describe("CourtScheduleRepository", () => {
  let repository: CourtScheduleRepository;
  let collection: Collection<CourtScheduleEntry>;

  beforeAll(async () => {
    await MongoConnection.connect();
    repository = new CourtScheduleRepository();
    collection = await MongoConnection.getCollection();
  });

  afterAll(async () => {
    await MongoConnection.close();
  });

  beforeEach(async () => {
    // Clear collection before each test to ensure clean state
    await collection.deleteMany({});
  });

  afterEach(async () => {
    // Optional: cleanup again after test (extra safety)
    await collection.deleteMany({});
  });

  it("should insert and retrieve availability", async () => {
    const testEntry = {
      clubName: "Test Club",
      courtNumber: "Court 1",
      date: "2025-06-20",
      startTime: "10:00",
      endTime: "11:00",
      available: true,
    };

    await repository.addScheduleByEntry(testEntry as any);
    const results = await repository.fetchByClubAndCourt(
      "court-schedule",
      "Test Club",
      "Court 1"
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].clubName).toBe("Test Club");
  });

  it("should update get all availability", async () => {
    const testEntry = {
      clubName: "Test Club",
      courtNumber: "Court 1",
      date: "2025-06-20",
      startTime: "10:00",
      endTime: "11:00",
      available: false,
    };

    await repository.addScheduleByEntry(testEntry as any);
    const results = await repository.getAllAvailabilityAsArr();

    expect(results.length).toEqual(1);
    expect(results[0].clubName).toBe("Test Club");
  });

  it("should get all availability as array", async () => {
    const testEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        available: true,
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        available: true,
      },
    ];

    for (const entry of testEntries) {
      await repository.addScheduleByEntry(entry as any);
    }

    const results = await repository.getAllAvailabilityAsArr();
    expect(results.length).toEqual(2);
    expect(results).toBeInstanceOf(Array);
    expect(results[0].clubName).toBe("Test Club 1");
    expect(results[1].clubName).toBe("Test Club 2");
  });

  it("shoule save all availability when adding data for the first time", async () => {
    const testEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        available: true,
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        available: true,
      },
    ];

    await repository.saveAvailabilityByArr(testEntries as any);
    const results = await repository.getAllAvailabilityAsArr();
    expect(results.length).toEqual(2);
    expect(results[0].clubName).toBe("Test Club 1");
    expect(results[1].clubName).toBe("Test Club 2");
  });

  it("shoule add new data to the db when new data has different pk", async () => {
    const oldEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        available: true,
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        available: true,
      },
    ];
    const newEntries = [
      {
        clubName: "Test Club 3",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        available: true,
      },
      {
        clubName: "Test Club 4",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        available: true,
      },
    ];

    await repository.saveAvailabilityByArr(oldEntries as any);
    await repository.saveAvailabilityByArr(newEntries as any);
    const results = await repository.getAllAvailabilityAsArr();
    expect(results.length).toEqual(4);
    expect(results[0].clubName).toBe("Test Club 1");
    expect(results[1].clubName).toBe("Test Club 2");
  });

  it("shoule replace the old data when new data has the same pk", async () => {
    const oldEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        location: "location1",
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        location: "location2",
      },
    ];
    const newEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        location: "location3",
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        location: "location4",
      },
    ];

    await repository.saveAvailabilityByArr(oldEntries as any);
    await repository.saveAvailabilityByArr(newEntries as any);
    const results = await MongoConnection.getCollection();
    const resultsArr = await results.find({}).toArray();
    expect(resultsArr.length).toEqual(2);
    expect(resultsArr[0].location).toBe("location3");
    expect(resultsArr[1].location).toBe("location4");
    expect(resultsArr[0]).toHaveProperty("_pk");
    expect(resultsArr[0]).toHaveProperty("lastUpdated");
    expect(resultsArr[1]).toHaveProperty("_pk");
    expect(resultsArr[1]).toHaveProperty("lastUpdated");
  });

  it("shoule collection", async () => {
    const oldEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        location: "location1",
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        location: "location2",
      },
    ];
    const newEntries = [
      {
        clubName: "Test Club 1",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        location: "location3",
      },
      {
        clubName: "Test Club 2",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        location: "location4",
      },
    ];

    await repository.saveAvailabilityByArr(oldEntries as any);
    await repository.saveAvailabilityByArr(newEntries as any);
    const results = await MongoConnection.getCollection();
    const resultsArr = await results.find({}).toArray();
    expect(resultsArr.length).toEqual(2);
    expect(resultsArr[0].location).toBe("location3");
    expect(resultsArr[1].location).toBe("location4");
    expect(resultsArr[0]).toHaveProperty("_pk");
    expect(resultsArr[0]).toHaveProperty("lastUpdated");
    expect(resultsArr[1]).toHaveProperty("_pk");
    expect(resultsArr[1]).toHaveProperty("lastUpdated");
  });
});
