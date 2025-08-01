import { Status, Wrapper } from "@googlemaps/react-wrapper";
import React, { useState } from "react";

// Add google to the Window type for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

const VANCOUVER_CENTER = { lat: 49.246292, lng: -123.116226 };
const COURTS = [
  {
    name: "Tennis BC Hub @ Richmond",
    address: "10251 St Edwards Dr, Richmond, BC V6X 2M9",
    position: { lat: 49.1806, lng: -123.0976 },
    link: "https://clubspark.ca/TBCHubRichmond",
    image: "/images/tennisBChub-RMD.jpg",
    type: "club",
  },
  {
    name: "UBC Tennis Centre",
    address: "6160 Thunderbird Blvd, Vancouver, BC V6T 1Z3",
    position: { lat: 49.2531, lng: -123.2417 },
    link: "https://ubc.perfectmind.com/24063/Clients/BookMe4FacilityList/List?calendarId=e65c1527-c4f8-4316-b6d6-3b174041f00e&widgetId=c7c36ee3-2494-4de2-b2cb-d50a86487656&embed=False&singleCalendarWidget=true&_gl=1*17q0o9f*_ga*MTMwMDAxODM3NS4xNzAyNzgyODE1*_ga_8J87JYF15S*czE3NTI4OTAxMTEkbzIkZzAkdDE3NTI4OTAxMTEkajYwJGwwJGgw",
    image: "/images/UBC-court.jpg",
    type: "club",
  },
  {
    name: "UE Tennis @ Richmond",
    address: "3691 Viking Wy Unit 14, Richmond, BC V6V 2J5",
    position: { lat: 49.1942, lng: -123.0662 },
    link: "https://www.uetennis.com/",
    image: "/images/UE-court.jpg",
    type: "club",
  },
  {
    name: "Tennis BC Hub @ Stanley Park",
    address: "8901 Stanley Park Dr, Vancouver, BC V6G 3E2",
    position: { lat: 49.2997, lng: -123.1417 },
    link: "https://clubspark.ca/TBCHubStanleyPark",
    image: "/images/tennisBChub-stanleyPark.jpg",
    type: "club",
  },
  // Public courts
  {
    name: "Public Tennis Courts - Queen Elizabeth Park Tennis Courts",
    address: "37 Avenue West, Vancouver, BC V5Y 3X3",
    position: { lat: 49.2372, lng: -123.1126 },
    image: "/images/QueenElizabethCourt.jpg",
    type: "public",
  },
  {
    name: "Public Tennis Courts - Winona Park Tennis Courts",
    address: "Vancouver, BC V5X 4V8",
    position: { lat: 49.2142, lng: -123.1232 },
    image: "/images/Winona-Park.jpg",
    type: "public",
  },
  {
    name: "Public Tennis Courts - Marpole Park Tennis Courts",
    address: "950 W 71st Ave, Vancouver, BC V6P 6H4",
    position: { lat: 49.2131, lng: -123.1307 },
    image: "/images/MarpoleParkCourt.jpg",
    type: "public",
  },
];

function renderStatus(status: Status) {
  if (status === Status.LOADING) return <div>Loading map...</div>;
  if (status === Status.FAILURE) return <div>Failed to load map</div>;
  return <></>;
}

export default function CourtMap() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<{
    courtName: string;
    distance: string;
    duration: string;
    polyline: any;
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const getUserLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const clearRoute = () => {
    setCurrentRoute(null);
    setRouteError(null);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Desktop Header */}
      <header className="hidden lg:flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold text-gray-900">
          Tennis Court Map in Greater Vancouver Area
        </h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              userLocation
                ? "bg-green-600 text-white hover:bg-green-700 focus-visible:outline-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-700"
            } ${isGettingLocation ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={getUserLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? "Getting Location..." : userLocation ? "📍 My Location" : "📍 Get My Location"}
          </button>
          {currentRoute && (
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              onClick={clearRoute}
            >
              🗑️ Clear Route
            </button>
          )}
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            onClick={() => (window.location.href = "/")}
          >
            Back
          </button>
          <div className="ml-6 h-6 w-px bg-gray-300" />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden flex-none bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            Tennis Court Map
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-xs font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                userLocation
                  ? "bg-green-600 text-white hover:bg-green-700 focus-visible:outline-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-700"
              } ${isGettingLocation ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={getUserLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? "Getting..." : userLocation ? "📍 My Location" : "📍 My Location"}
            </button>
            {currentRoute && (
              <button
                type="button"
                className="rounded-md bg-red-600 px-2 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                onClick={clearRoute}
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              onClick={() => (window.location.href = "/")}
            >
              Back
            </button>
          </div>
        </div>
      </header>
      <div className="w-full h-px bg-gray-400" />

      {locationError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{locationError}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  onClick={() => setLocationError(null)}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {routeError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{routeError}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  onClick={() => setRouteError(null)}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Information Panel */}
      {currentRoute && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Route to {currentRoute.courtName}
                </p>
                <p className="text-sm text-blue-700">
                  🚗 {currentRoute.duration} • 📏 {currentRoute.distance}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex rounded-md bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100"
              onClick={clearRoute}
            >
              <span className="sr-only">Clear route</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-full flex flex-col">
        <div className="flex-1 w-full h-full flex items-stretch">
          <div
            style={{
              width: "100vw",
              height: "100%",
              minHeight: 0,
              minWidth: 0,
              border: "none",
              borderRadius: 0,
              margin: 0,
              padding: 0,
              display: "flex",
              flex: 1,
            }}
          >
            <Wrapper
              apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "api_key"}
              libraries={["routes", "geometry"]}
              render={renderStatus}
            >
              <MapComponent 
                activeIdx={activeIdx} 
                setActiveIdx={setActiveIdx} 
                userLocation={userLocation}
                currentRoute={currentRoute}
                setCurrentRoute={setCurrentRoute}
                isCalculatingRoute={isCalculatingRoute}
                setIsCalculatingRoute={setIsCalculatingRoute}
                setRouteError={setRouteError}
              />
            </Wrapper>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapComponent({
  activeIdx,
  setActiveIdx,
  userLocation,
  currentRoute,
  setCurrentRoute,
  isCalculatingRoute,
  setIsCalculatingRoute,
  setRouteError,
}: {
  activeIdx: number | null;
  setActiveIdx: (idx: number | null) => void;
  userLocation: { lat: number; lng: number } | null;
  currentRoute: {
    courtName: string;
    distance: string;
    duration: string;
    polyline: any;
  } | null;
  setCurrentRoute: (route: any) => void;
  isCalculatingRoute: boolean;
  setIsCalculatingRoute: (calculating: boolean) => void;
  setRouteError: (error: string | null) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  const [userMarker, setUserMarker] = React.useState<any>(null);
  const [currentPolyline, setCurrentPolyline] = React.useState<any>(null);

  React.useEffect(() => {
    if (ref.current && !map && window.google && window.google.maps) {
      console.log("Initializing map...");
      console.log("Available Google Maps APIs on init:", Object.keys(window.google.maps).filter(key => key.includes('Service')));
      console.log("RoutesService on init:", !!window.google.maps.RoutesService);
      
      setMap(
        new window.google.maps.Map(ref.current, {
          center: VANCOUVER_CENTER,
          zoom: 12,
        })
      );
    }
  }, [ref, map]);

  // Handle user location marker
  React.useEffect(() => {
    if (!map || !window.google || !window.google.maps || !userLocation) return;

    // Remove existing user marker
    if (userMarker) {
      userMarker.setMap(null);
    }

    // Create user location marker
    const userLocationIcon = "data:image/svg+xml;utf8,<svg width='40' height='56' viewBox='0 0 40 56' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M20 0C9.05888 0 0 9.05888 0 20.25C0 34.125 18.1818 54.1818 19.0091 55.0909C19.553 55.7015 20.447 55.7015 20.9909 55.0909C21.8182 54.1818 40 34.125 40 20.25C40 9.05888 30.9411 0 20 0Z' fill='%233b82f6' stroke='white' stroke-width='4'/><circle cx='20' cy='20' r='8' fill='white'/></svg>";

    const newUserMarker = new window.google.maps.Marker({
      position: userLocation,
      map,
      title: "Your Location",
      icon: {
        url: userLocationIcon,
        scaledSize: new window.google.maps.Size(40, 40),
      },
      zIndex: 1000, // Ensure user marker appears above court markers
    });

    // Add info window for user location
    const userInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style='min-width:150px; text-align:center;'>
          <strong>📍 Your Location</strong><br/>
          <span>Lat: ${userLocation.lat.toFixed(6)}</span><br/>
          <span>Lng: ${userLocation.lng.toFixed(6)}</span>
        </div>
      `,
    });

    newUserMarker.addListener("click", () => {
      userInfoWindow.open(map, newUserMarker);
    });

    setUserMarker(newUserMarker);

    // Center map on user location
    map.setCenter(userLocation);
    map.setZoom(14);

    return () => {
      if (newUserMarker) {
        newUserMarker.setMap(null);
      }
    };
  }, [map, userLocation]);

  // Calculate route function using Routes API
  const calculateRoute = async (destination: { lat: number; lng: number }, courtName: string) => {
    if (!userLocation || !map || !window.google || !window.google.maps) {
      setRouteError("Please get your location first.");
      return;
    }

    setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      console.log("Starting route calculation...");
      console.log("User location:", userLocation);
      console.log("Destination:", destination);
      
      // Check if RoutesService is available, fallback to DirectionsService
      console.log("Checking available APIs...");
      console.log("RoutesService available:", !!window.google.maps.RoutesService);
      console.log("DirectionsService available:", !!window.google.maps.DirectionsService);
      console.log("Available Google Maps APIs:", Object.keys(window.google.maps).filter(key => key.includes('Service')));
      
      if (window.google.maps.RoutesService) {
        console.log("Using Routes API");
        const routesService = new window.google.maps.RoutesService();
        
        const request = {
          origin: userLocation,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          routingPreference: window.google.maps.RoutingPreference.TRAFFIC_AWARE,
        };

        console.log("Routes API request:", request);

        routesService.route(request, (result: any, status: any) => {
          console.log("Routes API response status:", status);
          console.log("Routes API response:", result);
          
          setIsCalculatingRoute(false);
          
          if (status === window.google.maps.RoutesStatus.OK) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            console.log("Route data:", route);
            console.log("Leg data:", leg);
            
                         // Create polyline for the route
             const polyline = new window.google.maps.Polyline({
               path: route.polyline.encodedPath,
               geodesic: true,
               strokeColor: '#3B82F6',
               strokeOpacity: 0.8,
               strokeWeight: 4,
               map: map,
             });

             // Store polyline reference for cleanup
             setCurrentPolyline(polyline);

             // Fit map to show entire route
             const bounds = new window.google.maps.LatLngBounds();
             bounds.extend(userLocation);
             bounds.extend(destination);
             map.fitBounds(bounds);

             setCurrentRoute({
               courtName: courtName,
               distance: leg.distanceMeters ? `${Math.round(leg.distanceMeters / 1000 * 10) / 10} km` : 'Unknown',
               duration: leg.duration ? `${Math.round(leg.duration / 60)} min` : 'Unknown',
               polyline: polyline,
             });
          } else {
            console.error("Routes API error status:", status);
            setRouteError(`Unable to calculate route. Status: ${status}`);
          }
        });
      } else if (window.google.maps.DirectionsService) {
        console.log("Routes API not available, using Directions API as fallback");
        const directionsService = new window.google.maps.DirectionsService();
        
        const request = {
          origin: userLocation,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        };

        console.log("Directions API request:", request);

        directionsService.route(request, (result: any, status: any) => {
          console.log("Directions API response status:", status);
          console.log("Directions API response:", result);
          
          setIsCalculatingRoute(false);
          
          if (status === window.google.maps.DirectionsStatus.OK) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            console.log("Route data:", route);
            console.log("Leg data:", leg);
            
                         // Create polyline for the route
             const polyline = new window.google.maps.Polyline({
               path: route.overview_path,
               geodesic: true,
               strokeColor: '#3B82F6',
               strokeOpacity: 0.8,
               strokeWeight: 4,
               map: map,
             });

             // Store polyline reference for cleanup
             setCurrentPolyline(polyline);

             // Fit map to show entire route
             const bounds = new window.google.maps.LatLngBounds();
             bounds.extend(userLocation);
             bounds.extend(destination);
             map.fitBounds(bounds);

             setCurrentRoute({
               courtName: courtName,
               distance: leg.distance.text,
               duration: leg.duration.text,
               polyline: polyline,
             });
          } else {
            console.error("Directions API error status:", status);
            setRouteError(`Unable to calculate route. Status: ${status}`);
          }
        });
      } else {
        console.error("Neither RoutesService nor DirectionsService available");
        setRouteError("Routing APIs not available. Please enable Routes API or Directions API in Google Cloud Console.");
        setIsCalculatingRoute(false);
        return;
      }
    } catch (error) {
      console.error("Error in calculateRoute:", error);
      setIsCalculatingRoute(false);
      setRouteError(`Error calculating route: ${error.message || 'Unknown error'}`);
    }
  };

  // Clear route when currentRoute changes to null
  React.useEffect(() => {
    if (!currentRoute && map) {
      // Remove the polyline from the map
      if (currentPolyline) {
        currentPolyline.setMap(null);
        setCurrentPolyline(null);
      }
      
      // Reset map view to show all courts
      const bounds = new window.google.maps.LatLngBounds();
      COURTS.forEach(court => {
        bounds.extend(court.position);
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds);
    }
  }, [currentRoute, map, userLocation, currentPolyline]);

  React.useEffect(() => {
    // @ts-ignore
    if (!map || !window.google || !window.google.maps) return;
    const markers: any[] = [];
    const infowindows: any[] = [];
    COURTS.forEach((court, idx) => {
      const emeraldIcon =
        "data:image/svg+xml;utf8,<svg width='40' height='56' viewBox='0 0 40 56' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M20 0C9.05888 0 0 9.05888 0 20.25C0 34.125 18.1818 54.1818 19.0091 55.0909C19.553 55.7015 20.447 55.7015 20.9909 55.0909C21.8182 54.1818 40 34.125 40 20.25C40 9.05888 30.9411 0 20 0Z' fill='%2334d399' stroke='white' stroke-width='4'/><circle cx='20' cy='20' r='8' fill='white'/></svg>";
      const marker = new window.google.maps.Marker({
        position: court.position,
        map,
        title: court.name,
        icon:
          court.type === "public"
            ? {
                url: emeraldIcon,
                scaledSize: new window.google.maps.Size(40, 40),
              }
            : undefined,
      });

      // Enhanced content with route button and link button
      const routeButton = userLocation 
        ? `<button onclick="window.calculateRouteToCourt(${court.position.lat}, ${court.position.lng}, '${court.name}')" style="background: #3B82F6; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-top: 8px; cursor: pointer; font-size: 12px;">🚗 Get Directions</button>`
        : `<p style="color: #6B7280; font-size: 12px; margin-top: 8px;">📍 Get your location first for directions</p>`;

      const linkButton = court.type === "club" 
        ? `<button onclick="window.openLink('${court.link}')" style="background: #10B981; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-top: 8px; cursor: pointer; font-size: 12px;">🔗 Visit Website</button>`
        : `<button onclick="window.openLink('https://www.google.com/search?q=${encodeURIComponent(court.name + " " + court.address)}')" style="background: #10B981; color: white; border: none; padding: 8px 12px; border-radius: 4px; margin-top: 8px; cursor: pointer; font-size: 12px;">🔍 Search on Google</button>`;

      const content = `
        <div style='min-width:200px; display:flex; flex-direction:column; align-items:center; gap:8px;'>
          <img src=${court.image} alt="${court.name}" style="width:175px; height:125px; object-fit:cover; border-radius:8px;"/>
          <strong>${court.name}</strong><br/>
          <span>${court.address}</span><br/>
          ${routeButton}
          ${linkButton}
        </div>
      `;

      // @ts-ignore
      const infowindow = new window.google.maps.InfoWindow({ content });
      
      marker.addListener("click", () => {
        // Open info window on click instead of mouseover
        infowindow.open(map, marker);
        setActiveIdx(idx);
      });
      
      // Close info window when clicking elsewhere on the map
      map.addListener("click", () => {
        infowindow.close();
        setActiveIdx(null);
      });

      markers.push(marker);
      infowindows.push(infowindow);
    });

    // Add global functions for route calculation and link opening
    // @ts-ignore
    window.calculateRouteToCourt = (lat: number, lng: number, courtName: string) => {
      calculateRoute({ lat, lng }, courtName);
    };
    
    // @ts-ignore
    window.openLink = (url: string) => {
      window.open(url, "_blank");
    };

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      infowindows.forEach((iw) => iw.close());
      // @ts-ignore
      delete window.calculateRouteToCourt;
      // @ts-ignore
      delete window.openLink;
    };
  }, [map, setActiveIdx, userLocation, calculateRoute]);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 400 }} />
  );
}
