const { expect } = require('chai');
const availabilityController = require('../controllers/availabilityController');

describe('Availability Controller', () => {
  describe('getAvailability', () => {
    it('should return 400 when missing required parameters', (done) => {
      const req = {
        query: {}
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property('error');
          expect(data.error).to.equal('Missing required query parameters.');
          done();
        }
      };

      availabilityController.getAvailability(req, res);
    });

    it('should return 400 when date parameters are invalid', (done) => {
      const req = {
        query: {
          court: '1',
          start_date: 'invalid',
          end_date: 'invalid',
          requested_at: 'invalid'
        }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(400);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property('error');
          expect(data.error).to.equal('Invalid date format in query parameters.');
          done();
        }
      };

      availabilityController.getAvailability(req, res);
    });

    it('should return 200 with valid parameters', (done) => {
      const validDate = '2024-01-15';
      const req = {
        query: {
          court: '1',
          start_date: validDate,
          end_date: validDate,
          requested_at: validDate
        }
      };
      const res = {
        status: (code) => {
          expect(code).to.equal(200);
          return res;
        },
        json: (data) => {
          expect(data).to.have.property('data');
          expect(data).to.have.property('updated_at');
          expect(data.data).to.be.an('array');
          done();
        }
      };

      availabilityController.getAvailability(req, res);
    });
  });
});

after(() => {
  process.exit(0);
});
