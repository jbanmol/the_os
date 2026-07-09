/**
 * Calculates the logical date (YYYY-MM-DD) based on a 4:00 AM rolling boundary.
 * Any time between midnight and 3:59:59 AM is treated as part of the previous day.
 */
export function getLogicalDate(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  
  // Subtract 4 hours (4 * 60 * 60 * 1000 milliseconds)
  const shifted = new Date(d.getTime() - 4 * 60 * 60 * 1000);
  
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the difference in calendar days between two logical date strings (YYYY-MM-DD).
 * Returns date1 - date2 in days.
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(12, 0, 0, 0);
  d2.setHours(12, 0, 0, 0);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
