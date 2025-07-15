import { Status, Wrapper } from "@googlemaps/react-wrapper";
import React, { useState } from "react";

const VANCOUVER_CENTER = { lat: 49.246292, lng: -123.116226 };
const COURTS = [
  {
    name: "Tennis BC Hub @ Richmond",
    address: "10251 St Edwards Dr, Richmond, BC V6X 2M9",
    position: { lat: 49.1806, lng: -123.0976 },
  },
  {
    name: "UBC Tennis Centre",
    address: "6160 Thunderbird Blvd, Vancouver, BC V6T 1Z3",
    position: { lat: 49.2531, lng: -123.2417 },
  },
  {
    name: "UE Tennis",
    address: "3691 Viking Wy Unit 14, Richmond, BC V6V 2J5",
    position: { lat: 49.1942, lng: -123.0662 },
  },
  {
    name: "Tennis BC Hub @ Stanley Park",
    address: "8901 Stanley Park Dr, Vancouver, BC V6G 3E2",
    position: { lat: 49.2997, lng: -123.1417 },
  },
];

function renderStatus(status: Status) {
  if (status === Status.LOADING) return <div>Loading map...</div>;
  if (status === Status.FAILURE) return <div>Failed to load map</div>;
  return null;
}

export default function CourtMap() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Tennis Court Map</h1>
      <div className="w-full h-full" style={{ height: "70vh", minHeight: 400 }}>
        <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"} render={renderStatus}>
          <MapComponent activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
        </Wrapper>
      </div>
    </div>
  );
}

function MapComponent({ activeIdx, setActiveIdx }: { activeIdx: number | null; setActiveIdx: (idx: number | null) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  React.useEffect(() => {
    // @ts-ignore
    if (ref.current && !map && window.google && window.google.maps) {
      // @ts-ignore
      setMap(
        new window.google.maps.Map(ref.current, {
          center: VANCOUVER_CENTER,
          zoom: 11,
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
      // @ts-ignore
      const marker = new window.google.maps.Marker({
        position: court.position,
        map,
        title: court.name,
      });
      const content = `
        <div style='min-width:200px'>
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
        window.open(`https://www.google.com/search?q=${encodeURIComponent(court.name + ' ' + court.address)}`, "_blank");
      });
      markers.push(marker);
      infowindows.push(infowindow);
    });
    return () => {
      markers.forEach((marker) => marker.setMap(null));
      infowindows.forEach((iw) => iw.close());
    };
  }, [map, setActiveIdx]);

  return <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 400 }} />;
} 