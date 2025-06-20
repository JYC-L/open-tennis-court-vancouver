import pkg from "mocha";
import * as chai from "chai";
import sinon from "sinon";
import { readFileSync } from "fs";
const { describe, it, beforeEach, afterEach } = pkg;
const { expect } = chai;

import AvailabilityManager from "./DataManager.js";

describe("AvailabilityManager.getAvailability", () => {
  let manager, repoStub, orchestratorStub, fakeRepo, fakeOrchestrator, testData;

  before(() => {
    // Use the local JSON as test data
    const fileContent = readFileSync(
      "src/services/TennisBcHubScrapper/all_availabilities.json",
      "utf8"
    );
    testData = JSON.parse(fileContent);
  });

  beforeEach(() => {
    // Fake repository with stubbed methods
    fakeRepo = {
      getLastUpdatedTimestamp: sinon.stub(),
      getAllAvailabilityAsArr: sinon.stub()
    };
    // Fake orchestrator with stubbed method
    fakeOrchestrator = {
      onDemandUpdate: sinon.stub().resolves()
    };
    // Patch the constructor to use our fake repo
    AvailabilityManager.prototype.courtScheduleRepository = fakeRepo;
    manager = new AvailabilityManager(fakeOrchestrator);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("returns fresh data from the database", async () => {
    const now = new Date();
    fakeRepo.getLastUpdatedTimestamp.resolves(new Date(now.getTime() - 5 * 60 * 1000)); // 5 min ago
    fakeRepo.getAllAvailabilityAsArr.resolves(testData);

    const result = await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    expect(result).to.deep.equal(testData);
    expect(fakeOrchestrator.onDemandUpdate.called).to.be.false;
  });

  it("calls orchestrator and returns new data if data is stale", async () => {
    const now = new Date();
    fakeRepo.getLastUpdatedTimestamp.resolves(new Date(now.getTime() - 60 * 60 * 1000)); // 1 hour ago
    fakeRepo.getAllAvailabilityAsArr.resolves(testData);

    const result = await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    expect(result).to.deep.equal(testData);
    expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
  });

  it("throws if orchestrator fails", async () => {
    const now = new Date();
    fakeRepo.getLastUpdatedTimestamp.resolves(new Date(now.getTime() - 60 * 60 * 1000)); // 1 hour ago
    fakeRepo.getAllAvailabilityAsArr.resolves(testData);
    fakeOrchestrator.onDemandUpdate.rejects(new Error("fail"));

    try {
      await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
      throw new Error("Should have thrown");
    } catch (err) {
      expect(err.message).to.include("Orchestrator error");
    }
  });
});

describe("AvailabilityManager Integration with Repository", () => {
  let manager, fakeOrchestrator, testData;

  before(() => {
    // Use the local JSON as test data
    const fileContent = readFileSync(
      "src/services/TennisBcHubScrapper/all_availabilities.json",
      "utf8"
    );
    testData = JSON.parse(fileContent);
  });

  beforeEach(() => {
    // Fake orchestrator with stubbed method
    fakeOrchestrator = {
      onDemandUpdate: sinon.stub().resolves()
    };
    // Create manager with real repository (no mocking)
    manager = new AvailabilityManager(fakeOrchestrator);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("calls getLastUpdatedTimestamp when checking freshness", async () => {
    const now = new Date();
    const repoSpy = sinon.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
    
    // Mock the repository to return a fresh timestamp
    repoSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
    
    await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    
    expect(repoSpy.calledOnce).to.be.true;
  });

  it("calls getAllAvailabilityAsArr when data is fresh", async () => {
    const now = new Date();
    const getLastUpdatedSpy = sinon.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
    const getAllAvailabilitySpy = sinon.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
    
    // Mock the repository to return a fresh timestamp and data
    getLastUpdatedSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
    getAllAvailabilitySpy.resolves(testData);
    
    await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    
    expect(getAllAvailabilitySpy.calledOnce).to.be.true;
  });

  it("calls getAllAvailabilityAsArr after orchestrator completes", async () => {
    const now = new Date();
    const getLastUpdatedSpy = sinon.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
    const getAllAvailabilitySpy = sinon.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
    
    // Mock the repository to return a stale timestamp and data
    getLastUpdatedSpy.resolves(new Date(now.getTime() - 60 * 60 * 1000));
    getAllAvailabilitySpy.resolves(testData);
    
    await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    
    // Should be called twice: once for stale check, once after orchestrator
    expect(getAllAvailabilitySpy.calledTwice).to.be.true;
  });

  it("throws database error when repository throws", async () => {
    const now = new Date();
    const getLastUpdatedSpy = sinon.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
    const getAllAvailabilitySpy = sinon.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
    
    // Mock the repository to return a fresh timestamp but throw on getAllAvailabilityAsArr
    getLastUpdatedSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
    getAllAvailabilitySpy.rejects(new Error("Database connection failed"));
    
    try {
      await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
      throw new Error("Should have thrown");
    } catch (err) {
      expect(err.message).to.include("Database error");
    }
  });

  it("handles empty data from repository", async () => {
    const now = new Date();
    const getLastUpdatedSpy = sinon.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
    const getAllAvailabilitySpy = sinon.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
    
    // Mock the repository to return a fresh timestamp but empty data
    getLastUpdatedSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
    getAllAvailabilitySpy.resolves([]);
    
    const result = await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    
    expect(result).to.deep.equal([]);
  });

  it("handles null lastUpdated timestamp", async () => {
    const now = new Date();
    const getLastUpdatedSpy = sinon.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
    const getAllAvailabilitySpy = sinon.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
    
    // Mock the repository to return null timestamp (no data exists)
    getLastUpdatedSpy.resolves(null);
    getAllAvailabilitySpy.resolves(testData);
    
    await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
    
    // Should call orchestrator since data is not fresh (null timestamp)
    expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
  });
});
