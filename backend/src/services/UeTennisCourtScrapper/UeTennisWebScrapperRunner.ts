import { UeTennisScrapper } from "./UeTennisWebScrapper";

async function runScripper(): Promise<void> {
  try {
    const scrapper = new UeTennisScrapper();
    await scrapper.getCourtBooking();
  } catch (err: any) {
    console.error("Error running scrapper:", err.message);
  }
}

runScripper().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
