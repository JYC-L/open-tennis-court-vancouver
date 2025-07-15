const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

class UbcTennisCenterScrapper {
  constructor() {
    this.baseUrl =
      "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility";
    this.apiUrl =
      "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/FacilityAvailability";
    this.facilityListUrl =
      "https://ubc.perfectmind.com/24063/Clients/BookMe4FacilityList/List?calendarId=e65c1527-c4f8-4316-b6d6-3b174041f00e&widgetId=c7c36ee3-2494-4de2-b2cb-d50a86487656&embed=False&singleCalendarWidget=true";
    this.widgetId = "c7c36ee3-2494-4de2-b2cb-d50a86487656";
    this.calendarId = "e65c1527-c4f8-4316-b6d6-3b174041f00e";
    this.courts = [
      { id: "c0668c1c-1fd6-4432-a20e-4c50aaad5baa", label: "court01" },
      { id: "e2d99dda-cdc4-4af4-8df6-6c8061ffd56f", label: "court02" },
      { id: "c117a102-0ba0-4aa8-b8cf-eb8a1480be55", label: "court03" },
      { id: "47f78e62-2ac0-4d39-8ffa-5d331f60e14e", label: "court04" },
      { id: "e5432c07-c2a6-46d1-a5d7-25c58567046c", label: "court05" },
      { id: "f7000b6c-0d93-472b-97af-e0f22915439f", label: "court06" },
      { id: "5dac0879-1fbb-4dfe-ac67-5dcaa925d2f5", label: "court07" },
      { id: "ccbf3aa0-f263-44eb-b394-a603115f587a", label: "court08" },
      { id: "9f475d76-dbc1-463e-9097-210f31681e2f", label: "court09" },
      { id: "d5894b7a-2b61-4345-a1a8-ea8a50c921ae", label: "court10" },
      { id: "d3a55644-6681-42a7-b8f5-09d796d35c07", label: "court11" },
      { id: "00dc0e70-6536-4a5a-b60b-9f6b0d0ba050", label: "court12" },
      { id: "308fd9d5-0de2-442e-8bd7-3fa6b607d170", label: "court13" },
    ];
  }

  async extractDetails(page, courtId) {
    const date = new Date().toISOString().split(".")[0] + "Z";
    const referer = `${this.baseUrl}?facilityId=${courtId}&widgetId=${this.widgetId}&calendarId=${this.calendarId}&arrivalDate=${date}&landingPageBackUrl=https%3A%2F%2Fubc.perfectmind.com%2F24063%2FClients%2FBookMe4FacilityList%2FList%3FwidgetId%3D${this.widgetId}%26calendarId%3D${this.calendarId}`;
    await page.goto(referer, { waitUntil: "domcontentloaded", timeout: 15000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const token = $('input[name="__RequestVerificationToken"]').attr("value");

    const scriptText = $("script")
      .map((i, el) => $(el).html())
      .get()
      .find((txt) => txt.includes("viewModel = new MainViewModel"));

    const facilityId = (scriptText.match(
      /facilityId:\s*['"]([a-f0-9-]+)['"]/
    ) || [])[1];
    const serviceId = (scriptText.match(/"ID":\s*["']([a-f0-9-]+)["']/) ||
      [])[1];
    const durationIdBlock = scriptText.match(/"DurationIDs"\s*:\s*\[(.*?)\]/s);
    const durationIds = durationIdBlock
      ? durationIdBlock[1].split(",").map((x) => x.replace(/['"\s]/g, ""))
      : [];

    return { token, facilityId, serviceId, durationIds, referer };
  }

  async fetchAvailability(page, details, court) {
    const { token, facilityId, serviceId, durationIds, referer } = details;
    const cookies = await page.cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const formData = new URLSearchParams();
    formData.append("facilityId", facilityId);
    formData.append("date", new Date().toISOString());
    formData.append("daysCount", "7");
    formData.append("duration", "60");
    formData.append("serviceId", serviceId);
    durationIds.forEach((id) => formData.append("durationIds[]", id));
    formData.append("__RequestVerificationToken", token);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Referer: referer,
        Origin: "https://ubc.perfectmind.com",
        "User-Agent": "Mozilla/5.0",
        Cookie: cookieHeader,
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData.toString(),
    });

    if (!response.ok) throw new Error("HTTP error " + response.status);
    const json = await response.json();

    const results = [];
    const availabilities = json.availabilities || [];

    for (const day of availabilities) {
      const timestamp = parseInt(day.Date.match(/\d+/)[0], 10);
      const dateObj = new Date(timestamp);
      const dateStr = dateObj.toISOString().split("T")[0];

      for (const group of day.BookingGroups || []) {
        for (const spot of group.AvailableSpots || []) {
          const { Time, Duration, IsDisabled, Title } = spot;
          const { Hours, Minutes } = Time || {};
          const durationMin = Duration?.TotalMinutes || 60;

          const startHourStr = `${String(Hours).padStart(2, "0")}:${String(
            Minutes
          ).padStart(2, "0")}`;
          const endDate = new Date(
            Date.UTC(
              dateObj.getUTCFullYear(),
              dateObj.getUTCMonth(),
              dateObj.getUTCDate(),
              Hours,
              Minutes
            )
          );
          const endTime = new Date(endDate.getTime() + durationMin * 60000);
          const endHourStr = `${String(endTime.getUTCHours()).padStart(
            2,
            "0"
          )}:${String(endTime.getUTCMinutes()).padStart(2, "0")}`;

          let bookable = null;
          if (!IsDisabled) bookable = 0;
          else if (IsDisabled && Title?.toLowerCase().includes("24hr"))
            bookable = 24;

          if (bookable !== null) {
            results.push({
              clubName: "UBC Tennis Center",
              courtNumber: court.label,
              date: dateStr,
              startHour: startHourStr,
              startTime: startHourStr,
              endTime: endHourStr,
              bookable: bookable,
              courtBookingLink: referer.split("&arrivalDate")[0],
              location: "UBC",
            });
          }
        }
      }
    }

    return results;
  }

  async getCourtBooking() {
    console.log("UBC Tennis Centre Scrapper Started.");
    const start = Date.now();
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const allResults = [];

    for (const court of this.courts) {
      const page = await browser.newPage();
      await page.goto(this.facilityListUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      try {
        console.log("Processing", court.label);
        const details = await this.extractDetails(page, court.id);
        const availability = await this.fetchAvailability(page, details, court);
        allResults.push(...availability);
      } catch (err) {
        console.error("Error processing", court.label, err.message);
      }

      await page.close();
    }

    await browser.close();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`UBC Tennis Centre Scrapping took ${duration} seconds.`);
    return allResults;
  }
}

module.exports = UbcTennisCenterScrapper;
