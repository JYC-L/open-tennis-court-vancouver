"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const TennisBcHubScrapper_js_1 = require("./TennisBcHubScrapper.js");
(0, mocha_1.describe)("TennisBcHubScrapper", function () {
    this.timeout(60000);
    let scrapper, bookings;
    //   describe("interceptURLPrams() for a valid location", function () {
    //   before(async () => {
    //     uRLPrams = await scrapper.interceptURLPrams();
    //   });
    //     it('should update targetUrl, startDate, endDate and roleId for location "stanley"', () => {
    //       expect(uRLPrams["stanley"].targetUrl).to.match(
    //         /^https:\/\/clubspark\.ca\/v0\/VenueBooking\/TBCHubStanleyPark\/GetVenueSessions\?resourceID=&startDate=\d{4}-\d{2}-\d{2}&endDate=\d{4}-\d{2}-\d{2}&roleId=&_=\d+$/
    //       );
    //       expect(uRLPrams["stanley"].startDate).to.match(
    //         /^\d{4}-\d{2}-\d{2}$/
    //       );
    //       expect(uRLPrams["stanley"].endDate).to.match(
    //         /^\d{4}-\d{2}-\d{2}$/
    //       );
    //       expect(uRLPrams["stanley"].roleId).to.be.a("number");
    //     });
    //     it('should update targetUrl, startDate, endDate and roleId for location "richmond"', () => {
    //       expect(uRLPrams["richmond"].targetUrl).to.match(
    //         /^https:\/\/clubspark\.ca\/v0\/VenueBooking\/TBCHubRichmond\/GetVenueSessions\?resourceID=&startDate=\d{4}-\d{2}-\d{2}&endDate=\d{4}-\d{2}-\d{2}&roleId=&_=\d+$/
    //       );
    //       expect(uRLPrams["richmond"].startDate).to.match(
    //         /^\d{4}-\d{2}-\d{2}$/
    //       );
    //       expect(uRLPrams["richmond"].endDate).to.match(
    //         /^\d{4}-\d{2}-\d{2}$/
    //       );
    //       expect(uRLPrams["richmond"].roleId).to.be.a("number");
    //     });
    //   });
    (0, mocha_1.before)(async () => {
        scrapper = new TennisBcHubScrapper_js_1.TennisBcHubScrapper();
        bookings = await scrapper.getCourtBooking();
    });
    (0, mocha_1.it)("should return an array of bookings", () => {
        (0, chai_1.expect)(bookings).to.be.an("array");
        (0, chai_1.expect)(bookings.length).to.be.greaterThan(0);
    });
    (0, mocha_1.it)("each booking should have the required fields", () => {
        const requiredFields = [
            "clubName",
            "courtNumber",
            "date",
            "startHour",
            "startTime",
            "endTime",
            "bookable",
            "courtBookingLink",
            "location"
        ];
        bookings.forEach((booking) => {
            requiredFields.forEach((field) => {
                (0, chai_1.expect)(booking).to.have.property(field);
            });
        });
    });
    (0, mocha_1.it)("should contain at least one booking for each location", () => {
        const locations = new Set(bookings.map((b) => b.location));
        (0, chai_1.expect)(locations.has("Richmond") || locations.has("Stanley")).to.be.true;
    });
    (0, mocha_1.it)("should have date in YYYY-MM-DD format", () => {
        bookings.forEach((booking) => {
            (0, chai_1.expect)(booking.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
    (0, mocha_1.it)("should repeat dates for multiple courts/sessions", () => {
        const dateCounts = {};
        bookings.forEach((b) => {
            dateCounts[b.date] = (dateCounts[b.date] || 0) + 1;
        });
        // At least one date should appear more than once
        const repeated = Object.values(dateCounts).some((count) => count > 1);
        (0, chai_1.expect)(repeated).to.be.true;
    });
});
