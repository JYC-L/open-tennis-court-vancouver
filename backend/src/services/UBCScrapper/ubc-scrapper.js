const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

class UbcTennisCenterScrapper {
  constructor() {
    this.baseUrl =
      "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility";
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
    this.knownLeftPositions = [2, 127, 252, 377, 502];
  }

  isoDateString(date) {
    return date.toISOString().split(".")[0];
  }

  getDayOffset(leftPx) {
    const closest = this.knownLeftPositions.reduce((a, b) =>
      Math.abs(b - leftPx) < Math.abs(a - leftPx) ? b : a
    );
    return this.knownLeftPositions.indexOf(closest);
  }

  extractLeftPx(style) {
    const m = style.match(/left:\s*([\d.]+)px/);
    return m ? parseFloat(m[1]) : null;
  }

  offsetDate(base, offset) {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  }

  convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  async fetchHtmlForCourt(page, facilityId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixDaysLater = new Date(today);
    sixDaysLater.setDate(today.getDate() + 5);

    const dates = [this.isoDateString(today), this.isoDateString(sixDaysLater)];
    const htmlData = [];

    for (const arrivalDate of dates) {
      const url = `${
        this.baseUrl
      }?facilityId=${facilityId}&arrivalDate=${encodeURIComponent(
        arrivalDate
      )}`;
      let attempts = 0;
      let html = null;

      while (attempts < 2) {
        try {
          await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
          await page.waitForSelector("div.k-event", { timeout: 30000 });
          html = await page.content();
          break;
        } catch (err) {
          attempts++;
          if (attempts === 2) throw err;
        }
      }

      htmlData.push({ html, dateLabel: arrivalDate.slice(0, 10) });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return htmlData;
  }

  extractSchedule(htmlDataArray, courtLabel, courtId) {
    const rows = [];

    for (const { html, dateLabel } of htmlDataArray) {
      const $ = cheerio.load(html);

      $("div.k-event").each((_, el) => {
        const style = $(el).attr("style");
        if (!style) return;

        const leftPx = this.extractLeftPx(style);
        if (leftPx === null) return;

        const date = this.offsetDate(dateLabel, this.getDayOffset(leftPx));
        const span = $(el).find("span[title]");
        if (!span.length) return;

        const timeRange = span.attr("title").trim();
        const [startTimeRaw, endTimeRaw] = timeRange.split("-");
        const startTime = this.convertTo24Hour(startTimeRaw.trim());
        const endTime = this.convertTo24Hour(endTimeRaw.trim());

        const statusNorm = span.text().trim().toLowerCase();
        let bookable = null;
        if (["book now", "reserve now"].includes(statusNorm)) {
          bookable = 0;
        } else if (statusNorm.includes("24hrs")) {
          bookable = 24;
        } else {
          return;
        }

        rows.push({
          clubName: "UBC Tennis Center",
          courtNumber: courtLabel,
          date,
          startHour: startTime,
          startTime: startTime,
          endTime: endTime,
          bookable,
          courtBookingLink: `${this.baseUrl}?facilityId=${courtId}`,
          location: "UBC",
        });
      });
    }

    return rows;
  }

  async getCourtBooking() {
    console.log("UBC Tennis Centre Scrapper Started.");
    const now = new Date();
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    });
    const allResults = [];

    for (const court of this.courts) {
      const page = await browser.newPage();
      await page.setUserAgent(
        "NonProfitFriendlyBot/1.0 (Purpose: UBC CS student project for tennis court availability, no commercial use.)"
      );
      const htmlData = await this.fetchHtmlForCourt(page, court.id);
      const results = this.extractSchedule(htmlData, court.label, court.id);
      allResults.push(...results);
      await page.close();
    }

    await browser.close();
    console.log(
      `UBC Tennis Centre Scrapper took ${
        (new Date().getTime() - now) / 1000
      } seconds.`
    );
    return allResults;
  }
}

module.exports = UbcTennisCenterScrapper;
