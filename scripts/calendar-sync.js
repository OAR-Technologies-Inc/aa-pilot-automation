/**
 * Calendar Sync - Export pilot schedule to Google Calendar
 * 
 * Prerequisites:
 * 1. Create Google Cloud project
 * 2. Enable Calendar API
 * 3. Create service account
 * 4. Download credentials JSON to ./credentials/google-calendar-sa.json
 * 5. Share your calendar with the service account email
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = process.env.AA_CONFIG || path.join(__dirname, '..', 'config.json');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials', 'google-calendar-sa.json');

let config = {};
let credentials = {};

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error('Warning: config.json not found, using defaults');
}

try {
  credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
} catch (e) {
  console.error('Error: Google Calendar credentials not found');
  console.error('Expected at:', CREDENTIALS_PATH);
  process.exit(1);
}

const CALENDAR_ID = config.google?.calendarId || 'primary';

/**
 * Get authenticated Google Calendar service
 */
async function getCalendarService() {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  
  const authClient = await auth.getClient();
  return google.calendar({ version: 'v3', auth: authClient });
}

/**
 * Create a calendar event
 * @param {Object} calendar - Google Calendar service
 * @param {Object} event - Event data
 */
async function createEvent(calendar, event) {
  try {
    const result = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });
    console.log(`Created event: ${event.summary}`);
    return result.data;
  } catch (error) {
    console.error(`Error creating event: ${event.summary}`, error.message);
    throw error;
  }
}

/**
 * Delete events matching a prefix within a date range
 * @param {Object} calendar - Google Calendar service
 * @param {string} prefix - Event summary prefix to match
 * @param {string} timeMin - Start date (ISO format)
 * @param {string} timeMax - End date (ISO format)
 */
async function deleteEventsByPrefix(calendar, prefix, timeMin, timeMax) {
  try {
    const events = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      q: prefix,
    });
    
    for (const event of events.data.items || []) {
      if (event.summary && event.summary.startsWith(prefix)) {
        await calendar.events.delete({
          calendarId: CALENDAR_ID,
          eventId: event.id,
        });
        console.log(`Deleted: ${event.summary}`);
      }
    }
  } catch (error) {
    console.error('Error deleting events:', error.message);
  }
}

/**
 * Test calendar connection
 */
async function testConnection(calendar) {
  try {
    const result = await calendar.calendarList.list();
    console.log('Connected to Google Calendar!');
    console.log('Available calendars:');
    for (const cal of result.data.items || []) {
      console.log(`  - ${cal.summary} (${cal.id})`);
    }
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('\nMake sure you shared your calendar with the service account:');
    console.error(`  ${credentials.client_email}`);
    return false;
  }
}

/**
 * Convert parsed schedule to calendar events
 * @param {Object} schedule - Parsed schedule from schedule-parser.js
 * @returns {Array<Object>} Calendar events
 */
function scheduleToEvents(schedule) {
  const events = [];
  const year = schedule.year || new Date().getFullYear();
  const monthMap = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };
  const month = monthMap[schedule.month] || '01';
  
  // Create events for sequences
  // Note: This is a simplified version - actual implementation would need
  // sequence detail parsing to get exact dates and routes
  for (const seq of schedule.sequences || []) {
    events.push({
      summary: `✈️ SEQ ${seq}`,
      description: `Sequence ${seq}\nCredit: ${schedule.credit?.projected || 'TBD'}`,
      start: { date: `${year}-${month}-01` },  // Placeholder - needs actual dates
      end: { date: `${year}-${month}-02` },
      colorId: '9',  // Blue
    });
  }
  
  // Create events for vacation
  for (const day of schedule.vacation || []) {
    const dayStr = String(day).padStart(2, '0');
    events.push({
      summary: '🏖️ VACATION',
      description: 'Vacation Day',
      start: { date: `${year}-${month}-${dayStr}` },
      end: { date: `${year}-${month}-${dayStr}` },
      colorId: '5',  // Yellow
    });
  }
  
  // Create events for DFP
  for (const day of schedule.dfp || []) {
    const dayStr = String(day).padStart(2, '0');
    events.push({
      summary: '🟢 DFP',
      description: 'Duty Free Period - Available',
      start: { date: `${year}-${month}-${dayStr}` },
      end: { date: `${year}-${month}-${dayStr}` },
      colorId: '10',  // Green
    });
  }
  
  return events;
}

/**
 * Sync schedule events to calendar
 * @param {Array<Object>} events - Events to sync
 * @param {string} month - Month in YYYY-MM format
 */
async function syncSchedule(events, month) {
  const calendar = await getCalendarService();
  
  // Test connection first
  const connected = await testConnection(calendar);
  if (!connected) {
    throw new Error('Failed to connect to Google Calendar');
  }
  
  // Clear existing events for the month
  const [year, monthNum] = month.split('-');
  const startDate = `${month}-01T00:00:00Z`;
  const endDate = new Date(parseInt(year), parseInt(monthNum), 1).toISOString();
  
  console.log(`\nClearing existing events for ${month}...`);
  await deleteEventsByPrefix(calendar, '✈️', startDate, endDate);
  await deleteEventsByPrefix(calendar, '🏖️', startDate, endDate);
  await deleteEventsByPrefix(calendar, '🟢', startDate, endDate);
  
  console.log(`\nCreating ${events.length} events...`);
  for (const event of events) {
    await createEvent(calendar, event);
  }
  
  console.log('\n✅ Calendar sync complete!');
}

/**
 * Create a manual sequence event
 * @param {Object} seqData - Sequence data
 */
async function createSequenceEvent(seqData) {
  const calendar = await getCalendarService();
  
  const hasDeadhead = seqData.hasDeadhead || false;
  const colorId = hasDeadhead ? '11' : '9';  // Red for deadhead, Blue for normal
  const emoji = hasDeadhead ? '✈️🚐' : '✈️';
  
  const event = {
    summary: `${emoji} SEQ ${seqData.number} | ${seqData.route}`,
    description: `Sequence ${seqData.number}
${seqData.description || ''}

${seqData.details || ''}

Credit: ${seqData.credit || 'TBD'}
TAFB: ${seqData.tafb || 'TBD'}`,
    start: { date: seqData.startDate },
    end: { date: seqData.endDate },
    colorId: colorId,
  };
  
  return await createEvent(calendar, event);
}

module.exports = {
  getCalendarService,
  createEvent,
  deleteEventsByPrefix,
  testConnection,
  scheduleToEvents,
  syncSchedule,
  createSequenceEvent
};

// CLI mode
if (require.main === module) {
  const action = process.argv[2] || 'test';
  
  (async () => {
    const calendar = await getCalendarService();
    
    switch (action) {
      case 'test':
        await testConnection(calendar);
        break;
        
      case 'clear':
        const month = process.argv[3];
        if (!month) {
          console.log('Usage: node calendar-sync.js clear 2026-04');
          break;
        }
        const [year, monthNum] = month.split('-');
        const startDate = `${month}-01T00:00:00Z`;
        const endDate = new Date(parseInt(year), parseInt(monthNum), 1).toISOString();
        await deleteEventsByPrefix(calendar, '✈️', startDate, endDate);
        console.log('Cleared events');
        break;
        
      case 'add':
        // Example: node calendar-sync.js add 22264 MIA→CLT→CMH 2026-04-03 2026-04-07
        const seqNum = process.argv[3];
        const route = process.argv[4];
        const startDateArg = process.argv[5];
        const endDateArg = process.argv[6];
        
        if (!seqNum || !route || !startDateArg || !endDateArg) {
          console.log('Usage: node calendar-sync.js add <seqNum> <route> <startDate> <endDate>');
          console.log('Example: node calendar-sync.js add 22264 MIA→CLT→CMH 2026-04-03 2026-04-07');
          break;
        }
        
        await createSequenceEvent({
          number: seqNum,
          route: route,
          startDate: startDateArg,
          endDate: endDateArg
        });
        break;
        
      default:
        console.log('Usage: node calendar-sync.js [test|clear|add]');
    }
  })().catch(console.error);
}
