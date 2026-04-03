/**
 * Aviation Weather Brief
 * Fetches FAA-approved weather data from aviationweather.gov
 * 
 * Sources:
 * - METAR: Current surface observations
 * - TAF: Terminal Aerodrome Forecast (24-30 hour forecast)
 * - SIGMET/AIRMET: Significant weather advisories
 */

const https = require('https');

const AWC_BASE = 'https://aviationweather.gov/api/data';

/**
 * Fetch METAR for airport(s)
 * @param {string|string[]} airports - ICAO code(s) e.g., 'KMIA' or ['KMIA', 'KBNA']
 * @returns {Promise<string>} Raw METAR text
 */
async function fetchMETAR(airports) {
  const ids = Array.isArray(airports) ? airports.join(',') : airports;
  const url = `${AWC_BASE}/metar?ids=${ids}&format=raw&taf=false`;
  return fetchText(url);
}

/**
 * Fetch TAF for airport(s)
 * @param {string|string[]} airports - ICAO code(s)
 * @returns {Promise<string>} Raw TAF text
 */
async function fetchTAF(airports) {
  const ids = Array.isArray(airports) ? airports.join(',') : airports;
  const url = `${AWC_BASE}/taf?ids=${ids}&format=raw`;
  return fetchText(url);
}

/**
 * Fetch SIGMETs for a region
 * @param {string} region - Region code (e.g., 'US' for all US)
 * @returns {Promise<string>} SIGMET text
 */
async function fetchSIGMET(region = 'US') {
  const url = `${AWC_BASE}/airsigmet?format=raw&type=sigmet`;
  return fetchText(url);
}

/**
 * Fetch AIRMETs
 * @returns {Promise<string>} AIRMET text
 */
async function fetchAIRMET() {
  const url = `${AWC_BASE}/airsigmet?format=raw&type=airmet`;
  return fetchText(url);
}

/**
 * Convert 3-letter IATA to 4-letter ICAO (US airports)
 * @param {string} iata - 3-letter code (e.g., 'MIA')
 * @returns {string} 4-letter ICAO code (e.g., 'KMIA')
 */
function iataToIcao(iata) {
  // US airports typically just need 'K' prefix
  if (iata.length === 3) {
    return 'K' + iata.toUpperCase();
  }
  return iata.toUpperCase();
}

/**
 * Fetch text from URL
 */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Generate full weather brief for a trip
 * @param {string[]} airports - List of airports in order (departure, enroute, arrival)
 * @returns {Promise<object>} Weather brief
 */
async function generateWeatherBrief(airports) {
  const icaoAirports = airports.map(iataToIcao);
  
  const [metarRaw, tafRaw, sigmetRaw, airmetRaw] = await Promise.all([
    fetchMETAR(icaoAirports),
    fetchTAF(icaoAirports),
    fetchSIGMET(),
    fetchAIRMET()
  ]);
  
  const brief = {
    generatedAt: new Date().toISOString(),
    source: 'aviationweather.gov (FAA Aviation Weather Center)',
    airports: icaoAirports,
    metar: {},
    taf: {},
    sigmets: [],
    airmets: [],
    summary: []
  };
  
  // Parse METARs
  const metarLines = metarRaw.trim().split('\n').filter(l => l.trim());
  for (const line of metarLines) {
    const icao = line.split(' ')[0];
    if (icaoAirports.includes(icao)) {
      brief.metar[icao] = line;
      
      // Check for significant weather
      if (line.includes('TS')) {
        brief.summary.push(`⛈️ ${icao}: Thunderstorms reported`);
      }
      if (line.match(/\b[0-2]SM\b/)) {
        brief.summary.push(`🌫️ ${icao}: Low visibility (<3SM)`);
      }
      if (line.match(/\d{3}(\d{2})G(\d{2})KT/) && parseInt(RegExp.$2) >= 25) {
        brief.summary.push(`💨 ${icao}: Strong gusts reported`);
      }
    }
  }
  
  // Parse TAFs
  const tafLines = tafRaw.trim().split('\n').filter(l => l.trim());
  let currentTaf = '';
  let currentIcao = '';
  
  for (const line of tafLines) {
    if (line.startsWith('TAF') || line.match(/^K[A-Z]{3}/)) {
      if (currentTaf && icaoAirports.includes(currentIcao)) {
        brief.taf[currentIcao] = currentTaf.trim();
      }
      currentIcao = line.match(/K[A-Z]{3}/)?.[0] || '';
      currentTaf = line + '\n';
    } else {
      currentTaf += line + '\n';
    }
  }
  if (currentTaf && icaoAirports.includes(currentIcao)) {
    brief.taf[currentIcao] = currentTaf.trim();
  }
  
  // Check for relevant SIGMETs
  if (sigmetRaw.trim()) {
    brief.sigmets = sigmetRaw.trim().split('\n\n').filter(s => s.includes('SIGMET'));
    if (brief.sigmets.length > 0) {
      brief.summary.push(`⚠️ Active SIGMETs in effect`);
    }
  }
  
  // Check for relevant AIRMETs
  if (airmetRaw.trim()) {
    brief.airmets = airmetRaw.trim().split('\n\n').filter(a => a.includes('AIRMET'));
  }
  
  return brief;
}

/**
 * Format weather brief for display
 * @param {object} brief - Weather brief object
 * @returns {string} Formatted text
 */
function formatWeatherBrief(brief) {
  let output = [];
  
  output.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  output.push('🌤️ WEATHER BRIEF');
  output.push(`Source: ${brief.source}`);
  output.push(`Generated: ${new Date(brief.generatedAt).toLocaleString()}`);
  output.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Summary alerts
  if (brief.summary.length > 0) {
    output.push('');
    output.push('⚠️ ALERTS:');
    brief.summary.forEach(s => output.push(`  ${s}`));
  }
  
  // METARs
  output.push('');
  output.push('📡 CURRENT CONDITIONS (METAR):');
  for (const [icao, metar] of Object.entries(brief.metar)) {
    output.push(`${icao}: ${metar}`);
  }
  if (Object.keys(brief.metar).length === 0) {
    output.push('  No METAR data available');
  }
  
  // TAFs
  output.push('');
  output.push('📋 FORECAST (TAF):');
  for (const [icao, taf] of Object.entries(brief.taf)) {
    output.push(`${icao}:`);
    output.push(taf);
    output.push('');
  }
  if (Object.keys(brief.taf).length === 0) {
    output.push('  No TAF data available');
  }
  
  // SIGMETs
  if (brief.sigmets.length > 0) {
    output.push('');
    output.push('🔴 SIGMETS:');
    brief.sigmets.slice(0, 3).forEach(s => {
      output.push(s.substring(0, 200) + (s.length > 200 ? '...' : ''));
    });
  }
  
  output.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return output.join('\n');
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node weather-brief.js <airport1> [airport2] [airport3] ...');
    console.log('Example: node weather-brief.js MIA BNA IAH');
    process.exit(1);
  }
  
  try {
    console.log(`Fetching weather for: ${args.join(', ')}...`);
    const brief = await generateWeatherBrief(args);
    console.log(formatWeatherBrief(brief));
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    process.exit(1);
  }
}

module.exports = {
  fetchMETAR,
  fetchTAF,
  fetchSIGMET,
  fetchAIRMET,
  generateWeatherBrief,
  formatWeatherBrief,
  iataToIcao
};

if (require.main === module) {
  main();
}
