import { launch } from "puppeteer";

class bcHubInceptor {
  constructor(location) {
    this.locations = {
      richmond: {
        court_name: "Richmond",
        resource_fingerprint: "TBCHubRichmond"
      },
      stanley: {
        court_name: "Stanley",
        resource_fingerprint: "TBCHubStanleyPark"
      }
    };
    this.location =  location;
    this.target_url = null;
    this.roleId = null;
    this.startDate = null;
    this.endDate =  null;
  }

  async updateTargetURL() {
    const locKey = this.location.toLowerCase();
    const court = this.locations[locKey];
    if (!court) {
      throw new Error(`Location ${location} not found.`);
    }
    // Get both the resource fingerprint and the regex pattern.
    const resource_fingerprint = court.resource_fingerprint;
    const endpoint_pattern = this.#makeEndpointPattern(resource_fingerprint);
    const target_url = await scrape(endpoint_pattern, resource_fingerprint);
    this.target_url = target_url;
    const parsedUrl = new URL(this.target_url);
    this.roleId = extractTailNumber(this.target_url);
    this.startDate = parsedUrl.searchParams.get("startDate");
    this.endDate = parsedUrl.searchParams.get("endDate");
  }

  
  // Now the pattern is built using the resource_fingerprint.
  #makeEndpointPattern(resource_fingerprint) {
    const endpoint_pattern = `^https://clubspark\\.ca/v0/VenueBooking/${resource_fingerprint}/GetVenueSessions\\?resourceID=&startDate=\\d{4}-\\d{2}-\\d{2}&endDate=\\d{4}-\\d{2}-\\d{2}&roleId=&_=\\d+$`;

    return endpoint_pattern;
  }
}

async function scrape(endpoint_pattern, resource_fingerprint) {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  // Wrap the listener in a promise which resolves when the target URL is intercepted.
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
        console.log("Target Request URL:", url);
        resolve(url);
      }
      request.continue();
    });
  });

  await page.goto(
    `https://clubspark.ca/${resource_fingerprint}/Booking/bookbycourt`,
    {
      waitUntil: "networkidle2"
    }
  );

  let targetUrl;
  try {
    targetUrl = await Promise.race([
      targetPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Target request not found")), 1000)
      )
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
  // Convert the tail number to a number if desired:
  const match = url.match(/_=(\d+)$/);
  if (match && match[1]) {
    return Number(match[1]);
  }
  throw new Error("Tail number not found in URL");
}

export { bcHubInceptor };
