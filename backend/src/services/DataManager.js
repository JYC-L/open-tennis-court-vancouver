const fs = require('fs')
const path = require('path')

class AvailabilityManager {
  constructor() {
    this.freshnessCutoffMinutes = 30;
  }

  async getAvailability(clubName, date, startDate, endDate, requestedAt) {
    // Simulate DB fetch delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const filePath = path.join(__dirname, 'TennisBcHubScrapper', 'all_availabilities.json');
    console.log('Reading file from:', filePath);
    
    const buffer = fs.readFileSync(filePath, "utf8");
    const results = JSON.parse(buffer);

    // Return mocked availability data
    return results
  }
}

module.exports = AvailabilityManager;