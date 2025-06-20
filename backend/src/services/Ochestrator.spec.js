import { Orchestrator } from './Orchestrator.js';
import pkg from 'mocha';
import * as chai from 'chai';
const { describe, it, before } = pkg;
const { expect } = chai;
import { readFileSync } from 'fs';

let results;
before(async function() {
  this.timeout(10 * 60 * 1000); // 10 minutes
//   const orchestrator = new Orchestrator();
//   await orchestrator.onDemandUpdate(
//     new Date(),
//     new Date(),
//     new Date()
//   );
  const fileContent = readFileSync('src/services/TennisBcHubScrapper/all_availabilities.json', 'utf8');
  results = JSON.parse(fileContent);
});

describe('Orchestrator', () => {
  it('should be able to get court booking', async () => {
    expect(results).to.be.an('array');
  });
  it('should have right fields', async () => {
    results.forEach(result => {
      expect(result).to.have.property('clubName');
      expect(result).to.have.property('courtNumber');
      expect(result).to.have.property('date');
      expect(result).to.have.property('startHour');
      expect(result).to.have.property('startTime');
      expect(result).to.have.property('endTime');
      expect(result).to.have.property('bookable');
      expect(result).to.have.property('courtBookingLink');
      expect(result).to.have.property('location');
    });
  });
  it('bookable should be >=0 and an integer', async () => {
    results.forEach(result => {
      expect(result.bookable).to.be.a('number');
      expect(result.bookable).to.be.greaterThanOrEqual(0);
    });
  });
  it('clubName should have all and only the following values', async () => {
    const validNames = ['Tennis BC Hub @ Richmond', 'Tennis BC Hub @ Stanley Park',
        'UBC Tennis Center', 'UE Tennis'];
    results.forEach(result => {
      expect(result.clubName).to.be.oneOf(validNames);
    });
    const uniqueNames = Array.from(new Set(results.map(result => result.clubName)));
    expect(uniqueNames.sort()).to.deep.equal(validNames.sort());
  });
  it('location should be oneof', async () => {
    const validLocations = ['Vancouver DT', 'Richmond', 'UBC'];
    results.forEach(result => {
      expect(result.location).to.be.oneOf(validLocations);
    });
    const uniqueLocations = Array.from(new Set(results.map(result => result.location)));
    expect(uniqueLocations.sort()).to.deep.equal(validLocations.sort());
  });
  it('courtNumber should be oneof', async () => {
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
    results.forEach(result => {
      expect(result.courtNumber).to.be.oneOf(validCourtNumbers);
    });
    const uniqueCourtNumbers = Array.from(new Set(results.map(result => result.courtNumber)));
    expect(uniqueCourtNumbers.sort()).to.deep.equal(validCourtNumbers.sort());
  });
  it("time should be in the format HH:MM", async () => {
    results.forEach(result => {
      expect(result.startHour).to.match(/^\d{2}:\d{2}$/);
      expect(result.startTime).to.match(/^\d{2}:\d{2}$/);
      expect(result.endTime).to.match(/^\d{2}:\d{2}$/);
    });
  });
  it("date should be a dateTime string", async () => {
    results.forEach(result => {
      expect(result.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
  it("date should be in the future", async () => {
    const now = new Date();
    results.forEach(result => {
      const resultDate = new Date(result.date);
      expect(resultDate.getDate()).to.be.greaterThanOrEqual(now.getDate());
    });
  });
})
