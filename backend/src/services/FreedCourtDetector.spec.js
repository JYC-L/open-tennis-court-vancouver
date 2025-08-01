const { expect } = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const { findFreedCourts } = require("./FreedCourtDetector");

describe("FreedCourtDetector", () => {
  let fsStub;

  beforeEach(() => {
    // Stub fs.readFileSync to control CSV data
    fsStub = sinon.stub(fs, "readFileSync");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("1. Basic Functionality Tests", () => {
    it("should handle empty new_results array", () => {
      // Mock CSV with some data
      fsStub.returns(
        "clubName,courtNumber,date,startTime,bookable\nUBC,Court 1,2025-07-30,10:00,24"
      );

      const result = findFreedCourts([]);
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });

    it("should handle empty CSV file", () => {
      // Mock empty CSV
      fsStub.returns("clubName,courtNumber,date,startTime,bookable\n");

      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });

    it("should find perfect match - new slot that meets all 3 conditions", () => {
      // Mock CSV with latest time at 2025-07-31 15:00
      const csvData = `clubName,courtNumber,date,startTime,bookable
UBC,Court 1,2025-07-31,15:00,24
UE Tennis,Court 2,2025-07-30,14:00,0`;
      fsStub.returns(csvData);

      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-30", // Before latest (2025-07-31)
          startTime: "12:00", // Not in old data
          bookable: "0", // Immediately bookable
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(1);
      expect(result[0].clubName).to.equal("UBC");
      expect(result[0].startTime).to.equal("12:00");
    });

    it("should return empty array when no new results meet criteria", () => {
      const csvData = `clubName,courtNumber,date,startTime,bookable
UBC,Court 1,2025-07-31,15:00,24`;
      fsStub.returns(csvData);

      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-08-01",
          startTime: "10:00",
          bookable: "0",
        }, // After latest
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "24",
        }, // Not immediately bookable
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-31",
          startTime: "15:00",
          bookable: "0",
        }, // Exists in old data
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });
  });

  describe("3. Date/Time Boundary Tests", () => {
    beforeEach(() => {
      // Setup CSV with latest time at 2025-07-31 15:00
      const csvData = `clubName,courtNumber,date,startTime,bookable
UBC,Court 1,2025-07-31,15:00,24
UE Tennis,Court 2,2025-07-30,10:00,0`;
      fsStub.returns(csvData);
    });

    it("should include slots BEFORE latest time", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-07-31",
          startTime: "14:00",
          bookable: "0",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(1);
    });

    it("should include slots EQUAL to latest time", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-07-31",
          startTime: "15:00",
          bookable: "0",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(1);
    });

    it("should exclude slots AFTER latest time", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-07-31",
          startTime: "16:00",
          bookable: "0",
        }, // After
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-08-01",
          startTime: "10:00",
          bookable: "0",
        }, // Next day
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });

    it("should handle edge case - same date different times", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-07-31",
          startTime: "14:59",
          bookable: "0",
        }, // Before
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-07-31",
          startTime: "15:01",
          bookable: "0",
        }, // After
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(1);
      expect(result[0].startTime).to.equal("14:59");
    });
  });

  describe("4. Bookable Status Tests", () => {
    beforeEach(() => {
      const csvData = `clubName,courtNumber,date,startTime,bookable
UBC,Court 1,2025-07-31,15:00,24`;
      fsStub.returns(csvData);
    });

    it('should include bookable = "0" (immediately bookable)', () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 2",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(1);
    });

    it('should exclude bookable = "24" (not immediately bookable)', () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 2",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "24",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });

    it('should exclude bookable = "48" (not immediately bookable)', () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 2",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "48",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });

    it("should handle invalid bookable values", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 2",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: null,
        },
        {
          clubName: "UBC",
          courtNumber: "Court 3",
          date: "2025-07-30",
          startTime: "11:00",
          bookable: undefined,
        },
        {
          clubName: "UBC",
          courtNumber: "Court 4",
          date: "2025-07-30",
          startTime: "12:00",
          bookable: "",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });
  });

  describe("5. Data Quality Tests", () => {
    beforeEach(() => {
      const csvData = `clubName,courtNumber,date,startTime,bookable
UBC,Court 1,2025-07-31,15:00,24`;
      fsStub.returns(csvData);
    });

    it("should handle missing clubName", () => {
      const newResults = [
        {
          courtNumber: "Court 2",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      expect(() => findFreedCourts(newResults)).to.not.throw();
      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0); // Should not match due to missing field
    });

    it("should handle missing date field", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 2",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      expect(() => findFreedCourts(newResults)).to.not.throw();
    });

    it("should handle invalid date strings", () => {
      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 2",
          date: "invalid-date",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      expect(() => findFreedCourts(newResults)).to.not.throw();
    });

    it("should handle case sensitivity in court names", () => {
      const newResults = [
        {
          clubName: "ubc",
          courtNumber: "court 1",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        }, // lowercase
        {
          clubName: "UBC",
          courtNumber: "COURT 1",
          date: "2025-07-30",
          startTime: "11:00",
          bookable: "0",
        }, // uppercase
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(2); // Should treat as different courts
    });

    it("should handle whitespace in field values", () => {
      const newResults = [
        {
          clubName: " UBC ",
          courtNumber: " Court 2 ",
          date: "2025-07-30",
          startTime: " 10:00 ",
          bookable: "0",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(1);
    });
  });

  describe("6. CSV Parsing Tests", () => {
    it("should handle file not found error", () => {
      fsStub.throws(new Error("ENOENT: no such file or directory"));

      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      expect(() => findFreedCourts(newResults)).to.throw();
    });

    it("should handle malformed CSV", () => {
      fsStub.returns("invalid,csv,format\nwith,missing,headers");

      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      expect(() => findFreedCourts(newResults)).to.not.throw();
    });

    it("should handle CSV with only headers", () => {
      fsStub.returns("clubName,courtNumber,date,startTime,bookable");

      const newResults = [
        {
          clubName: "UBC",
          courtNumber: "Court 1",
          date: "2025-07-30",
          startTime: "10:00",
          bookable: "0",
        },
      ];

      const result = findFreedCourts(newResults);
      expect(result).to.have.length(0);
    });

    it("should handle large datasets efficiently", () => {
      // Generate large CSV data
      let csvData = "clubName,courtNumber,date,startTime,bookable\n";
      for (let i = 1; i <= 1000; i++) {
        csvData += `Club${i},Court 1,2025-07-${String((i % 28) + 1).padStart(
          2,
          "0"
        )},10:00,24\n`;
      }
      fsStub.returns(csvData);

      const newResults = [
        {
          clubName: "NewClub",
          courtNumber: "Court 1",
          date: "2025-07-15",
          startTime: "12:00",
          bookable: "0",
        },
      ];

      const startTime = Date.now();
      const result = findFreedCourts(newResults);
      const endTime = Date.now();

      expect(result).to.have.length(1);
      expect(endTime - startTime).to.be.lessThan(1000); // Should complete within 1 second
    });
  });
});
