/**
 * Schedule Parser for HI1/HI2 Output
 * Parses FOS/DECS schedule format into structured JSON
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'schedule');

/**
 * Parse HI1/HI2 raw output into structured schedule
 * @param {string} rawText - Raw HI1/HI2 output
 * @returns {object} Parsed schedule
 */
function parseSchedule(rawText) {
  const schedule = {
    meta: {},
    hours: {},
    days: [],
    sequences: {},
    raw: rawText,
    parsedAt: new Date().toISOString()
  };
  
  // Extract header info
  const monthMatch = rawText.match(/MONTH ENDING (\d{2}[A-Z]{3}\d{2})/);
  if (monthMatch) schedule.meta.monthEnding = monthMatch[1];
  
  const asOfMatch = rawText.match(/AS OF (\d{2}[A-Z]{3}\d{2}\/\d{4})/);
  if (asOfMatch) schedule.meta.asOf = asOfMatch[1];
  
  const empMatch = rawText.match(/(\d{6})\s+([A-Z]{3})\s+(\d{4})-([A-Z]{2})\s+(\d{3})/);
  if (empMatch) {
    schedule.meta.empNumber = empMatch[1];
    schedule.meta.base = empMatch[2];
    schedule.meta.selector = empMatch[3];
    schedule.meta.position = empMatch[4];
    schedule.meta.equipment = empMatch[5];
  }
  
  // Extract hours
  const projMatch = rawText.match(/PROJ\s+([\d.]+)/);
  if (projMatch) schedule.hours.projected = parseFloat(projMatch[1]);
  
  const gtdMatch = rawText.match(/GTD\s+([\d.]+)/);
  if (gtdMatch) schedule.hours.guaranteed = parseFloat(gtdMatch[1]);
  
  const vmaxMatch = rawText.match(/VMAX\s+([\d.]+)/);
  if (vmaxMatch) schedule.hours.vmax = parseFloat(vmaxMatch[1]);
  
  const imaxMatch = rawText.match(/IPMAX\s+([\d.]+)/);
  if (imaxMatch) schedule.hours.ipmax = parseFloat(imaxMatch[1]);
  
  // Parse day-by-day schedule
  // Split into lines for better parsing
  const textLines = rawText.split('\n');
  let currentSeq = null;
  
  for (const line of textLines) {
    // Look for day entries: "DD 14 ..."
    const dayMatch = line.match(/^(\d{2})\s+14\s+(.*)$/);
    if (dayMatch) {
      const day = parseInt(dayMatch[1]);
      const content = dayMatch[2].trim();
      
      let dayEntry = {
        day: day,
        raw: content,
        type: 'unknown'
      };
      
      // Determine day type
      if (content.includes('VC') && content.includes('DO')) {
        dayEntry.type = 'vacation';
      } else if (content === 'DO' || content.match(/^DO\s*$/)) {
        dayEntry.type = 'day_off';
      } else if (content.includes('24 0000 2400') || content.match(/^24\s+0000\s+2400/)) {
        dayEntry.type = 'dfp';
      } else if (content.match(/^\d{5}/)) {
        // Sequence number (5 digits)
        const seqMatch = content.match(/^(\d{5})/);
        if (seqMatch) {
          dayEntry.type = 'sequence_start';
          dayEntry.sequence = seqMatch[1];
          currentSeq = seqMatch[1];
        }
      } else if (content.match(/^-?\d{3,4}/) || content.includes('BASE')) {
        // Continuation of sequence (flight numbers) or sequence end
        dayEntry.type = 'sequence_cont';
        dayEntry.sequence = currentSeq;
        
        if (content.includes('BASE')) {
          dayEntry.type = 'sequence_end';
          // Extract sequence summary
          const tafbMatch = content.match(/TAFB\s+([\d.]+)/);
          
          if (currentSeq && !schedule.sequences[currentSeq]) {
            schedule.sequences[currentSeq] = {
              number: currentSeq,
              tafb: tafbMatch ? tafbMatch[1] : null
            };
          }
        }
      }
      
      schedule.days.push(dayEntry);
    }
  }
  
  return schedule;
}

/**
 * Compare two schedules and return differences
 * @param {object} oldSchedule - Previous schedule
 * @param {object} newSchedule - Current schedule
 * @returns {object} Differences found
 */
function compareSchedules(oldSchedule, newSchedule) {
  const changes = {
    hasChanges: false,
    hoursChanged: false,
    daysChanged: [],
    sequencesAdded: [],
    sequencesRemoved: [],
    summary: []
  };
  
  if (!oldSchedule || !oldSchedule.days) {
    changes.summary.push('No previous schedule to compare');
    return changes;
  }
  
  // Compare hours
  if (oldSchedule.hours && newSchedule.hours) {
    if (oldSchedule.hours.projected !== newSchedule.hours.projected) {
      changes.hoursChanged = true;
      changes.hasChanges = true;
      changes.summary.push(`Projected hours: ${oldSchedule.hours.projected} → ${newSchedule.hours.projected}`);
    }
  }
  
  // Compare sequences
  const oldSeqs = new Set(Object.keys(oldSchedule.sequences || {}));
  const newSeqs = new Set(Object.keys(newSchedule.sequences || {}));
  
  for (const seq of newSeqs) {
    if (!oldSeqs.has(seq)) {
      changes.sequencesAdded.push(seq);
      changes.hasChanges = true;
      changes.summary.push(`Sequence added: ${seq}`);
    }
  }
  
  for (const seq of oldSeqs) {
    if (!newSeqs.has(seq)) {
      changes.sequencesRemoved.push(seq);
      changes.hasChanges = true;
      changes.summary.push(`Sequence removed: ${seq}`);
    }
  }
  
  // Compare day-by-day
  const oldDaysMap = new Map(oldSchedule.days.map(d => [d.day, d]));
  const newDaysMap = new Map(newSchedule.days.map(d => [d.day, d]));
  
  for (const [day, newDay] of newDaysMap) {
    const oldDay = oldDaysMap.get(day);
    if (!oldDay) {
      changes.daysChanged.push({ day, change: 'added', newType: newDay.type });
      changes.hasChanges = true;
    } else if (oldDay.type !== newDay.type || oldDay.sequence !== newDay.sequence) {
      changes.daysChanged.push({ 
        day, 
        change: 'modified', 
        oldType: oldDay.type, 
        newType: newDay.type,
        oldSeq: oldDay.sequence,
        newSeq: newDay.sequence
      });
      changes.hasChanges = true;
      changes.summary.push(`Day ${day}: ${oldDay.type}${oldDay.sequence ? ' (' + oldDay.sequence + ')' : ''} → ${newDay.type}${newDay.sequence ? ' (' + newDay.sequence + ')' : ''}`);
    }
  }
  
  return changes;
}

/**
 * Save schedule to file
 * @param {object} schedule - Parsed schedule
 * @param {string} month - Month identifier (e.g., 'FEB2026', 'MAR2026')
 */
function saveSchedule(schedule, month) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filename = path.join(DATA_DIR, `${month}.json`);
  fs.writeFileSync(filename, JSON.stringify(schedule, null, 2));
  console.log(`Saved schedule to ${filename}`);
}

/**
 * Load schedule from file
 * @param {string} month - Month identifier
 * @returns {object|null} Loaded schedule or null
 */
function loadSchedule(month) {
  const filename = path.join(DATA_DIR, `${month}.json`);
  if (fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  }
  return null;
}

/**
 * Get current and next month identifiers
 * @returns {object} { current: 'FEB2026', next: 'MAR2026' }
 */
function getMonthIdentifiers() {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const year = now.getFullYear();
  const currentMonth = months[now.getMonth()];
  const nextMonth = months[(now.getMonth() + 1) % 12];
  const nextYear = now.getMonth() === 11 ? year + 1 : year;
  
  return {
    current: `${currentMonth}${year}`,
    next: `${nextMonth}${nextYear}`
  };
}

module.exports = {
  parseSchedule,
  compareSchedules,
  saveSchedule,
  loadSchedule,
  getMonthIdentifiers
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'parse' && args[1]) {
    // Parse raw text from file
    const input = fs.readFileSync(args[1], 'utf8');
    const schedule = parseSchedule(input);
    console.log(JSON.stringify(schedule, null, 2));
  } else if (args[0] === 'compare' && args[1] && args[2]) {
    const old = loadSchedule(args[1]);
    const current = loadSchedule(args[2]);
    const changes = compareSchedules(old, current);
    console.log(JSON.stringify(changes, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node schedule-parser.js parse <file>');
    console.log('  node schedule-parser.js compare <oldMonth> <newMonth>');
  }
}
