/**
 * Build the booking link.
 * @param {string} locKey - The location key (e.g., "richmond" or "stanley").
 * @param {string} courtNumberStr - The court number string from the resource (e.g., "Bubble Court 1").
 * @param {Object} locationInfo - An object mapping locKey to its info (including resourceFingerprint).
 * @returns {string} The constructed booking URL.
 */
export function makecourtBookingLink(locKey: string, courtNumberStr: string, locationInfo: any): string;
