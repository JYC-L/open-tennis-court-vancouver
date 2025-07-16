import { Link } from "react-router-dom";

function HomeButton() {
  return (
    <button
      type="button"
      className="justify-center px-5 hover:bg-emerald-900  group"
    >
      <Link key="Home" to="/" className="inline-flex flex-col items-center">
        <svg
          className="svg-active w-6 h-6 mb-0 text-emerald-200 group-hover:text-emerald-400 "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
        </svg>
        <span className="span-active text-sm text-emerald-200 group-hover:text-emerald-400 ">
          Home
        </span>
      </Link>
    </button>
  );
}

function CourtMapButton() {
  return (
    <button
      type="button"
      className="justify-center px-5 hover:bg-emerald-900 group"
    >
      <Link
        key="Court Map"
        to="/court-map"
        className="inline-flex flex-col items-center"
      >
        <svg
          className="svg-active w-5 h-5 mb-0 text-emerald-200  group-hover:text-emerald-400 "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
        </svg>

        <span className="span-active text-sm text-emerald-200  group-hover:text-emerald-400 ">
          Court Map
        </span>
      </Link>
    </button>
  );
}

function CourtFinderButton() {
  return (
    <div className="relative inline-flex items-center justify-center flex-col">
      <button
        type="button"
        className="absolute bottom-3/4 translate-y-1/2 inline-flex items-center justify-center w-16 h-16 font-medium bg-green-600 rounded-full hover:bg-green-700 group "
      >
        <Link
          key="Court Finder"
          to="/courtfinder"
          className="inline-flex flex-col items-center"
        >
          <svg
            className="bi bi-star w-7 h-7 text-yellow-200"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 18"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.1"
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
            />
          </svg>

          <span className="sr-only">New item</span>
        </Link>
      </button>
    </div>
  );
}

export default function MobileBottomNav() {
  return (
    <div className="fixed inset-x-0 lg:hidden bottom-0 left-0 z-50 w-full h-16 bg-emerald-800 border-t border-emerald-800 ">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <HomeButton />
        <CourtFinderButton />
        <CourtMapButton />
      </div>
    </div>
  );
}
