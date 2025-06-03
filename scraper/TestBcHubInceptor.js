import { expect } from "chai";
import { describe, it, before } from "mocha";
import { bcHubInceptor } from "./BcHubInceptor.js";

describe("bcHubInceptor", function () {
  // Puppeteer tests can be a bit slow
  this.timeout(30000);

  describe("Stanley", function () {
    let stanley;

    before(async () => {
      stanley = new bcHubInceptor("stanley");
      await stanley.updateTargetURL();
    });

    it("should have correct target_url", () => {
      // Update the expected URL as necessary.
      const expectedURL =
        "https://clubspark.ca/v0/VenueBooking/TBCHubStanleyPark/GetVenueSessions?resourceID=&startDate=2025-06-02&endDate=2025-06-08&roleId=&_=1748927857031";
      expect(stanley.target_url).to.equal(expectedURL);
    });
    it("should have correct start date",()=>{
      expect(stanley.startDate).to.equal("2025-06-02");
    })
    it("should have correct end date",()=>{
      expect(stanley.endDate).to.equal("2025-06-08");
    })
    it("should have valid roleID",()=>{
      expect(stanley.roleId).to.be.a("number");
    })
  });

  describe("Richmond", function () {
    let richmond;

    before(async () => {
      richmond = new bcHubInceptor("Richmond");
      await richmond.updateTargetURL();
    });

    it("should have correct target_url", () => {
      // Update the expected URL as necessary.
      const expectedURL =
        "https://clubspark.ca/v0/VenueBooking/TBCHubStanleyPark/GetVenueSessions?resourceID=&startDate=2025-06-02&endDate=2025-06-08&roleId=&_=1748927857031";
      expect(richmond.target_url).to.equal(expectedURL);
    });
    it("should have correct start date",()=>{
      expect(richmond.startDate).to.equal("2025-06-02");
    })
    it("should have correct end date",()=>{
      expect(richmond.endDate).to.equal("2025-06-08");
    })
    it("should have valid roleID",()=>{
      expect(richmond.roleId).to.be.a("number");
    })
  });
});