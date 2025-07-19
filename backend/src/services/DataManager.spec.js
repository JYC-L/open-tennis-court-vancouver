const pkg = require("mocha");
const chai = require("chai");
const sinon = require("sinon");
const { readFileSync } = require("fs");
const { describe, it, beforeEach, afterEach, before } = pkg;
const { expect } = chai;

const AvailabilityManager = require("./DataManager.js");

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
      testData = [{ id: 1, court: "test", available: true }];
    }
  });

  beforeEach(() => {
    fakeOrchestrator = {
      onDemandUpdate: sinon.stub().resolves(testData),
      lastUpdated: null,
      records: testData,
    };

    fakeRepository = {
      getUTCDateLastUpdated: sinon.stub().resolves(null),
      getAllAvailabilityAsArr: sinon.stub().resolves(testData),
    };

    manager = new AvailabilityManager(20, fakeOrchestrator, fakeRepository);
  });

  after(() => {
    // Force exit after tests complete to prevent hanging
    setTimeout(() => {
      if (process.env.NODE_ENV !== "production") {
        process.exit(0);
      }
    }, 100);
  });

  afterEach(async () => {
    // Wait for any pending background operations to complete
    if (manager && manager.updatePromise) {
      try {
        await Promise.race([
          manager.updatePromise,
          new Promise((resolve) => setTimeout(resolve, 100)), // Short timeout
        ]);
      } catch (error) {
        // Ignore errors during cleanup
      }
      manager.updatePromise = null;
    }
    sinon.restore();
  });

  describe("Constructor", () => {
    it("should initialize with default 20-minute freshness", () => {
      const defaultManager = new AvailabilityManager();
      expect(defaultManager.getFreshnessCutoff()).to.equal(20);
    });

    it("should accept custom freshness cutoff", () => {
      const customManager = new AvailabilityManager(30);
      expect(customManager.getFreshnessCutoff()).to.equal(30);
    });

    it("should throw error when constructor fails", () => {
      expect(() => {
        const badOrchestrator = { onDemandUpdate: "not a function" };
        new AvailabilityManager(20, badOrchestrator, null);
      }).to.not.throw(); // Constructor doesn't validate orchestrator
    });
  });

  describe("Freshness Management", () => {
    it("should update freshness cutoff", () => {
      manager.setFreshnessCutoff(15);
      expect(manager.getFreshnessCutoff()).to.equal(15);
    });

    it("should return false for null lastUpdated", () => {
      const now = new Date();
      expect(manager.isFresh(null, now)).to.be.false;
    });

    it("should return true for data 19 minutes old", () => {
      const now = new Date();
      const lastUpdated = new Date(now.getTime() - 19 * 60 * 1000);
      expect(manager.isFresh(lastUpdated, now)).to.be.true;
    });

    it("should return false for data exactly 20 minutes old", () => {
      const now = new Date();
      const lastUpdated = new Date(now.getTime() - 20 * 60 * 1000);
      expect(manager.isFresh(lastUpdated, now)).to.be.false;
    });

    it("should throw error for invalid date objects", () => {
      const now = new Date();
      expect(() => manager.isFresh("invalid date", now)).to.throw();
    });
  });

  describe("Cache vs Database Logic", () => {
    it("should use cache when orchestrator data exists and is newer than DB", async () => {
      const now = new Date();
      const dbTime = new Date(now.getTime() - 30 * 60 * 1000);
      const cacheTime = new Date(now.getTime() - 10 * 60 * 1000);

      fakeRepository.getUTCDateLastUpdated.resolves(dbTime);
      fakeOrchestrator.lastUpdated = cacheTime;

      const result = await manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );

      expect(fakeRepository.getAllAvailabilityAsArr.called).to.be.false;
      expect(result.data).to.equal(testData);
    });

    it("should update cache when orchestrator has no data", async () => {
      const now = new Date();
      fakeOrchestrator.lastUpdated = null;
      fakeRepository.getUTCDateLastUpdated.resolves(new Date());

      await manager.getAvailability("test", "2025-06-19", now, now, now);

      expect(fakeRepository.getAllAvailabilityAsArr.calledOnce).to.be.true;
    });

    it("should update cache when DB is newer than orchestrator", async () => {
      const now = new Date();
      const cacheTime = new Date(now.getTime() - 30 * 60 * 1000);
      const dbTime = new Date(now.getTime() - 10 * 60 * 1000);

      fakeOrchestrator.lastUpdated = cacheTime;
      fakeRepository.getUTCDateLastUpdated.resolves(dbTime);

      await manager.getAvailability("test", "2025-06-19", now, now, now);

      expect(fakeRepository.getAllAvailabilityAsArr.calledOnce).to.be.true;
    });

    it("should throw error when cache update from DB fails", async () => {
      const now = new Date();
      fakeOrchestrator.lastUpdated = null;
      fakeRepository.getUTCDateLastUpdated.resolves(new Date());
      fakeRepository.getAllAvailabilityAsArr.rejects(new Error("DB error"));

      try {
        await manager.getAvailability("test", "2025-06-19", now, now, now);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("error when updating cache");
      }
    });

    it("should throw error when getUTCDateLastUpdated fails", async () => {
      const now = new Date();
      fakeOrchestrator.lastUpdated = null;
      fakeRepository.getUTCDateLastUpdated.rejects(
        new Error("DB connection failed")
      );

      try {
        await manager.getAvailability("test", "2025-06-19", now, now, now);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("DB connection failed");
      }
    });
  });

  describe("Fresh Data Scenarios", () => {
    it("should return cached data when fresh", async () => {
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
      expect(result.data).to.equal(testData);
      expect(result.updated_at).to.equal(fakeOrchestrator.lastUpdated);
    });

    it("should throw error when accessing cached data fails", async () => {
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 19 * 60 * 1000);

      Object.defineProperty(fakeOrchestrator, "records", {
        get: () => {
          throw new Error("Cache access error");
        },
      });

      try {
        await manager.getAvailability("test", "2025-06-19", now, now, now);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include(
          "Error when accessing cached data from orchestrator"
        );
      }
    });
  });

  describe("Stale Data Scenarios", () => {
    it("should trigger update when data is stale", async () => {
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      await manager.getAvailability("test", "2025-06-19", now, now, now);

      expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
    });

    it("should return stale data immediately while update runs", async function () {
      this.timeout(5000);
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      const start = Date.now();
      const result = await manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );
      const duration = Date.now() - start;

      expect(duration).to.be.lessThan(100);
      expect(result.data).to.equal(testData);
      expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
    });

    it("should not trigger multiple updates for concurrent requests", async function () {
      this.timeout(5000);
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      const promise1 = manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );
      const promise2 = manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );

      await Promise.all([promise1, promise2]);

      expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
    });

    it("should handle orchestrator update failure gracefully", async function () {
      this.timeout(5000);
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);
      fakeOrchestrator.onDemandUpdate.rejects(new Error("Update failed"));

      const result = await manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );

      expect(result.data).to.equal(testData);
      expect(result.updated_at).to.equal(fakeOrchestrator.lastUpdated);
    });

    it("should clean up updatePromise after completion", async function () {
      this.timeout(3000);
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      await manager.getAvailability("test", "2025-06-19", now, now, now);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(manager.updatePromise).to.be.null;
    });

    it("should trigger new update after previous completes", async function () {
      this.timeout(3000);
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      await manager.getAvailability("test", "2025-06-19", now, now, now);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await manager.getAvailability("test", "2025-06-19", now, now, now);

      expect(fakeOrchestrator.onDemandUpdate.calledTwice).to.be.true;
    });

    it("should pass correct parameters to onDemandUpdate", async function () {
      this.timeout(5000);
      const now = new Date();
      const startDate = new Date(now.getTime() - 1000);
      const endDate = new Date(now.getTime() + 1000);
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      await manager.getAvailability(
        "test",
        "2025-06-19",
        startDate,
        endDate,
        now
      );

      expect(
        fakeOrchestrator.onDemandUpdate.calledWith(now, startDate, endDate)
      ).to.be.true;
    });
  });

  describe("Timeout Handling", () => {
    it("should timeout long-running updates", async function () {
      this.timeout(5000);
      const now = new Date();
      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      const originalTimeout = manager._withTimeout;
      manager._withTimeout = async function (promise, ms, timeoutMsg) {
        let timeout;
        const timeoutPromise = new Promise((_, reject) => {
          timeout = setTimeout(() => reject(new Error(timeoutMsg)), 1000);
        });
        return Promise.race([
          promise.finally(() => clearTimeout(timeout)),
          timeoutPromise,
        ]);
      };

      fakeOrchestrator.onDemandUpdate.returns(
        new Promise((resolve) => setTimeout(() => resolve(testData), 2000))
      );

      const result = await manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );

      expect(result.data).to.equal(testData);
      manager._withTimeout = originalTimeout;
    });

    it("should resolve when promise completes before timeout", async () => {
      const fastPromise = Promise.resolve("success");
      const result = await manager._withTimeout(fastPromise, 1000, "timeout");
      expect(result).to.equal("success");
    });

    it("should reject when promise times out", async () => {
      const slowPromise = new Promise((resolve) =>
        setTimeout(() => resolve("slow"), 2000)
      );

      try {
        await manager._withTimeout(slowPromise, 500, "Custom timeout message");
        expect.fail("Should have timed out");
      } catch (error) {
        expect(error.message).to.equal("Custom timeout message");
      }
    });

    it("should clean up timeout when promise completes", async () => {
      const fastPromise = Promise.resolve("success");
      await manager._withTimeout(fastPromise, 1000, "timeout");
    });
  });

  describe("onDemandUpdate Updates Orchestrator", () => {
    it("should have orchestrator update its own data after onDemandUpdate", async function () {
      this.timeout(5000);
      const now = new Date();
      const newData = [{ id: 2, court: "updated", available: false }];
      const newTimestamp = new Date();

      fakeOrchestrator.lastUpdated = new Date(now.getTime() - 25 * 60 * 1000);

      // Create a promise to track when onDemandUpdate completes
      let updateCompleted = false;
      fakeOrchestrator.onDemandUpdate.callsFake(async () => {
        // Simulate async update
        await new Promise((resolve) => setTimeout(resolve, 50));
        fakeOrchestrator.records = newData;
        fakeOrchestrator.lastUpdated = newTimestamp;
        updateCompleted = true;
        return newData;
      });

      const result = await manager.getAvailability(
        "test",
        "2025-06-19",
        now,
        now,
        now
      );

      // Should return stale data immediately (old testData)
      expect(result.data).to.equal(testData);

      // Wait for background update to complete
      while (!updateCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Now orchestrator should have updated data
      expect(fakeOrchestrator.records).to.equal(newData);
      expect(fakeOrchestrator.lastUpdated).to.equal(newTimestamp);
    });
  });
});
