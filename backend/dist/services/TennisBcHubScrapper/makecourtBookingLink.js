/**
 * Build the booking link.
 * @param {string} locKey - The location key (e.g., "richmond" or "stanley").
 * @param {string} courtNumberStr - The court number string from the resource (e.g., "Bubble Court 1").
 * @param {Object} locationInfo - An object mapping locKey to its info (including resourceFingerprint).
 * @returns {string} The constructed booking URL.
 */
function makecourtBookingLink(locKey, courtNumberStr, locationInfo) {
    // Use the resourceFingerprint for the location
    const fingerprint = locationInfo[locKey].resourceFingerprint;
    // Define a date formatter.
    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };
    // Today's date as the start date.
    const today = new Date();
    const startDate = formatDate(today);
    // End date is 7 days later.
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    const endDate = formatDate(end);
    // Extract a number from courtNumberStr. For example, if courtNumberStr is "Bubble Court 1",
    // then extract "1" and subtract 1 to get a 0-indexed resource number.
    const match = courtNumberStr.match(/(\d+)\s*$/);
    let resourceIndex = 0;
    if (match && match[1]) {
        resourceIndex = Number(match[1]) - 1;
    }
    // Construct the booking link using the parameters and static role=guest.
    const bookingUrl = `https://clubspark.ca/${fingerprint}/Booking/bookbycourt#?startDate=${startDate}&endDate=${endDate}&resource=${resourceIndex}&&role=guest`;
    return bookingUrl;
}
module.exports = { makecourtBookingLink };
