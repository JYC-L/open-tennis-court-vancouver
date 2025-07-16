const puppeteer = require("puppeteer");
const save_to_csv = require("saveBookingsToCSV");
const fs = require("fs");

async function scrapeCourt02() {
  console.log("Starting UBC Tennis Court scraper...");

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true to hide browser window
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  // Set up response interception
  const availabilityData = [];

  page.on("response", async (response) => {
    const url = response.url();

    // Intercept the facility availability API call
    if (
      url.includes("FacilityAvailability") &&
      response.request().method() === "POST"
    ) {
      console.log("✅ Intercepted availability API call:", url);

      try {
        const jsonData = await response.json();
        console.log("📦 Raw API response received");

        // Parse the availability data
        const parsedData = parseAvailabilityData(jsonData);
        availabilityData.push(...parsedData);

        console.log(`📅 Found ${parsedData.length} available time slots`);
      } catch (error) {
        console.error("❌ Error parsing JSON response:", error);
      }
    }
  });

  try {
    // Navigate to Court 02 facility page
    const court02Url =
      "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f&widgetId=c7c36ee3-2494-4de2-b2cb-d50a86487656&calendarId=e65c1527-c4f8-4316-b6d6-3b174041f00e";

    console.log("🌐 Navigating to Court 02 page...");
    await page.goto(court02Url, { waitUntil: "networkidle0" });

    console.log("✅ Page loaded successfully");

    // Wait a bit to ensure all API calls are complete
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Output results
    if (availabilityData.length > 0) {
      console.log("\n📊 AVAILABILITY SUMMARY:");
      console.log("========================");

      // Group by date
      const byDate = {};
      availabilityData.forEach((slot) => {
        if (!byDate[slot.date]) byDate[slot.date] = [];
        byDate[slot.date].push(slot);
      });

      Object.keys(byDate)
        .sort()
        .forEach((date) => {
          console.log(`\n📅 ${date}:`);
          byDate[date].forEach((slot) => {
            console.log(
              `  ⏰ ${slot.time} (${slot.duration}min) - ${slot.group}`
            );
          });
        });

      // Save to file
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `court02_availability_${timestamp}.json`;

      fs.writeFileSync(
        filename,
        JSON.stringify(
          {
            court: "Court 02",
            scraped_at: new Date().toISOString(),
            total_slots: availabilityData.length,
            availability: availabilityData,
          },
          null,
          2
        )
      );

      console.log(`\n💾 Data saved to: ${filename}`);
    } else {
      console.log(
        "⚠️  No availability data found. Check if the page loaded correctly."
      );
    }
  } catch (error) {
    console.error("❌ Error during scraping:", error);
  }

  await browser.close();
  console.log("\n✅ Scraping completed!");
}

function parseAvailabilityData(jsonData) {
  const slots = [];

  try {
    const availabilities = jsonData.availabilities || [];

    availabilities.forEach((dayData) => {
      // Parse the weird .NET date format: /Date(1752278400000)/
      const dateMatch = dayData.Date.match(/\/Date\((\d+)\)\//);
      if (!dateMatch) return;

      const timestamp = parseInt(dateMatch[1]);
      const date = new Date(timestamp).toISOString().split("T")[0];

      // Extract time slots from booking groups
      const bookingGroups = dayData.BookingGroups || [];

      bookingGroups.forEach((group) => {
        const groupName = group.Name;
        const availableSpots = group.AvailableSpots || [];

        availableSpots.forEach((spot) => {
          if (!spot.IsDisabled) {
            const time = spot.Time;
            const duration = spot.Duration;

            slots.push({
              date: date,
              time: `${time.Hours.toString().padStart(
                2,
                "0"
              )}:${time.Minutes.toString().padStart(2, "0")}`,
              duration: duration.TotalMinutes,
              group: groupName,
              title: spot.Title,
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("❌ Error parsing availability data:", error);
  }

  return slots;
}

// Run the scraper
scrapeCourt02().catch(console.error);
