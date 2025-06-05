const UbcTennisCenterScrapper = require('./ubc-scrapper.js'); // path to your file

(async () => {
  const scraper = new UbcTennisCenterScrapper();
  const results = await scraper.getCourtBooking();
  console.log(JSON.stringify(results, null, 2)); // Pretty print results
})();
