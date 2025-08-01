// Helper function to convert 12h to 24h format
function convertTo24Hour(time12h: string): string {
  if (!time12h) return "";

  // If already in 24h format, return as is
  if (!time12h.includes("AM") && !time12h.includes("PM")) {
    return time12h;
  }

  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes || "00"}`;
}

// API function to fetch freed courts
export async function fetchFreedCourts() {
  try {
    const response = await fetch("http://127.0.0.1:4325/api/freed-courts");
    if (!response.ok) {
      throw new Error(`Failed to fetch freed courts: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching freed courts:", error);
    throw error;
  }
}

// Helper function to format court information for toast
export function formatFreedCourtsMessage(response: any) {
  const freedCourts = response.freed_courts || [];

  if (freedCourts.length === 0) {
    return null;
  }

  if (freedCourts.length === 1) {
    const court = freedCourts[0];
    const date = new Date(court.date).toLocaleDateString("en-CA").slice(2); // YY-MM-DD format, remove 20
    const time = court.startTime || court.time;
    // Convert 12h to 24h format if needed
    const time24 = convertTo24Hour(time);
    return `🎾 ${court.clubName} Court ${court.courtNumber} at ${time24}, ${date} just freed up, check it out!`;
  } else {
    const clubs = [...new Set(freedCourts.map((court: any) => court.clubName))];

    if (clubs.length === 1) {
      const times = freedCourts.map((court: any) => {
        const date = new Date(court.date).toLocaleDateString("en-CA").slice(2); // YY-MM-DD, remove 20
        const time = court.startTime || court.time;
        const time24 = convertTo24Hour(time);
        return `${time24} ${date}`;
      });
      return `🎾 Some courts freed up at ${clubs[0]}: ${times.join(", ")}`;
    } else {
      const times = freedCourts.map((court: any) => {
        const date = new Date(court.date).toLocaleDateString("en-CA").slice(2); // YY-MM-DD, remove 20
        const time = court.startTime || court.time;
        const time24 = convertTo24Hour(time);
        return `${time24} ${date}`;
      });
      return `🎾 ${freedCourts.length} courts freed up: ${times.join(", ")}`;
    }
  }
}
