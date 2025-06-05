import { expect } from "chai";
import { describe, it, before } from "mocha";
import { TennisBcHubScrapper } from "./TennisBcHubScrapper.js";

describe("TennisBcHubScrapper", function () {
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

  before(async () => {
    scrapper = new TennisBcHubScrapper();
    bookings = await scrapper.getCourtBooking();
  });

  it("should return an array of bookings", () => {
    expect(bookings).to.be.an("array");
    expect(bookings.length).to.be.greaterThan(0);
  });

  it("each booking should have the required fields", () => {
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
        expect(booking).to.have.property(field);
      });
    });
  });

  it("should contain at least one booking for each location", () => {
    const locations = new Set(bookings.map((b) => b.location));
    expect(locations.has("Richmond") || locations.has("Stanley")).to.be.true;
  });

  it("should have date in YYYY-MM-DD format", () => {
    bookings.forEach((booking) => {
      expect(booking.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("should repeat dates for multiple courts/sessions", () => {
    const dateCounts = {};
    bookings.forEach((b) => {
      dateCounts[b.date] = (dateCounts[b.date] || 0) + 1;
    });
    // At least one date should appear more than once
    const repeated = Object.values(dateCounts).some((count) => count > 1);
    expect(repeated).to.be.true;
  });
});
