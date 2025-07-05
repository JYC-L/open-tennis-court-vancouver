"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UeTennisWebScrapper_1 = require("./UeTennisWebScrapper");
async function runScripper() {
    try {
        const scrapper = new UeTennisWebScrapper_1.UeTennisScrapper();
        await scrapper.getCourtBooking();
        await scrapper.writeJsonToDisk();
    }
    catch (err) {
        console.error("Error running scrapper:", err.message);
    }
}
runScripper().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
