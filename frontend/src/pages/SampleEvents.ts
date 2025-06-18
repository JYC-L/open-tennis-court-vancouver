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
  title: string;
  time: string;
  clubDetails: Club[];
  color: string;
};

export type EventsMap = {
  [date: string]: Event[];
};

export const sampleEvents: EventsMap = {
  "2025-06-16": [
    {
      title:
        "UBC Tennis Center 4  | Tennis BC HUB @ Richmond 4 | Tennis BC HUB @ Standley 6 | UE Tennis 4",
      time: "22:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
            {
              courtNumber: "Court 4",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=47f78e62-2ac0-4d39-8ffa-5d331f60e14e",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
            {
              courtNumber: "Bubble Court 3",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
            {
              courtNumber: "Bubble Court 4",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
            {
              courtNumber: "Stanley Park Court 3",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
            {
              courtNumber: "Stanley Park Court 4",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
            {
              courtNumber: "Stanley Park Court 5",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
            {
              courtNumber: "Stanley Park Court 6",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
            {
              courtNumber: "Court 3",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-3",
            },
            {
              courtNumber: "Court 5",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-5",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
  ],
  "2025-06-17": [
    {
      title: "Tennis BC HUB @ Stanley Park 3 | UBC Tennis Center 1",
      time: "09:00",
      clubDetails: [
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking1",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking2",
            },
            {
              courtNumber: "Stanley Park Court 3",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking3",
            },
            {
              courtNumber: "Stanley Park Court 4",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking4",
            },
            {
              courtNumber: "Stanley Park Court 5",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking5",
            },
          ],
        },
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
            {
              courtNumber: "Court 4",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=47f78e62-2ac0-4d39-8ffa-5d331f60e14e",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
    {
      title:
        "UBC Tennis Center 1  | Tennis BC HUB @ Richmond 2 | Tennis BC HUB @ Standley 1 | UE Tennis 2",
      time: "10:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
          ],
        },
      ],
      color: "bg-yellow-200",
    },
    {
      title:
        "UBC Tennis Center 1  | Tennis BC HUB @ Richmond 2 | Tennis BC HUB @ Standley 1 | UE Tennis 2",
      time: "12:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
    {
      title:
        "UBC Tennis Center 1  | Tennis BC HUB @ Richmond 2 | Tennis BC HUB @ Standley 1 | UE Tennis 2",
      time: "14:00",
      clubDetails: [
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
          ],
        },
      ],
      color: "bg-yellow-200",
    },
  ],
  "2025-06-18": [
    {
      title: "UBC Tennis Center 6",
      time: "13:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "13:00",
              endTime: "14:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
            {
              courtNumber: "Court 4",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=47f78e62-2ac0-4d39-8ffa-5d331f60e14e",
            },
          ],
        },
      ],
      color: "bg-yellow-200",
    },
  ],
  "2025-06-19": [
    {
      title: "Tennis BC HUB @ Stanley Park 6 | UE Tennis 5",
      time: "11:00",
      clubDetails: [
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "17:00",
              endTime: "18:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking1",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking2",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
            {
              courtNumber: "Court 3",
              startTime: "08:00",
              endTime: "09:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-3",
            },
            {
              courtNumber: "Court 4",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-5",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
  ],
  "2025-06-20": [
    {
      title: "UE Tennis 6 | UBC Tennis Center 3 | Tennis BC HUB @ Richmond 4",
      time: "21:00",
      clubDetails: [
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "08:00",
              endTime: "09:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
          ],
        },
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "11:00",
              endTime: "12:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
            {
              courtNumber: "Court 4",
              startTime: "20:00",
              endTime: "21:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=47f78e62-2ac0-4d39-8ffa-5d331f60e14e",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking1",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "18:00",
              endTime: "19:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking2",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
  ],
  "2025-06-21": [
    {
      title: "UBC Tennis Center 4 | Tennis BC HUB @ Richmond 3 | UE Tennis 5",
      time: "15:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "18:00",
              endTime: "19:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "20:00",
              endTime: "21:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking1",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking2",
            },
            {
              courtNumber: "Bubble Court 3",
              startTime: "07:00",
              endTime: "08:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking3",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "16:00",
              endTime: "17:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "20:00",
              endTime: "21:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
  ],
  "2025-06-22": [
    {
      title: "UBC Tennis Center 6 | Tennis BC HUB @ Stanley Park 6",
      time: "19:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "07:00",
              endTime: "08:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking1",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "20:00",
              endTime: "21:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking2",
            },
            {
              courtNumber: "Stanley Park Court 3",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking3",
            },
            {
              courtNumber: "Stanley Park Court 4",
              startTime: "20:00",
              endTime: "21:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking4",
            },
            {
              courtNumber: "Stanley Park Court 5",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking5",
            },
            {
              courtNumber: "Stanley Park Court 6",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking6",
            },
          ],
        },
      ],
      color: "bg-blue-200",
    },
  ],
  "2025-06-23": [
    {
      title:
        "Tennis BC HUB @ Richmond 3 | UBC Tennis Center 4 | Tennis BC HUB @ Stanley Park 4",
      time: "19:00",
      clubDetails: [
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "18:00",
              endTime: "19:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking1",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "06:00",
              endTime: "07:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking2",
            },
            {
              courtNumber: "Bubble Court 3",
              startTime: "16:00",
              endTime: "17:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking3",
            },
            {
              courtNumber: "Bubble Court 4",
              startTime: "15:00",
              endTime: "16:00",
              bookable: "Book Now",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking4",
            },
          ],
        },
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "20:00",
              endTime: "21:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking1",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "18:00",
              endTime: "19:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking2",
            },
            {
              courtNumber: "Stanley Park Court 3",
              startTime: "19:00",
              endTime: "20:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking3",
            },
            {
              courtNumber: "Stanley Park Court 4",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking4",
            },
            {
              courtNumber: "Stanley Park Court 5",
              startTime: "11:00",
              endTime: "12:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking5",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
  ],
  "2025-06-24": [
    {
      title: "Tennis BC HUB @ Stanley Park 6 | UBC Tennis Center 6",
      time: "12:00",
      clubDetails: [
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "22:00",
              endTime: "23:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking1",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "17:00",
              endTime: "18:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking2",
            },
            {
              courtNumber: "Stanley Park Court 3",
              startTime: "16:00",
              endTime: "17:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking3",
            },
            {
              courtNumber: "Stanley Park Court 4",
              startTime: "19:00",
              endTime: "20:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking4",
            },
          ],
        },
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "16:00",
              endTime: "17:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
            {
              courtNumber: "Court 4",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=47f78e62-2ac0-4d39-8ffa-5d331f60e14e",
            },
          ],
        },
      ],
      color: "bg-red-200",
    },
  ],
  "2025-06-25": [
    {
      title:
        "Tennis BC HUB @ Richmond 6 | UE Tennis 6 | Tennis BC HUB @ Stanley Park 4",
      time: "14:00",
      clubDetails: [
        {
          clubName: "Tennis BC HUB @ Richmond",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Bubble Court 1",
              startTime: "13:00",
              endTime: "14:00",
              bookable: "Bookable within a week",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking1",
            },
            {
              courtNumber: "Bubble Court 2",
              startTime: "08:00",
              endTime: "09:00",
              bookable: "Bookable within a week",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking2",
            },
            {
              courtNumber: "Bubble Court 3",
              startTime: "14:00",
              endTime: "15:00",
              bookable: "Bookable within a week",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking3",
            },
            {
              courtNumber: "Bubble Court 4",
              startTime: "19:00",
              endTime: "20:00",
              bookable: "Bookable within a week",
              courtBookingLink: "https://clubspark.ca/TBCHubRichmond/Booking4",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "10:00",
              endTime: "11:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
          ],
        },
        {
          clubName: "Tennis BC HUB @ Stanley Park",
          location: "Vancouver DT",
          courtsDetails: [
            {
              courtNumber: "Stanley Park Court 1",
              startTime: "07:00",
              endTime: "08:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking1",
            },
            {
              courtNumber: "Stanley Park Court 2",
              startTime: "09:00",
              endTime: "10:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking2",
            },
            {
              courtNumber: "Stanley Park Court 3",
              startTime: "06:00",
              endTime: "07:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking3",
            },
            {
              courtNumber: "Stanley Park Court 4",
              startTime: "15:00",
              endTime: "16:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking4",
            },
            {
              courtNumber: "Stanley Park Court 5",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking5",
            },
            {
              courtNumber: "Stanley Park Court 6",
              startTime: "13:00",
              endTime: "14:00",
              bookable: "Bookable within a week",
              courtBookingLink:
                "https://clubspark.ca/TBCHubStanleyPark/Booking6",
            },
          ],
        },
      ],
      color: "bg-yellow-200",
    },
  ],
  "2025-06-26": [
    {
      title: "UBC Tennis Center 1 | UE Tennis 2",
      time: "10:00",
      clubDetails: [
        {
          clubName: "UBC Tennis Center",
          location: "UBC",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "12:00",
              endTime: "13:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c0668c1c-1fd6-4432-a20e-4c50aaad5baa",
            },
            {
              courtNumber: "Court 2",
              startTime: "11:00",
              endTime: "12:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=e2d99dda-cdc4-4af4-8df6-6c8061ffd56f",
            },
            {
              courtNumber: "Court 3",
              startTime: "21:00",
              endTime: "22:00",
              bookable: "Bookable within 24 hrs",
              courtBookingLink:
                "https://ubc.perfectmind.com/24063/Clients/BookMe4LandingPages/Facility?facilityId=c117a102-0ba0-4aa8-b8cf-eb8a1480be55",
            },
          ],
        },
        {
          clubName: "UE Tennis",
          location: "Richmond",
          courtsDetails: [
            {
              courtNumber: "Court 1",
              startTime: "16:00",
              endTime: "17:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-1",
            },
            {
              courtNumber: "Court 2",
              startTime: "08:00",
              endTime: "09:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-2",
            },
            {
              courtNumber: "Court 3",
              startTime: "18:00",
              endTime: "19:00",
              bookable: "Book Now",
              courtBookingLink:
                "https://www.uetennis.com/booking-calendar/court-3",
            },
          ],
        },
      ],
      color: "bg-emerald-200",
    },
  ],
};
