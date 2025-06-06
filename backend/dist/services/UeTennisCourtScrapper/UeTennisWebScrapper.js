"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UeTennisScrapper = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
class UeTennisScrapper {
    constructor() {
        this.authToken = null;
        this.serviceIds = {};
        this.allAvailability = [];
        this.baseUrl = "https://www.uetennis.com";
        this.bookingOnlineUrl = `${this.baseUrl}/book-online`;
        this.bookingCalendar1Url = `https://www.uetennis.com/booking-calendar/court-1?referral=service_list_widget`;
        this.bookingLinks = {
            "Court 1": "http://www.uetennis.com/booking-calendar/court-1?referral=service_list_widget",
            "Court 2": "http://www.uetennis.com/booking-calendar/court-2?referral=service_list_widget",
            "Court 3": "http://www.uetennis.com/booking-calendar/court-3?referral=service_list_widget",
            "Court 5": "http://www.uetennis.com/booking-calendar/court-5?referral=service_list_widget",
        };
        this.clubName = "UE Tennis";
    }
    getCourtBooking() {
        return __awaiter(this, void 0, void 0, function* () {
            const scrappingStartTime = new Date().toISOString();
            console.log("Starting UE Tennis court booking scrapper...", scrappingStartTime);
            this.browser = yield puppeteer_1.default.launch({ headless: false });
            this.page = yield this.browser.newPage();
            // Capture authorization token from network requests
            yield this.captureAuthToken();
            yield this.goToBookingCalendarPage();
            //let the page to hang there for expected request
            yield this.page.waitForRequest((request) => {
                return (request.url().includes("/availability/query") &&
                    !!request.headers()["authorization"]);
            });
            yield this.goToBookingOnlinePage();
            // // Extract serviceIds dynamically (replace selector accordingly)
            yield this.extractAndSetServiceIds();
            yield this.queryAvailability();
            const scrappingEndTime = new Date().toISOString();
            console.log("web scrapping finished.", scrappingEndTime);
            const durationMs = new Date(scrappingEndTime).getTime() -
                new Date(scrappingStartTime).getTime();
            console.log(`Scrapping takes ${durationMs} ms`);
            yield this.browser.close();
            console.log(this.allAvailability);
            return this.allAvailability;
        });
    }
    captureAuthToken() {
        return __awaiter(this, void 0, void 0, function* () {
            this.page.on("request", (request) => {
                if (request.url().includes("/availability/query")) {
                    const token = request.headers()["authorization"];
                    if (token && !this.authToken) {
                        this.authToken = token;
                        console.log("Captured auth token:", this.authToken);
                    }
                }
            });
        });
    }
    goToBookingOnlinePage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.page.goto(this.bookingOnlineUrl, {
                    waitUntil: "networkidle2",
                });
                console.log("Navigated to booking online page.");
            }
            catch (error) {
                throw new Error(`Failed to navigate to booking online page: ${error.message}`);
            }
        });
    }
    //navigate to first court calendar page to trigger the query api to fetch auth token
    goToBookingCalendarPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.page.goto(this.bookingCalendar1Url, {
                    waitUntil: "networkidle2",
                });
                console.log("Navigated to booking calendar page for court 1.");
            }
            catch (error) {
                throw new Error(`Failed to navigate to booking online page: ${error.message}`);
            }
        });
    }
    /**
     * Extracts service IDs from the page and sets them to the serviceIds property.
     * This method looks for elements with a specific data attribute and retrieves their IDs.
     */
    extractAndSetServiceIds() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ids = yield this.page.evaluate(() => {
                    const ids = {};
                    const serviceIdElements = document.querySelectorAll("div[data-hook='card-info']");
                    serviceIdElements.forEach((element, index) => {
                        const div = element.querySelector("[data-id]");
                        if (div) {
                            const serviceId = div.getAttribute("data-id");
                            if (serviceId) {
                                if (index === 3) {
                                    ids[5] = serviceId; // there is no court 4, only court 5 in the club
                                }
                                else {
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
            }
            catch (error) {
                console.error("Error extracting service IDs:", error);
            }
        });
    }
    queryAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authToken) {
                throw new Error("Authorization token not found. Cannot query availability.");
            }
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7); // 7 day window
            const startDateStr = `${startDate.toISOString().split("T")[0]}T00:00:00`;
            const endDateStr = `${endDate.toISOString().split("T")[0]}T23:59:59`;
            for (const [courtNumber, serviceId] of Object.entries(this.serviceIds)) {
                try {
                    const response = yield this.sendPostRequestsForAvailability(serviceId, startDateStr, endDateStr);
                    const availabilityEntries = response.data.availabilityEntries;
                    yield this.writeAvailabilityDataToMem(availabilityEntries);
                }
                catch (error) {
                    console.error(`Error fetching for ${serviceId} on:`, error);
                }
            }
        });
    }
    writeAvailabilityDataToMem(EntriesResponseArr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!EntriesResponseArr || EntriesResponseArr.length === 0) {
                console.warn("No availability entries found.");
                return;
            }
            EntriesResponseArr.forEach((entry) => {
                var _a;
                const clubName = this.clubName;
                const serviceId = entry.slot.serviceId;
                const courtName = (_a = Object.entries(this.serviceIds).find(([key, value]) => value === serviceId)) === null || _a === void 0 ? void 0 : _a[0];
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
        });
    }
    /**
     * sends a POST request to the availability API for a specific service ID and date time range.
     * @param serviceId
     * @param startDate
     * @param endDate
     * @returns
     */
    sendPostRequestsForAvailability(serviceId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post("https://www.uetennis.com/_api/availability-calendar/v1/availability/query", {
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
                }, {
                    headers: {
                        authorization: this.authToken,
                        "Content-type": "application/json",
                    },
                });
                return response;
            }
            catch (error) {
                console.error(`Error sending POST request for serviceId ${serviceId}:`, error);
                throw error;
            }
        });
    }
    /**
     *
     * @param {string} filename - The name of the CSV file to write.
     */
    writeToCSV(filename = "UE_tennis_court_availability.csv") {
        console.log("Writing availability data to CSV...", new Date().toISOString());
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
            ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");
        const filePath = path_1.default.join(__dirname, filename);
        fs_1.default.writeFileSync(filePath, csvContent, "utf8");
        console.log(`CSV file saved at ${filePath}`, new Date().toISOString());
    }
}
exports.UeTennisScrapper = UeTennisScrapper;
