"use client";
import React from "react";
import "../App.css";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { CourtsDetail } from "./CourtsDetail.tsx";
import { sampleEvents } from "./SampleEvents.ts";

type Day = {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

// return gridRow based on time
function getGridRow(time: string, duration: number = 60): string {
  // time: "HH:mm"，duration: calculated in minutes
  const [h, m] = time.split(":").map(Number);
  // 6AM=0，1 hr=12 unitt，1 unit=5 mins
  const start = (h - 6) * 12 + Math.floor(m / 5) + 2; // +2 is to align with the style
  const span = Math.max(1, Math.floor(duration / 5));
  return `${start} / span ${span}`;
}

function getDaysForMonth(
  year: number,
  month: number,
  selectedDate: string
): Day[] {
  // month: 0-based (0=Jan)
  const days: Day[] = [];
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" })
  );

  // Get days of the previous month
  const startWeekDay = (firstDay.getUTCDay() + 6) % 7; // Set Monday as 0
  if (startWeekDay > 0) {
    const prevMonthLastDay = new Date(Date.UTC(year, month, 0));
    for (let i = startWeekDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay.getUTCDate() - i;
      const dateStr = `${prevMonthLastDay.getUTCFullYear()}-${String(
        prevMonthLastDay.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedDate === dateStr,
      });
    }
  }

  // Get the current month days
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === d;
    days.push({
      date: dateStr,
      isCurrentMonth: true,
      isToday,
      isSelected: selectedDate === dateStr,
    });
  }

  // Get days of the next month
  const endWeekDay = (lastDay.getUTCDay() + 6) % 7; // Set Monday as 0
  if (endWeekDay < 6) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= 6 - endWeekDay; i++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(
        2,
        "0"
      )}-${String(i).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedDate === dateStr,
      });
    }
  }

  return days;
}

function getVancouverDateFromSelected(selectedDate: string): Date {
  // selectedDate: "YYYY-MM-DD"
  const [year, month, day] = selectedDate.split("-").map(Number);
  // month need to minus 1
  return new Date(
    new Date(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}T00:00:00`
    ).toLocaleString("en-US", { timeZone: "America/Vancouver" })
  );
}

function getVancouverTodayString(): string {
  const vancouverNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" })
  );
  const y = vancouverNow.getFullYear();
  const m = vancouverNow.getMonth() + 1;
  const d = vancouverNow.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function classNames(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function CourtFinder() {
  const container = useRef();
  const containerNav = useRef();
  const containerOffset = useRef();

  // Get Vancouver Local Date
  const vancouverNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" })
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    return getVancouverTodayString();
  });
  const [days, setDays] = useState(() =>
    getDaysForMonth(
      vancouverNow.getFullYear(),
      vancouverNow.getMonth(),
      selectedDate
    )
  );
  const selectedVancouverDate = getVancouverDateFromSelected(selectedDate);
  const [calendarMonth, setCalendarMonth] = useState(vancouverNow.getMonth());
  const [calendarYear, setCalendarYear] = useState(vancouverNow.getFullYear());
  const monthDays = getDaysForMonth(calendarYear, calendarMonth, selectedDate);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [locationFilter, setLocationFilter] = useState("All");

  useEffect(() => {
    const vancouverNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" })
    );
    setDays(
      getDaysForMonth(
        vancouverNow.getFullYear(),
        vancouverNow.getMonth(),
        selectedDate
      )
    );
  }, [selectedDate]);

  useEffect(() => {
    const currentMinute = new Date().getHours() * 60;
    if (container.current && containerNav.current && containerOffset.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  // Switch to the previous week
  function handlePrev(): void {
    // Mobile, switch to the previous week
    const start = new Date(selectedDate);
    // check if the screen is large or small
    if (window.matchMedia("(min-width: 768px)").matches) {
      start.setDate(start.getDate() - 1);
    } else {
      start.setDate(start.getDate() - 7);
    }
    setSelectedDate(start.toISOString().slice(0, 10));
  }

  // Switch to the next week
  function handleNext(): void {
    const start = new Date(selectedDate);
    // check if the screen is large or small
    if (window.matchMedia("(min-width: 768px)").matches) {
      start.setDate(start.getDate() + 1);
    } else {
      start.setDate(start.getDate() + 7);
    }
    setSelectedDate(start.toISOString().slice(0, 10));
  }

  function handlePrevMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }

  function handleNextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }

  let filteredEvents = (sampleEvents[selectedDate] || [])
    .map((event) => {
      const filteredClubs =
        locationFilter === "All"
          ? event.clubDetails
          : event.clubDetails.filter(
              (club) => club.location === locationFilter
            );
      return { ...event, clubDetails: filteredClubs };
    })
    .filter((event) => event.clubDetails.length > 0);

  return (
    <div className="flex h-full flex-col">
      <CourtsDetail
        open={modalOpen}
        event={selectedEvent}
        onClose={() => setModalOpen(false)}
      />
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-gray-900">
            <time
              dateTime={selectedVancouverDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              className="sm:hidden"
            >
              {selectedVancouverDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <time
              dateTime={selectedVancouverDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              className="hidden sm:inline"
            >
              {selectedVancouverDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Saturday</p>
        </div>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous day</span>
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              type="button"
              onClick={handleNext}
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next day</span>
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <MenuButton
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Location
                <ChevronDownIcon
                  className="-mr-1 size-5 text-gray-400"
                  aria-hidden="true"
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <button
                      onClick={() => setLocationFilter("All")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                    >
                      Metro Vancouver
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setLocationFilter("UBC")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                    >
                      UBC
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setLocationFilter("Richmond")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                    >
                      Richmond
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setLocationFilter("Vancouver DT")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                    >
                      Vancouver DT
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>

            <button
              type="button"
              className="ml-4 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              onClick={() => (window.location.href = "/")}
            >
              Home page
            </button>
            <div className="ml-6 h-6 w-px bg-gray-300" />
          </div>
          <Menu as="div" className="relative ml-6 md:hidden">
            <MenuButton className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="size-5" aria-hidden="true" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <button
                    onClick={() => setSelectedDate(getVancouverTodayString())}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Go to today
                  </button>
                </MenuItem>
              </div>
              <div className="py-1">
                <MenuItem>
                  <button
                    onClick={() => setLocationFilter("All")}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Metro Vancouver
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => setLocationFilter("UBC")}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    UBC
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => setLocationFilter("Richmond")}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Richmond
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => setLocationFilter("Vancouver DT")}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Vancouver DT
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </header>
      <div className="isolate flex flex-auto overflow-hidden bg-white">
        <div ref={container} className="flex flex-auto flex-col overflow-auto">
          <div
            ref={containerNav}
            className="sticky top-0 z-10 grid flex-none grid-cols-7 bg-white text-xs text-gray-500 shadow ring-1 ring-black/5 md:hidden"
          >
            {(() => {
              // find the index of selectedDate in days
              const selectedIdx = days.findIndex(
                (day) => day.date === selectedDate
              );
              // calculate the start index of the week
              const weekStartIdx =
                selectedIdx - (((selectedIdx % 7) + 7 - 0) % 7);
              // get out the 7 days of the week
              const weekDays = days.slice(weekStartIdx, weekStartIdx + 7);
              // mark title of the week
              const weekTitles = ["M", "T", "W", "T", "F", "S", "S"];
              return weekDays.map((day, i) => (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className="flex flex-col items-center pb-1.5 pt-3"
                >
                  <span>{weekTitles[i]}</span>
                  <span
                    className={classNames(
                      "mt-3 flex size-8 items-center justify-center rounded-full text-base font-semibold",
                      day.isSelected &&
                        day.isToday &&
                        "bg-indigo-600 text-white",
                      day.isSelected &&
                        !day.isToday &&
                        "bg-gray-900 text-white",
                      !day.isSelected && day.isToday && "text-indigo-600",
                      !day.isSelected && !day.isToday && "text-gray-900"
                    )}
                  >
                    {parseInt(day.date.split("-")[2], 10)}
                  </span>
                </button>
              ));
            })()}
          </div>
          <div className="flex w-full flex-auto">
            <div className="w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 "
                style={{ gridTemplateRows: "repeat(17, minmax(4.5rem, 1fr))" }} // 17*2=34
              >
                <div ref={containerOffset} className="row-end-1 h-7 "></div>
                {Array.from({ length: 17 }).map((_, i) => (
                  <div key={i * 2}>
                    <div className="sticky left-0 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs/5 text-gray-400">
                      {i === 0
                        ? "6AM"
                        : i < 6
                        ? `${i + 6}AM`
                        : i === 6
                        ? "12PM"
                        : `${i - 6}PM`}
                    </div>
                  </div>
                ))}
                {Array.from({ length: 17 }).map((_, i) => (
                  <div key={i * 2 + 1} />
                ))}
              </div>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
                style={{
                  gridTemplateRows: "repeat(204, minmax(0, 1fr))", // 17*12=204
                }}
              >
                {filteredEvents.map((event, idx) => {
                  const gridRow = getGridRow(event.time);
                  const dynamicTitle = event.clubDetails
                    .map(
                      (club) =>
                        `${club.clubName}${
                          club.courtsDetails
                            ? " " + club.courtsDetails.length
                            : ""
                        }`
                    )
                    .join(" | ");

                  return (
                    <li
                      key={event.title + event.time}
                      className="relative mt-px flex"
                      style={{ gridRow }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEvent(event);
                          setModalOpen(true);
                        }}
                        className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg ${
                          event.color
                        } p-2 text-xs/5 hover:${event.color.replace(
                          "200",
                          "100"
                        )} sm:min-h-0 min-h-[56px]`}
                      >
                        <p
                          className={`order-1 font-semibold text-black text-left text-xs lg:text-sm`}
                        >
                          {dynamicTitle}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div
                className="bg-white hidden lg:flex"
                aria-hidden
                style={{ minHeight: "48px" }}
              />
            </div>
          </div>
        </div>

        <div className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 px-8 py-10 md:block">
          <div className="flex items-center text-center text-gray-900">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
            <div className="flex-auto text-sm font-semibold">
              {new Date(calendarYear, calendarMonth).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-center text-xs/6 text-gray-500">
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
            {monthDays.map((day, dayIdx) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className={classNames(
                  "py-1.5 hover:bg-gray-100 focus:z-10",
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                  (day.isSelected || day.isToday) && "font-semibold",
                  day.isSelected && "text-white",
                  !day.isSelected &&
                    day.isCurrentMonth &&
                    !day.isToday &&
                    "text-gray-900",
                  !day.isSelected &&
                    !day.isCurrentMonth &&
                    !day.isToday &&
                    "text-gray-400",
                  day.isToday && !day.isSelected && "text-indigo-600",
                  dayIdx === 0 && "rounded-tl-lg",
                  dayIdx === 6 && "rounded-tr-lg",
                  dayIdx === days.length - 7 && "rounded-bl-lg",
                  dayIdx === days.length - 1 && "rounded-br-lg"
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    "mx-auto flex size-7 items-center justify-center rounded-full",
                    day.isSelected && day.isToday && "bg-indigo-600",
                    day.isSelected && !day.isToday && "bg-emerald-600"
                  )}
                >
                  {(day.date.split("-").pop() ?? "").replace(/^0/, "")}
                </time>
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => setSelectedDate(getVancouverTodayString())}
              className="flex items-center gap-x-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Go to today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
