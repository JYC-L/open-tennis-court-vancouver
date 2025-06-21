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
const mocha_1 = __importDefault(require("mocha"));
const chai = __importStar(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const fs_1 = require("fs");
const { describe, it, beforeEach, afterEach } = mocha_1.default;
const { expect } = chai;
const DataManager_js_1 = __importDefault(require("./DataManager.js"));
describe("AvailabilityManager.getAvailability", () => {
    let manager, repoStub, orchestratorStub, fakeRepo, fakeOrchestrator, testData;
    before(() => {
        // Use the local JSON as test data
        const fileContent = (0, fs_1.readFileSync)("src/services/TennisBcHubScrapper/all_availabilities.json", "utf8");
        testData = JSON.parse(fileContent);
    });
    beforeEach(() => {
        // Fake repository with stubbed methods
        fakeRepo = {
            getLastUpdatedTimestamp: sinon_1.default.stub(),
            getAllAvailabilityAsArr: sinon_1.default.stub()
        };
        // Fake orchestrator with stubbed method
        fakeOrchestrator = {
            onDemandUpdate: sinon_1.default.stub().resolves()
        };
        // Patch the constructor to use our fake repo
        DataManager_js_1.default.prototype.courtScheduleRepository = fakeRepo;
        manager = new DataManager_js_1.default(fakeOrchestrator);
    });
    afterEach(() => {
        sinon_1.default.restore();
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
        }
        catch (err) {
            expect(err.message).to.include("Orchestrator error");
        }
    });
});
describe("AvailabilityManager Integration with Repository", () => {
    let manager, fakeOrchestrator, testData;
    before(() => {
        // Use the local JSON as test data
        const fileContent = (0, fs_1.readFileSync)("src/services/TennisBcHubScrapper/all_availabilities.json", "utf8");
        testData = JSON.parse(fileContent);
    });
    beforeEach(() => {
        // Fake orchestrator with stubbed method
        fakeOrchestrator = {
            onDemandUpdate: sinon_1.default.stub().resolves()
        };
        // Create manager with real repository (no mocking)
        manager = new DataManager_js_1.default(fakeOrchestrator);
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it("calls getLastUpdatedTimestamp when checking freshness", async () => {
        const now = new Date();
        const repoSpy = sinon_1.default.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
        // Mock the repository to return a fresh timestamp
        repoSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
        await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
        expect(repoSpy.calledOnce).to.be.true;
    });
    it("calls getAllAvailabilityAsArr when data is fresh", async () => {
        const now = new Date();
        const getLastUpdatedSpy = sinon_1.default.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
        const getAllAvailabilitySpy = sinon_1.default.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
        // Mock the repository to return a fresh timestamp and data
        getLastUpdatedSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
        getAllAvailabilitySpy.resolves(testData);
        await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
        expect(getAllAvailabilitySpy.calledOnce).to.be.true;
    });
    it("calls getAllAvailabilityAsArr after orchestrator completes", async () => {
        const now = new Date();
        const getLastUpdatedSpy = sinon_1.default.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
        const getAllAvailabilitySpy = sinon_1.default.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
        // Mock the repository to return a stale timestamp and data
        getLastUpdatedSpy.resolves(new Date(now.getTime() - 60 * 60 * 1000));
        getAllAvailabilitySpy.resolves(testData);
        await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
        // Should be called twice: once for stale check, once after orchestrator
        expect(getAllAvailabilitySpy.calledTwice).to.be.true;
    });
    it("throws database error when repository throws", async () => {
        const now = new Date();
        const getLastUpdatedSpy = sinon_1.default.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
        const getAllAvailabilitySpy = sinon_1.default.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
        // Mock the repository to return a fresh timestamp but throw on getAllAvailabilityAsArr
        getLastUpdatedSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
        getAllAvailabilitySpy.rejects(new Error("Database connection failed"));
        try {
            await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
            throw new Error("Should have thrown");
        }
        catch (err) {
            expect(err.message).to.include("Database error");
        }
    });
    it("handles empty data from repository", async () => {
        const now = new Date();
        const getLastUpdatedSpy = sinon_1.default.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
        const getAllAvailabilitySpy = sinon_1.default.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
        // Mock the repository to return a fresh timestamp but empty data
        getLastUpdatedSpy.resolves(new Date(now.getTime() - 5 * 60 * 1000));
        getAllAvailabilitySpy.resolves([]);
        const result = await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
        expect(result).to.deep.equal([]);
    });
    it("handles null lastUpdated timestamp", async () => {
        const now = new Date();
        const getLastUpdatedSpy = sinon_1.default.spy(manager.courtScheduleRepository, "getLastUpdatedTimestamp");
        const getAllAvailabilitySpy = sinon_1.default.spy(manager.courtScheduleRepository, "getAllAvailabilityAsArr");
        // Mock the repository to return null timestamp (no data exists)
        getLastUpdatedSpy.resolves(null);
        getAllAvailabilitySpy.resolves(testData);
        await manager.getAvailability("Tennis BC Hub @ Richmond", "2025-06-19", now, now, now);
        // Should call orchestrator since data is not fresh (null timestamp)
        expect(fakeOrchestrator.onDemandUpdate.calledOnce).to.be.true;
    });
});
