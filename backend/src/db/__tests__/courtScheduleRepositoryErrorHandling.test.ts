import { MongoConnection } from "../MongoCollection";
import { MongoClient, Db } from "mongodb";
import { CourtScheduleRepository } from "../CourtScheduleRepository";
import { jest } from "@jest/globals";
import { describe, it, beforeEach, expect } from "@jest/globals";

jest.mock("mongodb");

describe("MongoConnection.connect error handling", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should throw error with class/method name if connection fails", async () => {
    (MongoClient as unknown as jest.Mock).mockImplementationOnce(() => {
      return {
        connect: () => {
          throw new Error("Mock connection failure");
        },
      };
    });

    (MongoConnection as any).client = undefined;

    await expect(MongoConnection.connect()).rejects.toThrow(
      "[MongoCollection.connect] Mock connection failure"
    );
  });
});

describe("MongoConnection.getCollection error handling", () => {
  it("should throw formatted error if db.collection() fails", async () => {
    // Mock chain: client.db().collection() throws error
    const mockCollection = jest.fn(() => {
      throw new Error("Mock collection failure");
    });

    const mockDb = {
      collection: mockCollection,
    } as unknown as Db;

    const mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
      connect: jest.fn(),
    } as unknown as MongoClient;

    // Force internal client to mocked version
    (MongoConnection as any).client = mockClient;

    await expect(MongoConnection.getCollection()).rejects.toThrow(
      "[MongoCollection.getCollection] Mock collection failure"
    );
  });
});

describe("CourtScheduleRepository error handling", () => {
  let repo: CourtScheduleRepository;

  beforeEach(() => {
    repo = new CourtScheduleRepository();
    jest.restoreAllMocks();
  });

  it("getAllAvailability should throw formatted error", async () => {
    jest
      .spyOn(MongoConnection, "getCollection")
      .mockRejectedValueOnce(new Error("mocked failure"));

    await expect(repo.getAllAvailability()).rejects.toThrow(
      "[CourtScheduleRepository.getAllAvailability]: mocked failure"
    );
  });

  it("insertBulkDataWithUpsertStrategy should throw formatted error", async () => {
    jest
      .spyOn(repo, "getAllAvailability")
      .mockRejectedValueOnce(new Error("mocked insert failure"));

    await expect(repo.insertBulkDataWithUpsertStrategy([])).rejects.toThrow(
      "[CourtScheduleRepository.insertBulkDataWithUpsertStrategy]: mocked insert failure"
    );
  });

  it("fetchByDate should throw formatted error", async () => {
    jest
      .spyOn(repo, "getAllAvailability")
      .mockRejectedValueOnce(new Error("mocked fetch error"));

    await expect(repo.fetchByDate("dummy", "2025-07-03")).rejects.toThrow(
      "[CourtScheduleRepository.fetchByDate]: mocked fetch error"
    );
  });

  it("getCollectionBatchTimestamp should throw formatted error", async () => {
    jest
      .spyOn(repo, "getAllAvailability")
      .mockRejectedValueOnce(new Error("mocked timestamp error"));

    await expect(repo.getCollectionBatchTimestamp()).rejects.toThrow(
      "[CourtScheduleRepository.getCollectionBatchTimestamp]: mocked timestamp error"
    );
  });
});
