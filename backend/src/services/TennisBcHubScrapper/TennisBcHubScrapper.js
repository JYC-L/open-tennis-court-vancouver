const { launch } = require("puppeteer");
const { makecourtBookingLink } = require("./makecourtBookingLink.js");

class TennisBcHubScrapper {
  constructor() {
    this.locationInfo = {
      richmond: {
        courtName: "Richmond",
        resourceFingerprint: "TBCHubRichmond",
        displayName: "Tennis BC Hub @ Richmond",
        location: "Richmond",
      },
      stanley: {
        courtName: "Stanley",
        resourceFingerprint: "TBCHubStanleyPark",
        displayName: "Tennis BC Hub @ Stanley Park",
        location: "Vancouver DT",
      },
    };
  }

  async getCourtBooking() {
    console.log("Tennis BC Hub Scrapper Started.");
    const now = new Date();
    const urlParamsByLocation = await this.interceptURLPrams();
    const bookings = [];

    // Build an array of fetch promises using async/await
    const fetchPromises = Object.entries(urlParamsByLocation).map(
      async ([locKey, params]) => {
        const url = params.targetUrl;
        const headers = {
          "User-Agent":
            "NonProfitFriendlyBot/1.0 (Purpose: UBC CS student project for tennis court availability, no commercial use.)",
        };
        try {
          const response = await fetch(url, { headers });
          if (!response.ok) {
            throw new Error(`Failed to fetch data. Status:${response.status}.`);
          }
          const data = await response.json();
          // Return an object with locKey and the resources data.
          return { locKey, resources: data.Resources };
        } catch (err) {
          console.error("Fetch failed:", err);
          return { locKey, resources: [] }; // Return empty array on error
        }
      }
    );

    // Wait for all fetch promises to resolve
    const allResults = await Promise.all(fetchPromises);

    // Process all fetched results
    for (const { locKey, resources } of allResults) {
      if (!Array.isArray(resources)) continue; // Defensive: skip if not an array
      for (const resource of resources) {
        const courtNumber = resource.Name;
        const days = resource.Days || [];
        for (const day of days) {
          const date = (day.Date || "").split("T")[0];
          const sessions = day.Sessions || [];
          for (const session of sessions) {
            if (
              session.Name.includes("All court times & fees") ||
              session.Name.includes("Default")
            )
              bookings.push({
                clubName: this.locationInfo[locKey].displayName,
                courtNumber,
                date,
                startHour: minutesToTime(
                  date,
                  Math.floor(session.StartTime / 60) * 60
                ),
                startTime: minutesToTime(date, session.StartTime),
                endTime: minutesToTime(date, session.EndTime),
                bookable: makeBookableValue(date, session.StartTime),
                // Pass needed parameters to construct the URL:
                courtBookingLink: makecourtBookingLink(
                  locKey,
                  courtNumber,
                  this.locationInfo
                ),
                location: this.locationInfo[locKey].location,
              });
          }
        }
      }
    }

    console.log(
      `TennisBCScrapper took ${
        (new Date().getTime() - now.getTime()) / 1000
      } seconds.`
    );
    return bookings;
  }

  // Private method: update for all locations and return an object keyed by location.
  async interceptURLPrams() {
    const results = {};
    for (const locKey of Object.keys(this.locationInfo)) {
      const { resourceFingerprint } = this.locationInfo[locKey];
      const endpoint_pattern = this.#makeEndpointPattern(resourceFingerprint);
      const targetUrl = await scrape(endpoint_pattern, resourceFingerprint);
      const parsedUrl = new URL(targetUrl);

      // Get the original start date from the target URL
      const startDateStr = parsedUrl.searchParams.get("startDate");
      const startDate = new Date(startDateStr);

      // Calculate the new end date: two weeks (14 days) total = start date + 13 days
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 13);

      // Formatter to YYYY-MM-DD
      const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      // Update the search parameter with the new end date
      parsedUrl.searchParams.set("endDate", formatDate(endDate));

      results[locKey] = {
        targetUrl: parsedUrl.toString(),
        roleId: extractTailNumber(targetUrl),
        startDate: startDateStr,
        endDate: formatDate(endDate),
      };
    }
    return results;
  }

  #makeEndpointPattern(resource_fingerprint) {
    return `^https:\\/\\/clubspark\\.ca\\/v0\\/VenueBooking\\/${resource_fingerprint}\\/GetVenueSessions\\?resourceID=&startDate=\\d{4}-\\d{2}-\\d{2}&endDate=\\d{4}-\\d{2}-\\d{2}&roleId=&_=\\d+$`;
  }
}

async function scrape(endpoint_pattern, resource_fingerprint) {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "NonProfitFriendlyBot/1.0 (Purpose: UBC CS student project for tennis court availability, no commercial use.)"
  );

  await page.setRequestInterception(true);

  const targetPromise = new Promise((resolve, reject) => {
    let found = false;
    page.on("request", (request) => {
      if (found) {
        request.continue();
        return;
      }
      const url = request.url();
      const regEx = new RegExp(endpoint_pattern);
      if (regEx.test(url)) {
        found = true;
        // console.log("Target Request URL:", url);
        resolve(url);
      }
      request.continue();
    });
  });

  await page.goto(
    `https://clubspark.ca/${resource_fingerprint}/Booking/bookbycourt`,
    { waitUntil: "networkidle2" }
  );

  let targetUrl;
  try {
    targetUrl = await Promise.race([
      targetPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Target request not found")), 1000)
      ),
    ]);
  } catch (error) {
    await browser.close();
    throw error;
  }

  await browser.close();
  console.log(targetUrl);
  return targetUrl;
}

function extractTailNumber(url) {
  const match = url.match(/_=(\d+)$/);
  if (match && match[1]) {
    return Number(match[1]);
  }
  throw new Error("Tail number not found in URL");
}

function minutesToTime(sessionDate, minutes) {
  const baseDate = new Date(sessionDate);
  baseDate.setHours(0);
  baseDate.setMinutes(minutes);
  return baseDate.toTimeString().slice(0, 5);
}

function makeBookableValue(dateString, minutes) {
  // Create a Date object based on dateString and set time to midnight.
  const sessionTime = new Date(dateString);
  sessionTime.setHours(0, 0, 0, 0);

  // Round down the provided minutes to the nearest 30.
  const roundedMinutes = Math.floor(minutes / 30) * 30;
  sessionTime.setMinutes(roundedMinutes);

  // Get current time.
  const now = new Date();

  // Calculate the difference in milliseconds and convert to hours.
  const distanceMs = sessionTime.getTime() - now.getTime();
  const distanceHours = distanceMs / (1000 * 60 * 60);

  // Define 7 days in hours.
  const sevenDaysHours = 7 * 24;

  // If the session is more than seven days in the future, return the hours difference; otherwise return 0.
  return distanceHours > sevenDaysHours ? distanceHours : 0;
}

module.exports = { TennisBcHubScrapper, makeBookableValue };
