export function parseDatesFromPrompt(prompt) {
  if (!prompt) return [];
  const text = prompt.toLowerCase();
  const dates = [];
  const now = new Date();

  // 1. Check relative date keywords
  if (text.includes('today')) {
    dates.push(now.toISOString().slice(0, 10));
  }
  if (text.includes('yesterday')) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    dates.push(yesterday.toISOString().slice(0, 10));
  }

  // 2. Match standard ISO dates: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY
  const isoPattern = /\b(\d{4})[-/](\d{2})[-/](\d{2})\b/g;
  let match;
  while ((match = isoPattern.exec(text)) !== null) {
    dates.push(`${match[1]}-${match[2]}-${match[3]}`);
  }

  const dmyPattern = /\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/g;
  while ((match = dmyPattern.exec(text)) !== null) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    dates.push(`${year}-${month}-${day}`);
  }

  // 3. Match written dates: e.g., "28th may", "may 28", "28 may"
  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  Object.entries(months).forEach(([monthName, monthVal]) => {
    // Matches "28 may", "28th may", "28th of may"
    const pattern1 = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${monthName}\\b`, 'g');
    let m;
    while ((m = pattern1.exec(text)) !== null) {
      const day = m[1].padStart(2, '0');
      const year = now.getFullYear();
      dates.push(`${year}-${monthVal}-${day}`);
    }

    // Matches "may 28", "may 28th"
    const pattern2 = new RegExp(`\\b${monthName}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'g');
    while ((m = pattern2.exec(text)) !== null) {
      const day = m[1].padStart(2, '0');
      const year = now.getFullYear();
      dates.push(`${year}-${monthVal}-${day}`);
    }
  });

  return Array.from(new Set(dates));
}
