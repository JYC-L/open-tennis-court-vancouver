import React from "react";
import { Dialog } from "@headlessui/react";

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

type EventDetailModalProps = {
  open: boolean;
  event: Event | null;
  onClose: () => void;
};

export function CourtsDetail({ open, event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const [h, m] = event.time.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const displayTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="mx-auto w-full max-w-2xl rounded bg-white p-4 lg:p-8 shadow-lg"
          style={{ maxHeight: 500 }}
        >
          <Dialog.Title className="text-lg lg:text-2xl font-bold mb-2">
            Event Details
          </Dialog.Title>
          <div className="overflow-y-auto" style={{ maxHeight: 350 }}>
            <div className="mb-2 text-sm lg:text-lg">
              <span className="font-semibold">Time:</span> {displayTime}
            </div>
            {event.clubDetails.map((club, idx) => (
              <div key={idx} className="mb-4 text-sm lg:text-lg">
                <div className="font-semibold">{club.clubName}</div>
                <div className="text-sm text-gray-500 mb-1">
                  {club.location}
                </div>
                <ul className="ml-4 list-disc">
                  {club.courtsDetails.map((court, cidx) => (
                    <li key={cidx} className="mb-1">
                      <div>
                        <span className="font-semibold">Court:</span>{" "}
                        {court.courtNumber}
                        <span className="mx-2">|</span>
                        <span className="font-semibold">Time:</span>{" "}
                        {court.startTime} - {court.endTime}
                      </div>
                      <div>
                        <span className="font-semibold">Bookable:</span>{" "}
                        <a
                          href={court.courtBookingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {court.bookable}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            className="mt-4 rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            onClick={onClose}
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
