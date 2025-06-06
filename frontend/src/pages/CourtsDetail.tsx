import React from "react";
import { Dialog } from "@headlessui/react";

type Event = {
  title: string;
  time: string;
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
        <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-2">
            Event Details
          </Dialog.Title>
          <div>
            <div className="mb-2">
              <span className="font-semibold">Title:</span> {event.title}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Time:</span> {displayTime}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">Color:</span>
              <span
                className={`inline-block w-4 h-4 rounded ${event.color}`}
              ></span>
            </div>
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
