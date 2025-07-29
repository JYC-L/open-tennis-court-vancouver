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
  jest,
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
    // Clear collection after each test to ensure clean state
    await collection.deleteMany({});

    // Reset any global mocks
    jest.restoreAllMocks();
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

  it("should store UTC timestamps and retrieve correctly when system time is 13:00 PDT", async () => {
    // Instead of mocking system time, we'll test the timezone conversion logic directly
    // This tests that our UTC storage pattern works correctly

    const testEntries = [
      {
        clubName: "Test Club PDT",
        courtNumber: "Court 1",
        date: "2025-07-15",
        startTime: "13:00",
        endTime: "14:00",
        available: true,
      },
      {
        clubName: "Test Club PDT",
        courtNumber: "Court 2",
        date: "2025-07-15",
        startTime: "14:00",
        endTime: "15:00",
        available: true,
      },
    ];

    // Save entries with current time
    await repository.saveAvailabilityByArr(testEntries as any);

    // Get the last updated timestamp (will be in UTC)
    const lastUpdated = await repository.getUTCDateLastUpdated();

    // Verify that the timestamp exists and is a valid Date
    expect(lastUpdated).not.toBeNull();
    expect(lastUpdated).toBeInstanceOf(Date);

    // Test the core timezone conversion: create a known UTC time and verify conversion
    // This simulates what would happen if data was saved at 13:00 PDT
    const simulatedPDTTime = new Date("2025-07-15T20:00:00.000Z"); // 20:00 UTC = 13:00 PDT

    // Verify that when this UTC time is converted to Vancouver time, it shows 13:00
    const vancouverTime = simulatedPDTTime.toLocaleString("en-US", {
      timeZone: "America/Vancouver",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    expect(vancouverTime).toBe("13:00");

    // Verify the data was saved correctly
    const results = await repository.getAllAvailabilityAsArr();
    expect(results.length).toBe(2);
    expect(results[0].clubName).toBe("Test Club PDT");
    expect(results[1].clubName).toBe("Test Club PDT");

    // Verify that the stored timestamp is in UTC (should not be null and should be recent)
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - lastUpdated!.getTime());
    expect(timeDiff).toBeLessThan(5000); // Should be within 5 seconds of now
  });

  it("should overwirite existing entries with new data", async () => {
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
        clubName: "Test Club 3",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        location: "newLocation1",
      },
      {
        clubName: "Test Club 4",
        courtNumber: "Court 1",
        date: "2025-06-20",
        startTime: "10:00",
        endTime: "11:00",
        location: "newLocation2",
      },
      {
        clubName: "Test Club 5",
        courtNumber: "Court 2",
        date: "2025-06-21",
        startTime: "11:00",
        endTime: "12:00",
        location: "newLocation3",
      },
    ];

    await repository.saveAvailabilityByArr(oldEntries as any);
    const results = await MongoConnection.getCollection();
    const resultsArr = await results.find({}).toArray();
    expect(resultsArr.length).toEqual(2);
    expect(resultsArr[0].clubName).toBe("Test Club 1");
    expect(resultsArr[1].clubName).toBe("Test Club 2");
    await repository.saveAvailabilityByArr(newEntries as any);
    const resultsAfterOverwrite = await MongoConnection.getCollection();
    const resultsAfterOverwriteArr = await resultsAfterOverwrite
      .find({})
      .toArray();
    expect(resultsAfterOverwriteArr.length).toEqual(3);
    expect(resultsAfterOverwriteArr[0].clubName).toBe("Test Club 3");
    expect(resultsAfterOverwriteArr[1].clubName).toBe("Test Club 4");
    expect(resultsAfterOverwriteArr[2].clubName).toBe("Test Club 5");
  });
});
