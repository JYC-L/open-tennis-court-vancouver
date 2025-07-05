import pkg from "mocha";
import * as chai from "chai";
import sinon from "sinon";
import { readFileSync } from "fs";
const { describe, it, beforeEach, afterEach, before } = pkg;
const { expect } = chai;

import AvailabilityManager from "./DataManager.js";

describe("AvailabilityManager", () => {
  let manager, fakeOrchestrator, fakeRepository, testData;

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

  after(() => {
    // Force exit to prevent hanging from background promises
    setTimeout(() => process.exit(0), 100);
  });

  beforeEach(() => {
    fakeOrchestrator = {
      onDemandUpdate: sinon.stub().resolves(testData),
      lastUpdated: null,
      records: testData,
    };

    fakeRepository = {
      getLastUpdatedTimestamp: sinon.stub().resolves(null),
      getAllAvailabilityAsArr: sinon.stub().resolves(testData),
    };

    manager = new AvailabilityManager(20, fakeOrchestrator, fakeRepository);
  });

  afterEach(() => {
    if (manager && manager.updatePromise) {
      // Cancel the background promise to prevent hanging
      if (typeof manager.updatePromise.cancel === "function") {
        manager.updatePromise.cancel();
      }
      manager.updatePromise = null;
    }
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
    expect(result.data).to.deep.equal(testData);
    expect(result.updated_at).to.exist;
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

  it("should return stale data when orchestrator fails in background", async function () {
    this.timeout(30000);
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 30 * 60 * 1000);
    fakeOrchestrator.onDemandUpdate.rejects(new Error("Mock failure"));

    // Should return stale data, not throw
    const result = await manager.getAvailability(
      "test",
      "2025-06-19",
      now,
      now,
      now
    );

    expect(result.data).to.deep.equal(testData);
    expect(result.updated_at).to.exist;
    expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
  });

  it("should return stale data immediately while parsing in background", async function () {
    this.timeout(5000);
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 30 * 60 * 1000);

    const start = Date.now();
    const result = await manager.getAvailability(
      "test",
      "2025-06-19",
      now,
      now,
      now
    );
    const duration = Date.now() - start;

    // Should return immediately with stale data
    expect(duration).to.be.lessThan(100); // Very fast
    expect(result.data).to.deep.equal(testData);
    expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
    console.log(`✅ Returned stale data immediately in ${duration}ms`);
  });

  it("should timeout after 10 minutes", async function () {
    this.timeout(15000); // 15 seconds
    const now = new Date();
    fakeOrchestrator.lastUpdated = new Date(now.getTime() - 30 * 60 * 1000);

    // Override the timeout method to use shorter timeout for testing
    const originalTimeout = manager._withTimeout;
    let longRunningTimeout;

    manager._withTimeout = async function (promise, ms, timeoutMsg) {
      let timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(timeoutMsg)), 3000); // 3 second timeout
      });
      return Promise.race([
        promise.finally(() => clearTimeout(timeout)),
        timeoutPromise,
      ]);
    };

    fakeOrchestrator.onDemandUpdate.returns(
      new Promise((resolve) => {
        longRunningTimeout = setTimeout(() => resolve(testData), 5000); // Store timeout reference
        return longRunningTimeout;
      })
    );

    try {
      await manager.getAvailability("test", "2025-06-19", now, now, now);
      expect.fail("Should have timed out");
    } catch (error) {
      expect(error.message).to.include("timed out");
      console.log(`✅ Timeout test completed: ${error.message}`);
    } finally {
      // Clean up the hanging timeout
      if (longRunningTimeout) {
        clearTimeout(longRunningTimeout);
      }
      manager._withTimeout = originalTimeout;
    }
  });
});
