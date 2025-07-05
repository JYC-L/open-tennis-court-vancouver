import { Orchestrator } from "./Orchestrator.js";
import pkg from "mocha";
import * as chai from "chai";
const { describe, it, beforeEach, afterEach } = pkg;
const { expect } = chai;
import sinon from "sinon";

describe("Orchestrator", () => {
  let clock, orchestrator, mockScrapers, mockRepository;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    orchestrator = new Orchestrator(false); // Don't auto-schedule

    // Mock scrapers and repository
    mockScrapers = [
      { getCourtBooking: sinon.stub().resolves([{ data: "test1" }]) },
      { getCourtBooking: sinon.stub().resolves([{ data: "test2" }]) },
    ];
    mockRepository = { saveAvailabilityByArr: sinon.stub().resolves() };

    orchestrator.scrapers = mockScrapers;
    orchestrator.courtScheduleRepository = mockRepository;
  });

  afterEach(() => {
    if (orchestrator?.scheduledTimeoutId)
      clearTimeout(orchestrator.scheduledTimeoutId);
    clock.restore();
    sinon.restore();
  });

  describe("scheduledUpdate timing", () => {
    it("should schedule at minute 1 when before minute 1", () => {
      const stub = sinon.stub(Date.prototype, "toLocaleString");
      stub.withArgs("en-US", sinon.match.object).returns("06:00");
      const consoleSpy = sinon.spy(console, "log");

      orchestrator.scheduledUpdate();

      // Should schedule for 1 minute (60 seconds)
      expect(
        consoleSpy.calledWithMatch(
          /scheduling update in 1 minutes \(60 seconds\)/
        )
      ).to.be.true;

      stub.restore();
      consoleSpy.restore();
    });

    it("should schedule at minute 45 when between minute 1 and 45", () => {
      const stub = sinon.stub(Date.prototype, "toLocaleString");
      stub.withArgs("en-US", sinon.match.object).returns("06:20");
      const consoleSpy = sinon.spy(console, "log");

      orchestrator.scheduledUpdate();

      // Should schedule for 25 minutes (1500 seconds)
      expect(
        consoleSpy.calledWithMatch(
          /scheduling update in 25 minutes \(1500 seconds\)/
        )
      ).to.be.true;

      stub.restore();
      consoleSpy.restore();
    });

    it("should skip outside operating window (5:44 AM)", () => {
      const consoleSpy = sinon.spy(console, "log");
      const stub = sinon.stub(Date.prototype, "toLocaleString");
      stub.withArgs("en-US", sinon.match.object).returns("05:44");

      orchestrator.scheduledUpdate();

      expect(consoleSpy.calledWithMatch(/Outside operating window/)).to.be.true;
      stub.restore();
      consoleSpy.restore();
    });
  });

  describe("onDemandUpdate", () => {
    it("should call all scrapers and save data", async () => {
      const result = await orchestrator.onDemandUpdate(
        new Date(),
        new Date(),
        new Date()
      );

      expect(mockScrapers[0].getCourtBooking.calledOnce).to.be.true;
      expect(mockScrapers[1].getCourtBooking.calledOnce).to.be.true;
      expect(mockRepository.saveAvailabilityByArr.calledOnce).to.be.true;
      expect(result).to.be.an("array");
      expect(result.length).to.equal(2);
    });

    it("should handle scraper failures gracefully", async () => {
      mockScrapers[0].getCourtBooking.rejects(new Error("Network error"));

      const result = await orchestrator.onDemandUpdate(
        new Date(),
        new Date(),
        new Date()
      );

      expect(result.length).to.equal(1); // Only successful scraper
      expect(mockRepository.saveAvailabilityByArr.calledOnce).to.be.true;
    });

    it("should throw proper error when saveData fails", async () => {
      mockRepository.saveAvailabilityByArr.rejects(new Error("DB error"));

      try {
        await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Orchestrator.onDemandUpdate");
      }
    });
  });

  describe("saveData", () => {
    it("should save data and update timestamps", async () => {
      const testData = [{ test: "data" }];

      await orchestrator.saveData(testData);

      expect(orchestrator.lastUpdated).to.be.instanceOf(Date);
      expect(orchestrator.records).to.deep.equal(testData);
      expect(mockRepository.saveAvailabilityByArr.calledWith(testData)).to.be
        .true;
    });

    it("should throw proper error when repository fails", async () => {
      mockRepository.saveAvailabilityByArr.rejects(
        new Error("DB connection failed")
      );

      try {
        await orchestrator.saveData([]);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Orchestrator.saveData");
      }
    });
  });

  describe("timezone handling", () => {
    it("should work with different server timezones", () => {
      const originalTZ = process.env.TZ;
      process.env.TZ = "UTC";

      const testOrchestrator = new Orchestrator(false);
      expect(testOrchestrator).to.be.instanceOf(Orchestrator);

      process.env.TZ = originalTZ;
    });
  });
});
