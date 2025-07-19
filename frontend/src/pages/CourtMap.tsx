import { Status, Wrapper } from "@googlemaps/react-wrapper";
import React, { useState } from "react";

import Paper from "@mui/material/Paper";

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
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="w-full h-[80vh] flex flex-col items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-3xl mb-4 ">
          <h1 className="text-2xl flex-1 font-bold mb-4">
            Tennis Court Map in Greater Vancouver Area
          </h1>
          <button
            className="ml-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm bg-green-400"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
        <Paper
          elevation={6}
          sx={{
            width: { xs: "95vw", sm: "80vw", md: "75vw", lg: "65vw" },
            height: "70vh",
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            border: "2px solid #10b981",
            margin: "auto",
          }}
        >
          <Wrapper
            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "api_key"}
            render={renderStatus}
          >
            <MapComponent activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
          </Wrapper>
        </Paper>
      </div>
    </div>
  );
}

function MapComponent({
  activeIdx,
  setActiveIdx,
}: {
  activeIdx: number | null;
  setActiveIdx: (idx: number | null) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  React.useEffect(() => {
    if (ref.current && !map && window.google && window.google.maps) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center: VANCOUVER_CENTER,
          zoom: 12,
        })
      );
    }
  }, [ref, map]);

  React.useEffect(() => {
    // @ts-ignore
    if (!map || !window.google || !window.google.maps) return;
    const markers: any[] = [];
    const infowindows: any[] = [];
    COURTS.forEach((court, idx) => {
      const marker = new window.google.maps.Marker({
        position: court.position,
        map,
        title: court.name,
        icon:
          court.type === "public"
            ? {
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                // @ts-ignore
                scaledSize: new window.google.maps.Size(40, 40),
              }
            : undefined,
      });
      const content = `
        <div style='min-width:180px; display:flex; flex-direction:column; align-items:center; gap:8px;'>
          <img src=${court.image} alt="${court.name}" style="width:175px; height:125px; object-fit:cover; border-radius:8px;"/>
          <strong>${court.name}</strong><br/>
          <span>${court.address}</span><br/>
        </div>
      `;
      // @ts-ignore
      const infowindow = new window.google.maps.InfoWindow({ content });
      marker.addListener("mouseover", () => {
        infowindow.open(map, marker);
        setActiveIdx(idx);
      });
      marker.addListener("mouseout", () => {
        infowindow.close();
        setActiveIdx(null);
      });
      marker.addListener("click", () => {
        if (court.type === "club") window.open(court.link, "_blank");
        else {
          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(
              court.name + " " + court.address
            )}`,
            "_blank"
          );
        }
      });
      markers.push(marker);
      infowindows.push(infowindow);
    });
    return () => {
      markers.forEach((marker) => marker.setMap(null));
      infowindows.forEach((iw) => iw.close());
    };
  }, [map, setActiveIdx]);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 400 }} />
  );
}
