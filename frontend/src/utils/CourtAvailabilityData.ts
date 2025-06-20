export type Court = {
  courtNumber: string;
  startTime: string;
  endTime: string;
  bookable: string;
  courtBookingLink: string;
};

export type Club = {
  clubName: string;
  location: string;
  courtsDetails: Court[];
};

export type Event = {
  time: string;
  clubDetails: Club[];
  color: string;
};

export type EventsMap = {
  [date: string]: Event[];
};
