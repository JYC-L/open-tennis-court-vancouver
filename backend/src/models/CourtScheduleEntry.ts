export interface CourtScheduleEntry {
  clubName: string;
  courtNumber: string;
  date: string;
  startHour: string;
  startTime: string;
  endTime: string;
  bookable: number;
  courtBookingLink: string;
  location: string;
  lastUpdated?: Date;
}
