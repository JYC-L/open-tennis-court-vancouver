import { Link } from "react-router-dom";
import "../App.css";

export default function PCTopNav() {
  const navigation = [
    { name: "Explore", href: "/" },
    { name: "Bookable Court Finder", href: "/courtfinder" },
    { name: "Court Map", href: "/" },
  ];

  return (
    <header className="z-50 relative">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex items-center gap-x-12">
          <Link to="/" className="-m-1.5 p-1.5">
            <img
              alt=""
              src="/images/logo.png"
              className="h-12 lg:h-16 w-auto"
            />
          </Link>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-md font-semibold text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
