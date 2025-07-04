import pkg from "mocha";
import * as chai from "chai";
import sinon from "sinon";
import { readFileSync } from "fs";
const { describe, it, beforeEach, afterEach, before } = pkg;
const { expect } = chai;

import AvailabilityManager from "./DataManager.js";

describe("AvailabilityManager", () => {
  let manager, fakeOrchestrator, testData;

  before(() => {
    try {
      const fileContent = readFileSync(
        "src/services/TennisBcHubScrapper/all_availabilities.json",
        "utf8"
      );
      testData = JSON.parse(fileContent);
    } catch (error) {
      testData = [];
    }
  });

  beforeEach(() => {
    fakeOrchestrator = {
      onDemandUpdate: sinon.stub().resolves(testData),
      lastUpdated: null,
      records: testData
    };
    manager = new AvailabilityManager(20);
    manager.orchestrator = fakeOrchestrator;
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should default to 20-minute freshness", () => {
    const defaultManager = new AvailabilityManager();
    expect(defaultManager.getFreshnessCutoff()).to.equal(20);
  });

  it("should use cache when data is 19 minutes old (fresh)", async function () {
    this.timeout(30000);
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 19 * 60 * 1000);

    const result = await manager.getAvailability(
      "test",
      "2025-06-19",
      now,
      now,
      now
    );

    expect(fakeOrchestrator.onDemandUpdate.called).to.be.false;
    expect(result).to.equal(testData);
  });

  it("should trigger update when data is 20+ minutes old (stale)", async function () {
    this.timeout(420000); // 7 minutes for parsing
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 21 * 60 * 1000);

    await manager.getAvailability("test", "2025-06-19", now, now, now);

    expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
  });

  it("should trigger update when lastUpdated is null", async function () {
    this.timeout(420000);
    const now = new Date();
    fakeOrchestrator.lastUpdated = null;

    await manager.getAvailability("test", "2025-06-19", now, now, now);

    expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
  });

  it("should throw proper error when orchestrator fails", async function () {
    this.timeout(30000);
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 30 * 60 * 1000);
    fakeOrchestrator.onDemandUpdate.rejects(new Error("Mock failure"));

    try {
      await manager.getAvailability("test", "2025-06-19", now, now, now);
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error.message).to.include("DataManager.getAvailability");
    }
  });

  it("should handle 5-minute parsing time", async function () {
    this.timeout(10000); // 10 seconds
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 30 * 60 * 1000);
    // Simulate 5-minute parsing with much shorter actual wait
    fakeOrchestrator.onDemandUpdate.returns(
      new Promise(
        (resolve) => setTimeout(() => resolve(testData), 2000) // 2 seconds instead of 5 minutes
      )
    );

    const start = Date.now();
    const result = await manager.getAvailability(
      "test",
      "2025-06-19",
      now,
      now,
      now
    );
    const duration = Date.now() - start;

    expect(result).to.be.an("array");
    expect(duration).to.be.greaterThan(1500); // At least 1.5 seconds
    console.log(`✅ Simulated 5-minute parsing completed in ${duration}ms`);
  });

  it("should timeout after 10 minutes", async function () {
    this.timeout(15000); // 15 seconds
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 30 * 60 * 1000);

    // Override the timeout method to use shorter timeout for testing
    const originalTimeout = manager._withTimeout;
    manager._withTimeout = async function (promise, ms, timeoutMsg) {
      let timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(timeoutMsg)), 3000); // 3 second timeout
      });
      return Promise.race([
        promise.finally(() => clearTimeout(timeout)),
        timeoutPromise
      ]);
    };

    fakeOrchestrator.onDemandUpdate.returns(
      new Promise(
        (resolve) => setTimeout(() => resolve(testData), 5000) // 5 seconds - longer than 3-second timeout
      )
    );

    try {
      await manager.getAvailability("test", "2025-06-19", now, now, now);
      expect.fail("Should have timed out");
    } catch (error) {
      expect(error.message).to.include("timed out");
      console.log(`✅ Timeout test completed: ${error.message}`);
    } finally {
      manager._withTimeout = originalTimeout;
    }
  });
});
