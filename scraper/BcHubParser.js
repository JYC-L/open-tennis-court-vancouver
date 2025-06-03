import fetch from "node-fetch";
import fs from "fs";
import { bcHubInceptor } from "./BcHubInceptor.js";

// Helper function to convert minutes to HH:MM format.
function minutesToTime(minutes) {
  const baseDate = new Date(2025, 5, 3); // June (months are 0-based in JS)
  baseDate.setHours(0);
  baseDate.setMinutes(minutes);
  return baseDate.toTimeString().slice(0, 5);
}

// Process one location: update URL, fetch data, write CSV.
async function processLocation(location) {
  const instance = new bcHubInceptor(location);
  await instance.updateTargetURL();
  const url = instance.target_url;
  
  const headers = { "User-Agent": "Mozilla/5.0" };

  console.log(`Fetching data for ${location} from: ${url}`);
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${location}. Status: ${response.status}`);
  }
  const data = await response.json();
  const sessionList = [];

  data.Resources.forEach((resource) => {
    const courtName = resource.Name;
    (resource.Days || []).forEach((day) => {
      (day.Sessions || []).forEach((session) => {
        sessionList.push({
          Court: courtName,
          Date: (day.Date || "").split("T")[0],
          "Session Name": session.Name,
          "Start Time": minutesToTime(session.StartTime),
          "End Time": minutesToTime(session.EndTime),
          "Interval (min)": session.Interval,
          Category: session.Category,
          SubCategory: session.SubCategory,
          Capacity: session.Capacity,
          Restrictions: session.Restrictions || "None",
          "Court Cost": session.CourtCost,
          "Guest Price": session.GuestPrice,
          "Member Price": session.MemberPrice
        });
      });
    });
  });

  if (sessionList.length === 0) {
    console.log(`No session data found for ${location}.`);
    return;
  }

  // Create CSV content.
  const csvHeaders = Object.keys(sessionList[0]);
  const csvRows = [
    csvHeaders.join(","),
    ...sessionList.map((row) =>
      csvHeaders.map((h) => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ];

  const fileName = `${location}_availability_${instance.startDate}->${instance.endDate}.csv`;
  fs.writeFileSync(fileName, csvRows.join("\n"));
  console.log(`✅ Data saved to ${fileName}.`);
}

// Main async function: process all locations serially.
(async () => {
  try {
    const locations = ["stanley", "richmond"];
    for (const loc of locations) {
      try {
        await processLocation(loc);
      } catch (error) {
        console.error(`Error processing ${loc}:`, error);
      }
    }
  } catch (error) {
    console.error("General error:", error);
  }
})();
