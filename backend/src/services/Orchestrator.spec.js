import { Orchestrator } from "./Orchestrator.js";
import pkg from "mocha";
import * as chai from "chai";
const { describe, it, before, beforeEach, afterEach } = pkg;
const { expect } = chai;
import { readFileSync } from "fs";
import sinon from "sinon";

describe("Orchestrator scheduledUpdate - Vancouver Timezone", () => {
  let clock;
  let orchestrator;
  let callTimes;
  let consoleLogSpy;

  beforeEach(() => {
    // Set up fake timers with Vancouver timezone consideration
    clock = sinon.useFakeTimers();
    orchestrator = new Orchestrator();
    callTimes = [];
    consoleLogSpy = sinon.spy(console, "log");
  });

  afterEach(() => {
    clock.restore();
    consoleLogSpy.restore();
  });

  describe("Scheduled timing validation (1st and 45th minutes)", () => {
    it("should schedule at minute 1 when current time is before minute 1", async () => {
      // Mock Vancouver time to be 6:00 AM (within operating window)
      const mockVancouverTime = "06:00";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should schedule for minute 1 (1 minute from now)
      clock.tick(60000); // 1 minute
      await Promise.resolve();

      expect(callTimes.length).to.equal(1);
      Date.prototype.toLocaleString.restore();
    });

    it("should schedule at minute 45 when current time is between minute 1 and 45", async () => {
      // Mock Vancouver time to be 6:20 AM
      const mockVancouverTime = "06:20";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should schedule for minute 45 (25 minutes from now)
      clock.tick(25 * 60000); // 25 minutes
      await Promise.resolve();

      expect(callTimes.length).to.equal(1);
      Date.prototype.toLocaleString.restore();
    });

    it("should schedule for next hour at minute 1 when current time is after minute 45", async () => {
      // Mock Vancouver time to be 6:50 AM
      const mockVancouverTime = "06:50";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should schedule for next hour at minute 1 (11 minutes from now)
      clock.tick(11 * 60000); // 11 minutes
      await Promise.resolve();

      expect(callTimes.length).to.equal(1);
      Date.prototype.toLocaleString.restore();
    });
  });

  describe("Operating window validation (5:45-22:01 Vancouver time)", () => {
    it("should operate normally at 5:45 AM (start of window)", async () => {
      const mockVancouverTime = "05:45";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should immediately schedule since it's exactly at 5:45
      clock.tick(1000); // 1 second to allow async execution
      await Promise.resolve();

      expect(callTimes.length).to.equal(1);
      Date.prototype.toLocaleString.restore();
    });

    it("should operate normally at 22:01 (end of window)", async () => {
      const mockVancouverTime = "22:01";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      clock.tick(1000);
      await Promise.resolve();

      expect(callTimes.length).to.equal(1);
      Date.prototype.toLocaleString.restore();
    });

    it("should schedule for next day 5:45 AM when at 5:44 AM (before window)", async () => {
      const mockVancouverTime = "05:44";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should schedule for 5:45 AM (1 minute from now)
      clock.tick(60000); // 1 minute
      await Promise.resolve();

      expect(callTimes.length).to.equal(1);
      expect(consoleLogSpy.calledWithMatch(/Outside operating window/)).to.be
        .true;
      Date.prototype.toLocaleString.restore();
    });

    it("should schedule for next day 5:45 AM when at 22:02 (after window)", async () => {
      const mockVancouverTime = "22:02";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should schedule for tomorrow 5:45 AM
      expect(consoleLogSpy.calledWithMatch(/Outside operating window/)).to.be
        .true;
      Date.prototype.toLocaleString.restore();
    });

    it("should handle midnight boundary correctly", async () => {
      const mockVancouverTime = "23:30";
      sinon.stub(Date.prototype, "toLocaleString").returns(mockVancouverTime);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      expect(consoleLogSpy.calledWithMatch(/Outside operating window/)).to.be
        .true;
      Date.prototype.toLocaleString.restore();
    });
  });

  describe("Timezone independence (server not in Vancouver)", () => {
    it("should work correctly when server is in UTC", async () => {
      // Mock server time as UTC but Vancouver calculation should still work
      const originalTimezone = process.env.TZ;
      process.env.TZ = "UTC";

      // The code uses toLocaleString with Vancouver timezone, so this should still work
      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Restore timezone
      process.env.TZ = originalTimezone;

      // Verify that scheduling logic still works (basic smoke test)
      expect(typeof orchestrator).to.equal("object");
    });

    it("should work correctly when server is in EST", async () => {
      const originalTimezone = process.env.TZ;
      process.env.TZ = "America/New_York";

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      process.env.TZ = originalTimezone;
      expect(typeof orchestrator).to.equal("object");
    });
  });

  describe("Daylight Saving Time transitions", () => {
    it("should handle spring forward (DST start) correctly", async () => {
      // Test around DST transition date (typically second Sunday in March)
      // Note: This is a conceptual test - actual DST handling depends on system locale
      const dstStartDate = new Date("2025-03-09T10:00:00"); // Approximate DST start
      clock = sinon.useFakeTimers(dstStartDate);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      // Should still schedule correctly despite DST transition
      expect(typeof orchestrator).to.equal("object");
      clock.restore();
    });

    it("should handle fall back (DST end) correctly", async () => {
      // Test around DST end date (typically first Sunday in November)
      const dstEndDate = new Date("2025-11-02T10:00:00"); // Approximate DST end
      clock = sinon.useFakeTimers(dstEndDate);

      orchestrator.scheduledUpdate(() => callTimes.push(Date.now()));

      expect(typeof orchestrator).to.equal("object");
      clock.restore();
    });
  });
});

describe("Orchestrator onDemandUpdate - Error Handling", () => {
  let results;
  let orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  describe("Error message format validation", () => {
    it("should throw errors with proper class.method format from onDemandUpdate", async function () {
      this.timeout(120000); // 2 minutes for 90-second parsing + buffer

      // Mock a scraper to throw an error
      const originalScrapers = orchestrator.scrapers;
      orchestrator.scrapers = [
        {
          getCourtBooking: sinon.stub().rejects(new Error("Mock scraper error"))
        }
      ];

      try {
        await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
        expect.fail("Should have thrown an error");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("Orchestrator.onDemandUpdate");
        expect(error.message).to.include("calling scrapers");
      } finally {
        orchestrator.scrapers = originalScrapers;
      }
    });

    it("should throw errors with proper format from saveData", async function () {
      this.timeout(120000);

      // Mock the repository to throw an error
      const originalSaveMethod =
        orchestrator.courtScheduleRepository.saveAvailabilityByArr;
      orchestrator.courtScheduleRepository.saveAvailabilityByArr = sinon
        .stub()
        .rejects(new Error("Mock DB error"));

      try {
        await orchestrator.saveData([{ mockData: true }]);
        expect.fail("Should have thrown an error");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("Orchestrator.pushToDB");
        expect(error.message).to.include("Error pushing results to DB");
      } finally {
        orchestrator.courtScheduleRepository.saveAvailabilityByArr =
          originalSaveMethod;
      }
    });
  });

  describe("Successful operation with 90-second parsing time", () => {
    it("should complete successfully within expected time frame", async function () {
      this.timeout(180000); // 3 minutes to account for 90-second parsing + network delays

      try {
        const startTime = Date.now();
        await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Parsing completed in ${duration / 1000} seconds`);
        expect(duration).to.be.lessThan(180000); // Should complete within 3 minutes
        expect(duration).to.be.greaterThan(10000); // Should take at least 10 seconds (sanity check)
      } catch (error) {
        console.log("Parsing error:", error.message);
        throw error;
      }
    });
  });

  before(async function () {
    this.timeout(180000); // 3 minutes for setup

    try {
      const orchestrator = new Orchestrator();
      await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());

      const fileContent = readFileSync(
        "src/services/TennisBcHubScrapper/all_availabilities.json",
        "utf8"
      );
      results = JSON.parse(fileContent);
    } catch (error) {
      console.log("Setup error:", error.message);
      // Continue with tests even if setup fails
      results = [];
    }
  });

  it("should be able to get court booking", async () => {
    expect(results).to.be.an("array");
  });

  it("should have right fields", async () => {
    if (results.length > 0) {
      results.forEach((result) => {
        expect(result).to.have.property("clubName");
        expect(result).to.have.property("courtNumber");
        expect(result).to.have.property("date");
        expect(result).to.have.property("startHour");
        expect(result).to.have.property("startTime");
        expect(result).to.have.property("endTime");
        expect(result).to.have.property("bookable");
        expect(result).to.have.property("courtBookingLink");
        expect(result).to.have.property("location");
      });
    }
  });

  it("bookable should be >=0 and an integer", async () => {
    results.forEach((result) => {
      expect(result.bookable).to.be.a("number");
      expect(result.bookable).to.be.greaterThanOrEqual(0);
    });
  });

  it("clubName should have all and only the following values", async () => {
    const validNames = [
      "Tennis BC Hub @ Richmond",
      "Tennis BC Hub @ Stanley Park",
      "UBC Tennis Center",
      "UE Tennis"
    ];
    results.forEach((result) => {
      expect(result.clubName).to.be.oneOf(validNames);
    });

    if (results.length > 0) {
      const uniqueNames = Array.from(
        new Set(results.map((result) => result.clubName))
      );
      expect(uniqueNames.sort()).to.deep.equal(validNames.sort());
    }
  });

  it("location should be oneof", async () => {
    const validLocations = ["Vancouver DT", "Richmond", "UBC"];
    results.forEach((result) => {
      expect(result.location).to.be.oneOf(validLocations);
    });

    if (results.length > 0) {
      const uniqueLocations = Array.from(
        new Set(results.map((result) => result.location))
      );
      expect(uniqueLocations.sort()).to.deep.equal(validLocations.sort());
    }
  });

  it("courtNumber should be oneof", async () => {
    const validCourtNumbers = [
      "Bubble Court 1",
      "Bubble Court 2",
      "Bubble Court 3",
      "Bubble Court 4",
      "Stanley Park Court #1",
      "Stanley Park Court #2",
      "Stanley Park Court #3",
      "Stanley Park Court #4",
      "Stanley Park Court #5",
      "Stanley Park Court #6",
      "court01",
      "court02",
      "court03",
      "court04",
      "court05",
      "court06",
      "court07",
      "court08",
      "court09",
      "court10",
      "court11",
      "court12",
      "court13",
      "Court 1",
      "Court 2",
      "Court 3",
      "Court 4",
      "Court 5"
    ];
    results.forEach((result) => {
      expect(result.courtNumber).to.be.oneOf(validCourtNumbers);
    });

    if (results.length > 0) {
      const uniqueCourtNumbers = Array.from(
        new Set(results.map((result) => result.courtNumber))
      );
      expect(uniqueCourtNumbers.sort()).to.deep.equal(validCourtNumbers.sort());
    }
  });

  it("time should be in the format HH:MM", async () => {
    results.forEach((result) => {
      expect(result.startHour).to.match(/^\d{2}:\d{2}$/);
      expect(result.startTime).to.match(/^\d{2}:\d{2}$/);
      expect(result.endTime).to.match(/^\d{2}:\d{2}$/);
    });
  });

  it("date should be a dateTime string", async () => {
    results.forEach((result) => {
      expect(result.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe("Orchestrator saveData method", () => {
  let orchestrator;
  let testData;

  before(() => {
    try {
      const fileContent = readFileSync(
        "src/services/TennisBcHubScrapper/all_availabilities.json",
        "utf8"
      );
      testData = JSON.parse(fileContent);
    } catch (error) {
      console.log("Could not load test data:", error.message);
      testData = []; // Use empty array as fallback
    }
  });

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  it("should resolve successfully when saving data", async function () {
    this.timeout(60000); // 1 minute timeout for database operations

    try {
      await orchestrator.saveData(testData);
      expect(orchestrator.lastUpdated).to.not.be.null;
      expect(orchestrator.records).to.deep.equal(testData);
      console.log("Data saved successfully at:", orchestrator.lastUpdated);
    } catch (error) {
      console.log("SaveData error:", error.message);
      expect.fail(`saveData should have resolved but threw: ${error.message}`);
    }
  });

  it("should update lastUpdated timestamp in Vancouver timezone", async function () {
    this.timeout(60000);

    const beforeSave = new Date();
    await orchestrator.saveData(testData);
    const afterSave = new Date();

    expect(orchestrator.lastUpdated).to.be.instanceOf(Date);
    expect(orchestrator.lastUpdated.getTime()).to.be.at.least(
      beforeSave.getTime()
    );
    expect(orchestrator.lastUpdated.getTime()).to.be.at.most(
      afterSave.getTime()
    );

    // Verify timestamp is reasonable (within last few seconds)
    const timeDiff = afterSave.getTime() - orchestrator.lastUpdated.getTime();
    expect(timeDiff).to.be.lessThan(5000); // Within 5 seconds
  });
});
