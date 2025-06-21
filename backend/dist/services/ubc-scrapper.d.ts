export = UbcTennisCenterScrapper;
declare class UbcTennisCenterScrapper {
    baseUrl: string;
    courts: {
        id: string;
        label: string;
    }[];
    knownLeftPositions: number[];
    isoDateString(date: any): any;
    getDayOffset(leftPx: any): number;
    extractLeftPx(style: any): number;
    offsetDate(base: any, offset: any): string;
    convertTo24Hour(timeStr: any): string;
    fetchHtmlForCourt(page: any, facilityId: any): Promise<{
        html: any;
        dateLabel: any;
    }[]>;
    extractSchedule(htmlDataArray: any, courtLabel: any, courtId: any): any[];
    getCourtBooking(): Promise<any[]>;
}
