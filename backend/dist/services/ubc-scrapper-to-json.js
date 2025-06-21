const fs = require("fs");
const path = require("path");
const UbcTennisCenterScrapper = require("./ubc-scrapper");
(async () => {
    const scrapper = new UbcTennisCenterScrapper();
    try {
        const results = await scrapper.getCourtBooking();
        const filePath = path.join(__dirname, "ubc-tennis-results.json");
        fs.writeFileSync(filePath, JSON.stringify(results, null, 2), "utf-8");
        console.log(`✅ Results saved to ${filePath}`);
    }
    catch (error) {
        console.error("❌ Error while scraping:", error);
    }
})();
