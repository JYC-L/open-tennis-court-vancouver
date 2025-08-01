import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import "../App.css";
import { MagnifyingGlassIcon, PlayIcon } from "@heroicons/react/24/outline";
import PCTopNav from "./PCTopNav.tsx";
import {
  fetchFreedCourts,
  formatFreedCourtsMessage,
} from "../utils/freedCourtsApi.ts";

export default function Home() {
  useEffect(() => {
    const checkForFreedCourts = async () => {
      try {
        const response = await fetchFreedCourts();
        if (response.freed_courts && response.freed_courts.length > 0) {
          const message = formatFreedCourtsMessage(response);
          if (message) {
            toast.success(message);
          }
        }
      } catch (error) {
        console.error("Error checking for freed courts:", error);
        toast.error("Failed to check for new court availability");
      }
    };

    // Check for freed courts when the component mounts
    checkForFreedCourts();
  }, []);

  const mockFreedCourts = () => {
    // Create mock data that matches the expected API response format
    const mockResponse = {
      freed_courts: [
        {
          clubName: "UBC Tennis Centre",
          courtNumber: 3,
          date: new Date().toISOString().split("T")[0],
          startTime: "2:00 PM",
          time: "2:00 PM",
        },
        {
          clubName: "Jericho Tennis Club",
          courtNumber: 1,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // tomorrow
          startTime: "4:30 PM",
          time: "4:30 PM",
        },
      ],
      count: 2,
      generated_at: new Date().toISOString(),
    };

    const message = formatFreedCourtsMessage(mockResponse);
    if (message) {
      toast.success(message);
    }
  };

  return (
    <div>
      <PCTopNav />
      <main className="relative z-10">
        <div className="bg-white">
          <div className="relative isolate pt-14">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
              <div
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#14532d] to-[#6ee7b7] opacity-70 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
            </div>
            <div className="py-12 sm:py-24 lg:pb-40">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
                    Welcome to VancouverTennis
                  </h1>
                  <p className="mt-8 text-pretty text-sm font-medium text-gray-500 sm:text-xl/8">
                    Your go-to tool for finding and booking tennis courts in
                    Vancouver, locating the closest courts, and exploring the
                    vibrant local tennis community.
                  </p>
                  <div className="mt-10 flex flex-col items-center justify-center gap-y-4">
                    <Link
                      to="/courtfinder"
                      className="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 flex items-center"
                    >
                      <span>Find Bookable Courts</span>
                      <MagnifyingGlassIcon
                        className="h-5 w-5 ml-1"
                        aria-hidden="true"
                      />
                    </Link>
                    <button
                      onClick={mockFreedCourts}
                      className="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 flex items-center"
                    >
                      <span>Test Toast</span>
                      <PlayIcon className="h-5 w-5 ml-1" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
