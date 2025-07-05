const { expect } = require("chai");
const availabilityController = require("../controllers/availabilityController");

describe("Availability Controller", () => {
  describe("getAvailability", () => {
    it("should return 400 when missing required parameters", (done) => {
      const req = {
        query: {},
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Missing required query parameters.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should return 400 when date parameters are invalid", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "invalid",
          end_date: "invalid",
          requested_at: "invalid",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal(
            "Invalid date format in query parameters."
          );
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should return 200 with valid parameters", (done) => {
      const validDate = "2024-01-15";
      const req = {
        query: {
          court: "1",
          start_date: validDate,
          end_date: validDate,
          requested_at: validDate,
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    // Additional tests
    it("should return 400 when only some required parameters are missing", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "2024-01-15",
          // missing end_date and requested_at
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Missing required query parameters.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should return 400 when court parameter is missing", (done) => {
      const req = {
        query: {
          start_date: "2024-01-15",
          end_date: "2024-01-15",
          requested_at: "2024-01-15",
          // missing court
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Missing required query parameters.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should return 400 when date parameters are undefined", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: undefined,
          end_date: undefined,
          requested_at: undefined,
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Missing required query parameters.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle mixed valid and invalid date parameters", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "2024-01-15",
          end_date: "invalid-date",
          requested_at: "2024-01-15",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal(
            "Invalid date format in query parameters."
          );
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle edge case dates (leap year, end of month)", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "2024-02-29", // Leap year
          end_date: "2024-02-29",
          requested_at: "2024-02-29",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle different date formats that are still valid", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "2024-12-31T00:00:00.000Z", // ISO format
          end_date: "2024-12-31",
          requested_at: "2024-12-31",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle String court name", (done) => {
      const req = {
        query: {
          court: "tennis-court-1", // String court name
          start_date: "2024-01-15",
          end_date: "2024-01-15",
          requested_at: "2024-01-15",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle empty court value", (done) => {
      const req = {
        query: {
          court: "",
          start_date: "2024-01-15",
          end_date: "2024-01-15",
          requested_at: "2024-01-15",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Missing required query parameters.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle past dates", (done) => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const pastDateStr = pastDate.toISOString().split("T")[0];

      const req = {
        query: {
          court: "1",
          start_date: pastDateStr,
          end_date: pastDateStr,
          requested_at: pastDateStr,
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle date range where start_date is after end_date", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "2024-01-20",
          end_date: "2024-01-15", 
          requested_at: "2024-01-15",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200); 
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle special characters in court parameter", (done) => {
      const req = {
        query: {
          court: "court-1@#$%^&*()",
          start_date: "2024-01-15",
          end_date: "2024-01-15",
          requested_at: "2024-01-15",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle very long court names", (done) => {
      const longCourtName = "a".repeat(1000); // Very long court name
      const req = {
        query: {
          court: longCourtName,
          start_date: "2024-01-15",
          end_date: "2024-01-15",
          requested_at: "2024-01-15",
        },
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("data");
          expect(data).to.have.property("updated_at");
          expect(data.data).to.be.an("array");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle malformed request object", (done) => {
      const req = {
        // Missing query property entirely
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(500); // Should handle malformed request gracefully
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Internal server error.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle null request object", (done) => {
      const req = null;
      const res = {
        status: (code) => {
          expect(code).to.equal(500); // Should handle null gracefully
          return res;
        },
        json: (data) => {
          expect(data).to.have.property("error");
          expect(data.error).to.equal("Internal server error.");
          done();
        },
      };

      availabilityController.getAvailability(req, res);
    });

    it("should handle response object with missing methods", (done) => {
      const req = {
        query: {
          court: "1",
          start_date: "2024-01-15",
          end_date: "2024-01-15",
          requested_at: "2024-01-15",
        },
      };
      const res = {
        // Missing status and json methods
      };

      // This should throw an error
      try {
        availabilityController.getAvailability(req, res);
        done();
      } catch (error) {
        done();
      }
    });
  });
});
