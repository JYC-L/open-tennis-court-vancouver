"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Orchestrator_js_1 = require("./Orchestrator.js");
const mocha_1 = __importDefault(require("mocha"));
const chai = __importStar(require("chai"));
const { describe, it, before } = mocha_1.default;
const { expect } = chai;
const fs_1 = require("fs");
const sinon_1 = __importDefault(require("sinon"));
describe("Orchestrator scheduledUpdate", () => {
    let clock;
    let orchestrator;
    let callTimes;
    beforeEach(() => {
        clock = sinon_1.default.useFakeTimers();
        orchestrator = new Orchestrator_js_1.Orchestrator();
        callTimes = [];
    });
    afterEach(() => {
        clock.restore();
    });
    it("runs every 5 seconds", async () => {
        orchestrator.scheduledUpdate(5, 0, () => callTimes.push(clock.now));
        // Advance the clock in 5 second increments
        for (let i = 0; i < 4; i++) {
            clock.tick(5000);
            await Promise.resolve(); // allow timers to fire
        }
        chai.expect(callTimes.length).to.be.within(3, 4);
    });
    // it("has a random offset of -2 to +2 seconds", async () => {
    //   orchestrator.scheduledUpdate(5, 2, (time) => callTimes.push(time));
    //   clock.tick(20000);
    //   await Promise.resolve();
    //   // Check that the intervals between callTimes are between 3 and 7 seconds
    //   for (let i = 1; i < callTimes.length; i++) {
    //     const diff = (callTimes[i] - callTimes[i - 1]) / 1000;
    //     chai.expect(diff).to.be.within(3, 7);
    //   }
    // });
});
describe("Orchestrator onDemandUpdate", () => {
    let results;
    before(async function () {
        this.timeout(10 * 60 * 1000); // 10 minutes
        const orchestrator = new Orchestrator_js_1.Orchestrator();
        await orchestrator.onDemandUpdate(new Date(), new Date(), new Date());
        const fileContent = (0, fs_1.readFileSync)("src/services/TennisBcHubScrapper/all_availabilities.json", "utf8");
        results = JSON.parse(fileContent);
    });
    it("should be able to get court booking", async () => {
        expect(results).to.be.an("array");
    });
    it("should have right fields", async () => {
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
        const uniqueNames = Array.from(new Set(results.map((result) => result.clubName)));
        expect(uniqueNames.sort()).to.deep.equal(validNames.sort());
    });
    it("location should be oneof", async () => {
        const validLocations = ["Vancouver DT", "Richmond", "UBC"];
        results.forEach((result) => {
            expect(result.location).to.be.oneOf(validLocations);
        });
        const uniqueLocations = Array.from(new Set(results.map((result) => result.location)));
        expect(uniqueLocations.sort()).to.deep.equal(validLocations.sort());
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
        const uniqueCourtNumbers = Array.from(new Set(results.map((result) => result.courtNumber)));
        expect(uniqueCourtNumbers.sort()).to.deep.equal(validCourtNumbers.sort());
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
    // it("date should be in the future", async () => {
    //   const now = new Date();
    //   results.forEach((result) => {
    //     const resultDate = new Date(result.date);
    //     expect(resultDate.getDate()).to.be.greaterThanOrEqual(now.getDate());
    //   });
    // });
});
describe("Orchestrator pushToDB", () => {
    let orchestrator;
    let testData;
    before(() => {
        // Use the local JSON as test data
        const fileContent = (0, fs_1.readFileSync)("src/services/TennisBcHubScrapper/all_availabilities.json", "utf8");
        testData = JSON.parse(fileContent);
    });
    beforeEach(() => {
        orchestrator = new Orchestrator_js_1.Orchestrator();
    });
    it("should resolve successfully when pushing data to DB", async function () {
        this.timeout(30000); // 30 seconds timeout for database operations
        // This will actually call the real repository method
        try {
            await orchestrator.pushToDB(testData);
            // If we get here, the promise resolved successfully
            expect(true).to.be.true; // This will always pass if we reach this point
        }
        catch (error) {
            // If there's any error, fail the test
            expect.fail(`pushToDB should have resolved but threw: ${error.message}`);
        }
    });
});
