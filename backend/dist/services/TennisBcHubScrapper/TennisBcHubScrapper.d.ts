export class TennisBcHubScrapper {
    locationInfo: {
        richmond: {
            courtName: string;
            resourceFingerprint: string;
            displayName: string;
            location: string;
        };
        stanley: {
            courtName: string;
            resourceFingerprint: string;
            displayName: string;
            location: string;
        };
    };
    getCourtBooking(): Promise<{
        clubName: any;
        courtNumber: any;
        date: any;
        startHour: string;
        startTime: string;
        endTime: string;
        bookable: number;
        courtBookingLink: string;
        location: any;
    }[]>;
    interceptURLPrams(): Promise<{}>;
    #private;
}
export function makeBookableValue(dateString: any, minutes: any): number;
