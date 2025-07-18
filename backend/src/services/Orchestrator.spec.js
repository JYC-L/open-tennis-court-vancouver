import { Orchestrator } from "./Orchestrator.js";
import pkg from "mocha";
import * as chai from "chai";
const { describe, it, beforeEach, afterEach } = pkg;
const { expect } = chai;
import sinon from "sinon";
import fs from "fs";

describe("Orchestrator", () => {
  let clock, orchestrator, mockScrapers, mockRepository;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    orchestrator = new Orchestrator(false); // Don't auto-schedule

    // Mock scrapers and repository
    mockScrapers = [
      { getCourtBooking: sinon.stub().resolves([{ data: "test1" }]) },
      { getCourtBooking: sinon.stub().resolves([{ data: "test2" }]) },
      { getCourtBooking: sinon.stub().resolves([{ data: "test3" }]) },
    ];
    mockRepository = {
      saveAvailabilityByArr: sinon.stub().resolves(),
      getLastUpdatedTimestamp: sinon.stub().resolves(new Date()),
      getAllAvailabilityAsArr: sinon.stub().resolves([{ data: "db_data" }]),
    };

    orchestrator.scrapers = mockScrapers;
    orchestrator.courtScheduleRepository = mockRepository;
  });

  afterEach(() => {
    if (orchestrator?.scheduledTimeoutID)
      clearTimeout(orchestrator.scheduledTimeoutID);
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

    it("should schedule for 5:45 AM when outside operating window (5:44 AM)", () => {
      const consoleSpy = sinon.spy(console, "log");
      const stub = sinon.stub(Date.prototype, "toLocaleString");
      stub.withArgs("en-US", sinon.match.object).returns("05:44");

      orchestrator.scheduledUpdate();

      expect(consoleSpy.calledWithMatch(/Outside operating window/)).to.be.true;
      expect(consoleSpy.calledWithMatch(/Scheduling for 5:45 AM PST/)).to.be
        .true;
      stub.restore();
      consoleSpy.restore();
    });

    it("should schedule for 5:45 AM when outside operating window (22:02 PM)", () => {
      const consoleSpy = sinon.spy(console, "log");
      const stub = sinon.stub(Date.prototype, "toLocaleString");
      stub.withArgs("en-US", sinon.match.object).returns("22:02");

      orchestrator.scheduledUpdate();

      expect(consoleSpy.calledWithMatch(/Outside operating window/)).to.be.true;
      expect(consoleSpy.calledWithMatch(/Scheduling for 5:45 AM PST/)).to.be
        .true;
      stub.restore();
      consoleSpy.restore();
    });

    it("should schedule for next hour when after minute 45", () => {
      const consoleSpy = sinon.spy(console, "log");
      const stub = sinon.stub(Date.prototype, "toLocaleString");
      stub.withArgs("en-US", sinon.match.object).returns("15:50");

      orchestrator.scheduledUpdate();

      // Should schedule for 11 minutes (660 seconds) to get to 16:01
      expect(
        consoleSpy.calledWithMatch(
          /scheduling update in 11 minutes \(660 seconds\)/
        )
      ).to.be.true;
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
      expect(mockScrapers[2].getCourtBooking.calledOnce).to.be.true;
      expect(result).to.be.an("array");
      expect(result.length).to.equal(3);
    });

    it("should handle scraper failures gracefully", async () => {
      mockScrapers[0].getCourtBooking.rejects(new Error("Network error"));

      const result = await orchestrator.onDemandUpdate(
        new Date(),
        new Date(),
        new Date()
      );

      expect(result.length).to.equal(2); // Only successful scrapers
    });

    it("should throw proper error when pushDataToDBandLoadFromDB fails", async () => {
      mockRepository.saveAvailabilityByArr.rejects(new Error("DB error"));

      try {
        await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Orchestrator.onDemandUpdate");
      }
    });

    it("should update orchestrator state after successful database save", async () => {
      const testTimestamp = new Date();
      const testRecords = [{ data: "db_data" }];

      mockRepository.getLastUpdatedTimestamp.resolves(testTimestamp);
      mockRepository.getAllAvailabilityAsArr.resolves(testRecords);

      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      expect(orchestrator.lastUpdated).to.equal(testTimestamp);
      expect(orchestrator.records).to.equal(testRecords);
    });
  });

  describe("pushDataToDBandLoadFromDB", () => {
    it("should save data and update orchestrator state", async () => {
      const testData = [{ test: "data" }];
      const testTimestamp = new Date();
      const testRecords = [{ data: "db_data" }];

      mockRepository.getLastUpdatedTimestamp.resolves(testTimestamp);
      mockRepository.getAllAvailabilityAsArr.resolves(testRecords);

      await orchestrator.pushDataToDBandLoadFromDB(testData);

      expect(orchestrator.lastUpdated).to.equal(testTimestamp);
      expect(orchestrator.records).to.equal(testRecords);
      expect(mockRepository.saveAvailabilityByArr.calledWith(testData)).to.be
        .true;
      expect(mockRepository.getLastUpdatedTimestamp.calledOnce).to.be.true;
      expect(mockRepository.getAllAvailabilityAsArr.calledOnce).to.be.true;
    });

    it("should throw proper error when repository save fails", async () => {
      mockRepository.saveAvailabilityByArr.rejects(
        new Error("DB connection failed")
      );

      try {
        await orchestrator.pushDataToDBandLoadFromDB([]);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Orchestrator.saveData");
      }
    });

    it("should throw proper error when getLastUpdatedTimestamp fails", async () => {
      mockRepository.getLastUpdatedTimestamp.rejects(
        new Error("Timestamp fetch failed")
      );

      try {
        await orchestrator.pushDataToDBandLoadFromDB([]);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Orchestrator.saveData");
      }
    });

    it("should throw proper error when getAllAvailabilityAsArr fails", async () => {
      mockRepository.getAllAvailabilityAsArr.rejects(
        new Error("Records fetch failed")
      );

      try {
        await orchestrator.pushDataToDBandLoadFromDB([]);
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

  describe("comprehensive operating window tests", () => {
    const testCases = [
      { time: "05:00", shouldBeOutside: true, description: "5:00 AM" },
      { time: "05:44", shouldBeOutside: true, description: "5:44 AM" },
      {
        time: "05:45",
        shouldBeOutside: false,
        description: "5:45 AM (boundary)",
      },
      { time: "06:00", shouldBeOutside: false, description: "6:00 AM" },
      { time: "10:30", shouldBeOutside: false, description: "10:30 AM" },
      { time: "15:20", shouldBeOutside: false, description: "3:20 PM" },
      { time: "21:59", shouldBeOutside: false, description: "9:59 PM" },
      {
        time: "22:01",
        shouldBeOutside: false,
        description: "10:01 PM (boundary)",
      },
      { time: "22:02", shouldBeOutside: true, description: "10:02 PM" },
      { time: "23:30", shouldBeOutside: true, description: "11:30 PM" },
      { time: "00:30", shouldBeOutside: true, description: "12:30 AM" },
      { time: "02:15", shouldBeOutside: true, description: "2:15 AM" },
    ];

    testCases.forEach(({ time, shouldBeOutside, description }) => {
      it(`should ${
        shouldBeOutside ? "be outside" : "be inside"
      } operating window at ${description}`, () => {
        const consoleSpy = sinon.spy(console, "log");
        const stub = sinon.stub(Date.prototype, "toLocaleString");
        stub.withArgs("en-US", sinon.match.object).returns(time);

        orchestrator.scheduledUpdate();

        if (shouldBeOutside) {
          expect(consoleSpy.calledWithMatch(/Outside operating window/)).to.be
            .true;
        } else {
          expect(consoleSpy.calledWithMatch(/scheduling update in/)).to.be.true;
        }

        stub.restore();
        consoleSpy.restore();
      });
    });
  });

  describe("logging and file operations in onDemandUpdate", () => {
    let fsStubs;

    beforeEach(() => {
      // Mock fs methods directly on the imported fs module
      fsStubs = {
        existsSync: sinon.stub(fs, "existsSync"),
        mkdirSync: sinon.stub(fs, "mkdirSync"),
        appendFileSync: sinon.stub(fs, "appendFileSync"),
      };
    });

    afterEach(() => {
      // Restore fs stubs
      Object.values(fsStubs).forEach((stub) => stub.restore());
    });

    it("should create log directory if it doesn't exist in onDemandUpdate", async () => {
      fsStubs.existsSync.returns(false);

      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      expect(fsStubs.existsSync.calledOnce).to.be.true;
      expect(fsStubs.mkdirSync.calledOnce).to.be.true;
      expect(
        fsStubs.mkdirSync.calledWith(sinon.match.string, { recursive: true })
      ).to.be.true;
    });

    it("should not create log directory if it exists in onDemandUpdate", async () => {
      fsStubs.existsSync.returns(true);

      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      expect(fsStubs.existsSync.calledOnce).to.be.true;
      expect(fsStubs.mkdirSync.called).to.be.false;
    });

    it("should write log message with correct format in onDemandUpdate", async () => {
      fsStubs.existsSync.returns(true);

      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      expect(fsStubs.appendFileSync.calledOnce).to.be.true;
      const logCall = fsStubs.appendFileSync.getCall(0);
      expect(logCall.args[1]).to.match(
        /^\[.*\] Orchestrator\.onDemandUpdate Started\.\n$/
      );
      expect(logCall.args[2]).to.equal("utf8");
    });

    it("should handle log write errors gracefully in onDemandUpdate", async () => {
      fsStubs.existsSync.returns(true);
      fsStubs.appendFileSync.throws(new Error("Write permission denied"));
      const consoleErrorSpy = sinon.spy(console, "error");

      // Should not throw despite log error
      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      expect(consoleErrorSpy.calledWithMatch("Log Write Error:")).to.be.true;
      consoleErrorSpy.restore();
    });

    it("should use correct log file path with Vancouver date", async () => {
      fsStubs.existsSync.returns(true);

      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      const logCall = fsStubs.appendFileSync.getCall(0);
      const logFilePath = logCall.args[0];
      expect(logFilePath).to.match(/\/logs\/\d{4}-\d{2}-\d{2}\.txt$/);
    });
  });
});
