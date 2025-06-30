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
export declare class UeTennisScrapper {
    private browser;
    private page;
    private authToken;
    private serviceIds;
    private allAvailability;
    private readonly baseUrl;
    private readonly bookingOnlineUrl;
    private readonly bookingCalendar1Url;
    private readonly bookingLinks;
    private readonly clubName;
    getCourtBooking(): Promise<CourtAvailability[]>;
    private captureAuthToken;
    private goToBookingOnlinePage;
    private goToBookingCalendarPage;
    /**
     * Extracts service IDs from the page and sets them to the serviceIds property.
     * This method looks for elements with a specific data attribute and retrieves their IDs.
     */
    private extractAndSetServiceIds;
    private queryAvailability;
    private writeAvailabilityDataToMem;
    /**
     * sends a POST request to the availability API for a specific service ID and date time range.
     * @param serviceId
     * @param startDate
     * @param endDate
     * @returns
     */
    private sendPostRequestsForAvailability;
    /**
     *
     * @param {string} filename - The name of the CSV file to write.
     */
    private writeToCSV;
    /**
     * Writes a JSON array to a file in the uetennis directory.
     * @param data The JSON array to write
     * @param filename The name of the file (default: "availability.json")
     */
    writeJsonToDisk(filename?: string): Promise<void>;
}
