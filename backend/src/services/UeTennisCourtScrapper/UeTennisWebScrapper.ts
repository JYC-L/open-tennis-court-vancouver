import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import axios from "axios";
import path from "path";
import { time, timeStamp } from "console";
import { request } from "http";
import { start } from "repl";

export type CourtAvailability = {
  clubName: string;
  courtNumber: string;
  date: string;
  startHour: string;
  startTime: string;
  endTime: string;
  bookable: number;
  courtBookingLink: string;
  location: string;
};

export class UeTennisScrapper {
  private browser!: Browser;
  private page!: Page;
  private authToken: string | null = null;
  private serviceIds: Record<number, string> = {};
  private allAvailability: CourtAvailability[] = [];
  private readonly baseUrl: string = "https://www.uetennis.com";
  private readonly bookingOnlineUrl: string = `${this.baseUrl}/book-online`;
  private readonly bookingCalendar1Url: string = `https://www.uetennis.com/booking-calendar/court-1?referral=service_list_widget`;
  private readonly bookingLinks: { [courtName: string]: string } = {
    "Court 1":
      "http://www.uetennis.com/booking-calendar/court-1?referral=service_list_widget",
    "Court 2":
      "http://www.uetennis.com/booking-calendar/court-2?referral=service_list_widget",
    "Court 3":
      "http://www.uetennis.com/booking-calendar/court-3?referral=service_list_widget",
    "Court 5":
      "http://www.uetennis.com/booking-calendar/court-5?referral=service_list_widget",
  };
  private readonly clubName = "UE Tennis";

  public async getCourtBooking(): Promise<any[]> {
    const scrappingStartTime = new Date().toISOString();
    console.log(
      "Starting UE Tennis court booking scrapper...",
      scrappingStartTime
    );
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
    // Capture authorization token from network requests
    await this.captureAuthToken();
    await this.goToBookingCalendarPage();
    //let the page to hang there for expected request
    await this.page.waitForRequest((request) => {
      return (
        request.url().includes("/availability/query") &&
        !!request.headers()["authorization"]
      );
    });
    await this.goToBookingOnlinePage();

    // // Extract serviceIds dynamically (replace selector accordingly)
    await this.extractAndSetServiceIds();

    await this.queryAvailability();
    const scrappingEndTime = new Date().toISOString();
    console.log("web scrapping finished.", scrappingEndTime);
    const durationMs =
      new Date(scrappingEndTime).getTime() -
      new Date(scrappingStartTime).getTime();
    console.log(`Scrapping takes ${durationMs} ms`);
    await this.browser.close();
    return this.allAvailability;
  }

  private async captureAuthToken(): Promise<void> {
    this.page.on("request", (request) => {
      if (request.url().includes("/availability/query")) {
        const token = request.headers()["authorization"];
        if (token && !this.authToken) {
          this.authToken = token;
          console.log("Captured auth token:", this.authToken);
        }
      }
    });
  }

  private async goToBookingOnlinePage(): Promise<void> {
    try {
      await this.page.goto(this.bookingOnlineUrl, {
        waitUntil: "networkidle2",
      });
      console.log("Navigated to booking online page.");
    } catch (error: any) {
      throw new Error(
        `Failed to navigate to booking online page: ${error.message}`
      );
    }
  }
  //navigate to first court calendar page to trigger the query api to fetch auth token
  private async goToBookingCalendarPage(): Promise<void> {
    try {
      await this.page.goto(this.bookingCalendar1Url, {
        waitUntil: "networkidle2",
      });
      console.log("Navigated to booking calendar page for court 1.");
    } catch (error: any) {
      throw new Error(
        `Failed to navigate to booking online page: ${error.message}`
      );
    }
  }

  /**
   * Extracts service IDs from the page and sets them to the serviceIds property.
   * This method looks for elements with a specific data attribute and retrieves their IDs.
   */
  private async extractAndSetServiceIds(): Promise<void> {
    try {
      const ids = await this.page.evaluate(() => {
        const ids: Record<string, string> = {};
        const serviceIdElements = document.querySelectorAll(
          "div[data-hook='card-info']"
        );
        serviceIdElements.forEach((element, index) => {
          const div = element.querySelector("[data-id]");
          if (div) {
            const serviceId = div.getAttribute("data-id");
            if (serviceId) {
              if (index === 3) {
                ids[5] = serviceId; // there is no court 4, only court 5 in the club
              } else {
                ids[index + 1] = serviceId;
              }
            }
          }
        });
        return ids;
      });
      this.serviceIds = ids;
      if (Object.keys(this.serviceIds).length === 0) {
        throw new Error("No service IDs found on the page.");
      }
    } catch (error) {
      console.error("Error extracting service IDs:", error);
    }
  }

  private async queryAvailability(): Promise<void> {
    if (!this.authToken) {
      throw new Error(
        "Authorization token not found. Cannot query availability."
      );
    }
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 day window
    const startDateStr = `${startDate.toISOString().split("T")[0]}T00:00:00`;
    const endDateStr = `${endDate.toISOString().split("T")[0]}T23:59:59`;

    for (const [courtNumber, serviceId] of Object.entries(this.serviceIds)) {
      try {
        const response = await this.sendPostRequestsForAvailability(
          serviceId,
          startDateStr,
          endDateStr
        );
        const availabilityEntries: any[] = response.data.availabilityEntries;
        await this.writeAvailabilityDataToMem(availabilityEntries);
      } catch (error) {
        console.error(`Error fetching for ${serviceId} on:`, error);
      }
    }
  }

  private async writeAvailabilityDataToMem(
    EntriesResponseArr: any[]
  ): Promise<void> {
    if (!EntriesResponseArr || EntriesResponseArr.length === 0) {
      console.warn("No availability entries found.");
      return;
    }
    EntriesResponseArr.forEach((entry: any) => {
      const clubName = this.clubName;
      const serviceId = entry.slot.serviceId;
      const courtName = Object.entries(this.serviceIds).find(
        ([key, value]) => value === serviceId
      )?.[0];
      const courtNumber = "Court ".concat(courtName || " ");
      const date = entry.slot.startDate.split("T")[0];
      const startTime = entry.slot.startDate.split("T")[1].substring(0, 5);
      const hour = startTime.split(":")[0];
      const startHour = `${hour}:00`;
      const endTime = entry.slot.endDate.split("T")[1].substring(0, 5);
      const courtBookingLink = this.bookingLinks[courtNumber] || "";
      const location = "Richmond";
      const bookable = 0;
      this.allAvailability.push({
        clubName,
        courtNumber,
        date,
        startHour,
        startTime,
        endTime,
        bookable,
        courtBookingLink,
        location,
      });
    });
  }

  /**
   * sends a POST request to the availability API for a specific service ID and date time range.
   * @param serviceId
   * @param startDate
   * @param endDate
   * @returns
   */
  private async sendPostRequestsForAvailability(
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        "https://www.uetennis.com/_api/availability-calendar/v1/availability/query",
        {
          anyResource: false,
          allowProxyToAvailability: true,
          timezone: "America/Vancouver",
          query: {
            filter: {
              serviceId: [serviceId],
              startDate,
              endDate,
              bookable: true,
              openSpots: { $gte: "1" },
            },
          },
        },
        {
          headers: {
            authorization: this.authToken,
            "Content-type": "application/json",
          },
        }
      );
      return response;
    } catch (error: any) {
      console.error(
        `Error sending POST request for serviceId ${serviceId}:`,
        error
      );
      throw error;
    }
  }

  /**
   *
   * @param {string} filename - The name of the CSV file to write.
   */
  private writeToCSV(filename = "UE_tennis_court_availability.csv"): void {
    console.log(
      "Writing availability data to CSV...",
      new Date().toISOString()
    );
    if (this.allAvailability.length === 0) {
      console.warn("No data provided. CSV file not created.");
      return;
    }

    const headers = [
      "Club Name",
      "Court Number",
      "Date",
      "Start Hour",
      "Start Time",
      "End Time",
      "Bookable",
      "Court Booking Link",
      "Location",
    ];

    const rows = this.allAvailability.map((entry) => [
      entry.clubName,
      entry.courtNumber,
      entry.date,
      entry.startHour,
      entry.startTime,
      entry.endTime,
      entry.bookable,
      entry.courtBookingLink,
      entry.location,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, csvContent, "utf8");

    console.log(`CSV file saved at ${filePath}`, new Date().toISOString());
  }

  /**
   * Writes a JSON array to a file in the uetennis directory.
   * @param data The JSON array to write
   * @param filename The name of the file (default: "availability.json")
   */
  async writeJsonToDisk(filename = "availability.json"): Promise<void> {
    const folderPath = path.join(__dirname, "..", "uetennis");

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);

    fs.writeFileSync(
      filePath,
      JSON.stringify(this.allAvailability, null, 2),
      "utf8"
    );

    console.log(`✅ JSON data saved to: ${filePath}`);
  }
}
