import { Link } from "react-router-dom";
import "../App.css";
import React, { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "Search", href: "/search" },
  ];
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div>
      <header className="z-50 relative">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        >
          <div className="flex items-center gap-x-12">
            <Link to="/" className="-m-1.5 p-1.5">
              <img alt="" src="/images/logo.png" className="h-8 w-auto" />
            </Link>
            <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm/6 font-semibold text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          {!mobileNavigationOpen && (
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavigationOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>
          )}
          <div className="hidden lg:flex">
            <Link
              to="/cart"
              className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
            >
              Cart
              <ShoppingCartIcon className="h-5 w-5 ml-1" aria-hidden="true" />
            </Link>
          </div>
        </nav>
        <Dialog
          open={mobileNavigationOpen}
          onClose={setMobileNavigationOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-10" />
          <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5">
                <img alt="" src="/images/logo.png" className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavigationOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileNavigationOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    to="/cart"
                    className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
                    onClick={() => setMobileNavigationOpen(false)}
                  >
                    Cart
                    <ShoppingCartIcon
                      className="h-5 w-5 ml-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
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
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
            </div>
            <div className="py-12 sm:py-24 lg:pb-40">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
                    Welcome to Pacific Spirit Marketplace
                  </h1>
                  <p className="mt-8 text-pretty text-sm font-medium text-gray-500 sm:text-xl/8">
                    The biggest online thrift store in Vancouver Point Grey
                    Area, where you can find a wide range of second-hand items
                    at affordable prices.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                      to="/categories"
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Start Shopping
                    </Link>
                    <Link
                      to="/search"
                      className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
                    >
                      Search
                      <MagnifyingGlassIcon
                        className="h-5 w-5 ml-1"
                        aria-hidden="true"
                      />
                    </Link>
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
