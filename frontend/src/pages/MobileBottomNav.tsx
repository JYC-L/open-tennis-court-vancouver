import { Link } from "react-router-dom";

function ExploreButton() {
  return (
    <button
      type="button"
      className="justify-center px-5 hover:bg-emerald-900  group"
    >
      <Link key="Explore" to="/" className="inline-flex flex-col items-center">
        <svg
          className="svg-active w-5 h-5 mb-0 text-emerald-200 group-hover:text-emerald-400 "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
        </svg>
        <span className="span-active text-sm text-emerald-200 group-hover:text-emerald-400 ">
          Explore
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
        to="/"
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
        <ExploreButton />
        <CourtFinderButton />
        <CourtMapButton />
      </div>
    </div>
  );
}
