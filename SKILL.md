# AA Pilot Automation Skill

> Comprehensive automation for American Airlines pilot portal tasks using Playwright browser automation.

---

## Overview

This skill enables OpenClaw agents to automate routine American Airlines pilot tasks:

- **Schedule Management** — Retrieve and parse HI1/HI2 schedules from CCI
- **PBS Bidding** — Monitor bid windows, check awards
- **TTS (Trip Trade System)** — Find open sequences, premium trips, RT-eligible pickups
- **DOTC (Daily Open Time Coverage)** — Search open time, submit ballots
- **Deadhead Check-In** — Automated 24-hour check-in for deadhead flights
- **Calendar Sync** — Export schedule to Google Calendar
- **Premium Trip Hunting** — Alert when high-value trips appear

---

## Prerequisites

### Required Software
```bash
# Node.js 18+ 
node --version

# Playwright (browser automation)
npm install playwright

# Google APIs (for calendar sync)
npm install googleapis
```

### Required Credentials

Create a `config.json` in your agent workspace:

```json
{
  "aa": {
    "employeeId": "YOUR_AA_EMPLOYEE_ID",
    "password": "YOUR_AA_PASSWORD"
  },
  "pilot": {
    "base": "MIA",
    "position": "FO",
    "fleet": "737",
    "division": "International"
  },
  "google": {
    "calendarId": "YOUR_CALENDAR_ID",
    "serviceAccountPath": "./credentials/google-calendar-sa.json"
  },
  "alerts": {
    "discordWebhook": "YOUR_DISCORD_WEBHOOK_URL",
    "telegramChatId": "YOUR_TELEGRAM_CHAT_ID"
  }
}
```

### Directory Structure
```
your-workspace/
├── config.json              # Credentials (gitignored)
├── credentials/
│   └── google-calendar-sa.json
├── scripts/
│   ├── aa-session.js        # Session management
│   ├── cci-workflow.js      # CCI automation
│   ├── tts-explorer.js      # TTS automation
│   ├── calendar-sync.js     # Google Calendar sync
│   └── schedule-parser.js   # HI1/HI2 parsing
├── data/
│   ├── session.json         # Saved browser session
│   └── schedules/           # Parsed schedule data
└── screenshots/             # Debug screenshots
```

---

## Portal Architecture

### AA SSO Authentication

All AA pilot portals share a common SSO system with a **two-step login flow**:

```
Step 1: Enter Employee ID → Click Next/Submit
Step 2: Enter Password → Click Submit
→ Redirect to target portal
```

**Key URLs:**
| Portal | URL | Purpose |
|--------|-----|---------|
| CCI | `https://cci.aa.com` | Crew Check-In, schedules |
| PBS | `https://pilotpbs.aa.com/aospbs2/Home/App` | Monthly bidding |
| TTS | `https://pilot-tts.aa.com` | Trip trades, open time |
| DOTC | `https://pilot-dotc.aa.com` | Day-of operations |
| AA Pilots | `https://aapilots.aa.com/private/` | Info hub |
| Jetnet | `https://jetnet.aa.com` | Travel Planner gateway |
| Travel Planner | `https://travelplanner.etp.aa.com` | Non-rev booking |

**Session Behavior:**
- Sessions may carry over between portals if recently authenticated
- Some portals (PBS, TTS, DOTC) may require re-authentication even with valid session
- Session cookies can be saved/restored to avoid repeated logins

---

## Core Scripts

### 1. aa-session.js — Session Management

Handles authentication and session persistence across all AA portals.

```javascript
/**
 * AA Pilot Portal - Session Management
 * Handles authentication and maintains browser session
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Load configuration
const CONFIG_PATH = process.env.AA_CONFIG || path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const URLS = {
  LOGIN: 'https://aapilots.aa.com/private/',
  PBS: 'https://pilotpbs.aa.com/aospbs2/Home/App',
  TTS: 'https://pilot-tts.aa.com/#/TripTradeSystem',
  DOTC: 'https://pilot-dotc.aa.com/#/home',
  CCI: 'https://cci.aa.com/overview',
  APA: 'https://aapilots.aa.com/private/'
};

const PATHS = {
  DATA_DIR: path.join(__dirname, '..', 'data'),
  SESSION_FILE: path.join(__dirname, '..', 'data', 'session.json'),
  SCREENSHOT_DIR: path.join(__dirname, '..', 'screenshots')
};

// Ensure directories exist
[PATHS.DATA_DIR, PATHS.SCREENSHOT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

class AASession {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init(options = {}) {
    const { headless = false, slowMo = 50 } = options;
    
    console.log('Initializing browser...');
    this.browser = await chromium.launch({
      headless,
      slowMo,
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    // Load saved session if exists
    const storageState = await this.loadSession();
    
    this.context = await this.browser.newContext({
      storageState,
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();
    
    // Stealth measures
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    return this;
  }

  async loadSession() {
    try {
      if (fs.existsSync(PATHS.SESSION_FILE)) {
        const data = JSON.parse(fs.readFileSync(PATHS.SESSION_FILE, 'utf8'));
        console.log('Loaded saved session');
        return data;
      }
    } catch (e) {
      console.log('No valid saved session');
    }
    return undefined;
  }

  async saveSession() {
    const storage = await this.context.storageState();
    fs.writeFileSync(PATHS.SESSION_FILE, JSON.stringify(storage, null, 2));
    console.log('Session saved');
  }

  async screenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(PATHS.SCREENSHOT_DIR, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`Screenshot: ${filepath}`);
    return filepath;
  }

  /**
   * Two-step login flow for AA portal
   * Step 1: Enter employee number, submit
   * Step 2: Wait for password card, enter password, submit
   */
  async login() {
    console.log('Navigating to AA private portal...');
    await this.page.goto(URLS.LOGIN, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.page.waitForTimeout(3000);
    
    await this.screenshot('01-login-page');
    
    // Check if already logged in
    const currentUrl = this.page.url();
    if (!currentUrl.includes('login') && !currentUrl.includes('pfloginapp')) {
      console.log('Already logged in!');
      return true;
    }

    try {
      // ========== STEP 1: Employee Number ==========
      console.log('Step 1: Looking for employee ID field...');
      await this.page.waitForSelector('input', { timeout: 20000 });
      
      const idSelectors = [
        'input[name="employeeId"]',
        'input[name="username"]',
        'input[name="userId"]',
        'input[id*="username"]',
        'input[id*="employee"]',
        '#employeeId',
        '#username',
        'input[type="text"]:not([type="password"])'
      ];

      let idInput = null;
      for (const sel of idSelectors) {
        idInput = await this.page.$(sel);
        if (idInput && await idInput.isVisible()) {
          console.log(`Found employee ID field: ${sel}`);
          break;
        }
      }

      if (!idInput) {
        // Fallback: first visible text input
        const inputs = await this.page.$$('input');
        for (const inp of inputs) {
          const isVisible = await inp.isVisible();
          const type = await inp.getAttribute('type');
          if (isVisible && type !== 'password' && type !== 'hidden') {
            idInput = inp;
            break;
          }
        }
      }

      if (!idInput) {
        console.error('Could not find employee ID field!');
        await this.screenshot('error-no-id-field');
        return false;
      }

      await idInput.click();
      await idInput.fill('');
      await idInput.type(config.aa.employeeId, { delay: 50 });
      console.log('Entered employee ID');
      
      await this.screenshot('02-employee-id-entered');

      // Submit step 1
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Next")',
        'button:has-text("Continue")',
        'button:has-text("Submit")'
      ];

      let submitBtn = null;
      for (const sel of submitSelectors) {
        submitBtn = await this.page.$(sel);
        if (submitBtn && await submitBtn.isVisible()) break;
      }

      if (submitBtn) {
        await submitBtn.click();
      } else {
        await idInput.press('Enter');
      }

      // ========== STEP 2: Password ==========
      console.log('Step 2: Waiting for password field...');
      
      try {
        await this.page.waitForSelector('input[type="password"]', { 
          timeout: 15000,
          state: 'visible'
        });
      } catch (e) {
        console.log('Password field not appearing');
        await this.screenshot('error-no-password-field');
        return false;
      }

      await this.screenshot('03-password-card');

      const pwdInput = await this.page.$('input[type="password"]');
      if (pwdInput) {
        await pwdInput.click();
        await pwdInput.fill('');
        await pwdInput.type(config.aa.password, { delay: 50 });
        console.log('Entered password');
      } else {
        return false;
      }

      await this.screenshot('04-password-entered');

      // Submit login
      let loginBtn = null;
      for (const sel of submitSelectors) {
        loginBtn = await this.page.$(sel);
        if (loginBtn && await loginBtn.isVisible()) break;
      }

      if (loginBtn) {
        await loginBtn.click();
      } else {
        await pwdInput.press('Enter');
      }

      // Wait for navigation
      await this.page.waitForNavigation({ 
        waitUntil: 'networkidle', 
        timeout: 30000 
      }).catch(() => {});

      await this.screenshot('05-post-login');
      
      const finalUrl = this.page.url();
      if (!finalUrl.includes('login') && !finalUrl.includes('pfloginapp')) {
        console.log('Login successful!');
        await this.saveSession();
        return true;
      }
      
      return false;

    } catch (error) {
      console.error('Login error:', error.message);
      await this.screenshot('error-login-exception');
      return false;
    }
  }

  async goToPBS() {
    console.log('Navigating to PBS...');
    await this.page.goto(URLS.PBS, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.page.waitForTimeout(3000);
    
    // Handle re-authentication if needed
    if (this.page.url().includes('login')) {
      await this._handlePortalReauth();
    }
    
    await this.screenshot('pbs-loaded');
    return this.page.url().includes('pilotpbs');
  }

  async goToTTS() {
    console.log('Navigating to TTS...');
    await this.page.goto(URLS.TTS, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.page.waitForTimeout(3000);
    
    if (this.page.url().includes('login')) {
      await this._handlePortalReauth();
    }
    
    await this.screenshot('tts-loaded');
    return this.page.url().includes('pilot-tts');
  }

  async goToDOTC() {
    console.log('Navigating to DOTC...');
    await this.page.goto(URLS.DOTC, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.page.waitForTimeout(3000);
    
    if (this.page.url().includes('login')) {
      await this._handlePortalReauth();
    }
    
    await this.screenshot('dotc-loaded');
    return this.page.url().includes('pilot-dotc');
  }

  async goToCCI() {
    console.log('Navigating to CCI...');
    await this.page.goto(URLS.CCI, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await this.page.waitForTimeout(3000);
    
    if (this.page.url().includes('login')) {
      await this._handlePortalReauth();
    }
    
    await this.screenshot('cci-loaded');
    return this.page.url().includes('cci.aa.com');
  }

  async _handlePortalReauth() {
    console.log('Portal requires re-authentication...');
    
    try {
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      const idInput = await this.page.$('input[name="username"]');
      
      if (idInput) {
        await idInput.type(config.aa.employeeId, { delay: 50 });
        
        const submitBtn = await this.page.$('button[type="submit"]');
        if (submitBtn) await submitBtn.click();
        else await this.page.keyboard.press('Enter');
        
        await this.page.waitForSelector('input[type="password"]', { timeout: 15000 });
        const pwdInput = await this.page.$('input[type="password"]');
        
        if (pwdInput) {
          await pwdInput.type(config.aa.password, { delay: 50 });
          
          const loginBtn = await this.page.$('button[type="submit"]');
          if (loginBtn) await loginBtn.click();
          else await this.page.keyboard.press('Enter');
          
          await this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
          await this.page.waitForTimeout(3000);
        }
      }
    } catch (error) {
      console.error('Re-auth error:', error.message);
    }
  }

  async close() {
    if (this.browser) {
      await this.saveSession();
      await this.browser.close();
      console.log('Browser closed');
    }
  }
}

module.exports = { AASession, URLS, PATHS, config };

// CLI mode
if (require.main === module) {
  const action = process.argv[2] || 'login';
  
  (async () => {
    const session = new AASession();
    await session.init({ headless: false });
    
    switch(action) {
      case 'login':
        await session.login();
        break;
      case 'pbs':
        await session.login();
        await session.goToPBS();
        break;
      case 'tts':
        await session.login();
        await session.goToTTS();
        break;
      case 'dotc':
        await session.login();
        await session.goToDOTC();
        break;
      case 'cci':
        await session.login();
        await session.goToCCI();
        break;
      default:
        console.log('Usage: node aa-session.js [login|pbs|tts|dotc|cci]');
    }
  })().catch(console.error);
}
```

---

### 2. cci-workflow.js — Schedule & Deadhead Check-In

Retrieves schedules via HI commands and automates deadhead check-in.

```javascript
/**
 * CCI Workflow - Schedule retrieval and deadhead check-in
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.AA_CONFIG || path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const PATHS = {
  DATA_DIR: path.join(__dirname, '..', 'data'),
  SCREENSHOT_DIR: path.join(__dirname, '..', 'screenshots')
};

// Check-in timing: 23:59:40 before departure (20 second buffer)
const CHECK_IN_BUFFER_SECONDS = 20;

class CCIWorkflow {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init(options = {}) {
    const { headless = false, slowMo = 50 } = options;
    
    this.browser = await chromium.launch({
      headless,
      slowMo,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const context = await this.browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await context.newPage();
    
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    return this;
  }

  async screenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(PATHS.SCREENSHOT_DIR, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  async login() {
    console.log('[CCI] Navigating to CCI...');
    await this.page.goto('https://cci.aa.com/overview', { 
      waitUntil: 'domcontentloaded', 
      timeout: 45000 
    });
    await this.page.waitForTimeout(3000);
    
    let url = this.page.url();
    
    if (url.includes('login') || url.includes('pfloginapp')) {
      console.log('[CCI] Login required...');
      
      // Step 1: Employee ID
      await this.page.waitForSelector('input', { timeout: 15000 });
      const idInput = await this.page.$('input[name="username"]') || 
                      await this.page.$('input[type="text"]');
      
      if (idInput) {
        await idInput.type(config.aa.employeeId, { delay: 30 });
        
        const nextBtn = await this.page.$('button[type="submit"]');
        if (nextBtn) await nextBtn.click();
        else await this.page.keyboard.press('Enter');
        
        // Step 2: Password
        await this.page.waitForSelector('input[type="password"]', { timeout: 15000 });
        const pwdInput = await this.page.$('input[type="password"]');
        
        if (pwdInput) {
          await pwdInput.type(config.aa.password, { delay: 30 });
          
          const loginBtn = await this.page.$('button[type="submit"]');
          if (loginBtn) await loginBtn.click();
          else await this.page.keyboard.press('Enter');
          
          await this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
          await this.page.waitForTimeout(5000);
        }
      }
    }
    
    url = this.page.url();
    const onCCI = url.includes('cci.aa.com');
    console.log('[CCI] Login successful:', onCCI);
    return onCCI;
  }

  async navigateToHICommands() {
    console.log('[CCI] Navigating to HI Commands...');
    
    // Click "More" in sidebar to expand
    const moreBtn = await this.page.$('text=More') || 
                    await this.page.$('button:has-text("More")');
    
    if (moreBtn) {
      await moreBtn.click();
      await this.page.waitForTimeout(1500);
    }
    
    // Click "HI Commands" tab
    const hiBtn = await this.page.$('text=HI Commands') ||
                  await this.page.$('button:has-text("HI Commands")') ||
                  await this.page.$('a:has-text("HI Commands")');
    
    if (hiBtn) {
      await hiBtn.click();
      await this.page.waitForTimeout(2000);
      await this.screenshot('hi-commands');
      return true;
    }
    
    console.log('[CCI] "HI Commands" not found');
    return false;
  }

  async runHICommand(command) {
    console.log(`[CCI] Running ${command}...`);
    
    // Find and click "View" for the specified command
    const viewBtn = await this.page.$(`tr:has-text("${command}") >> text=View`) ||
                    await this.page.$(`div:has-text("${command}") >> text=View`);
    
    if (viewBtn) {
      await viewBtn.click();
      await this.page.waitForTimeout(3000);
      await this.screenshot(`${command}-output`);
      
      // Extract output text
      const output = await this.page.evaluate(() => {
        const preElements = document.querySelectorAll('pre, code, .schedule-output, [class*="output"]');
        if (preElements.length > 0) {
          return Array.from(preElements).map(el => el.innerText).join('\n');
        }
        return document.body.innerText;
      });
      
      // Save output
      const outputFile = path.join(PATHS.DATA_DIR, `${command}-${Date.now()}.txt`);
      fs.writeFileSync(outputFile, output);
      console.log(`[CCI] Saved ${command} output`);
      
      return output;
    }
    
    console.log(`[CCI] Could not find ${command}`);
    return null;
  }

  /**
   * Parse deadheads from HI1/HI2 schedule output
   * Deadheads appear as D followed by 3-4 digit flight number (e.g., D2997, D1810)
   */
  parseDeadheads(scheduleText) {
    const deadheads = [];
    const lines = scheduleText.split('\n');
    
    const deadheadPattern = /D(\d{3,4})/g;
    
    let currentDay = null;
    let currentMonth = null;
    
    // Extract month from header
    const monthMatch = scheduleText.match(/MONTH ENDING (\d{2})([A-Z]{3})(\d{2})/);
    if (monthMatch) {
      currentMonth = monthMatch[2];
    }
    
    for (const line of lines) {
      // Check for day indicator
      const dayMatch = line.match(/^\s*(\d{1,2})[A-Z]?\d{2}/);
      if (dayMatch) {
        currentDay = parseInt(dayMatch[1]);
      }
      
      let match;
      while ((match = deadheadPattern.exec(line)) !== null) {
        deadheads.push({
          flightNumber: match[1],  // Just the number, NOT "AA" prefix
          day: currentDay,
          month: currentMonth,
          rawLine: line.trim()
        });
      }
    }
    
    console.log(`[CCI] Found ${deadheads.length} deadheads`);
    return deadheads;
  }

  /**
   * Check in for a deadhead flight
   * IMPORTANT: Enter ONLY the flight number (e.g., "2997"), NOT "AA2997"
   * 
   * @param {string} flightNumber - Flight number (just digits)
   * @param {string} date - Date format expected by form (e.g., "04/05/2026")
   * @param {Date} departureTime - Scheduled departure time
   */
  async checkInForDeadhead(flightNumber, date, departureTime) {
    console.log(`[CCI] Checking in for flight ${flightNumber} on ${date}...`);
    
    // Calculate optimal check-in time: 24 hours before minus buffer
    const checkInTime = new Date(departureTime.getTime() - (24 * 60 * 60 * 1000) + (CHECK_IN_BUFFER_SECONDS * 1000));
    console.log(`[CCI] Check-in will be attempted at: ${checkInTime.toISOString()}`);
    
    // Navigate to Travel Planner check-in
    const travelLink = await this.page.$('text=Travel Planner') ||
                       await this.page.$('a[href*="travel"]') ||
                       await this.page.$('text=Check-In');
    
    if (travelLink) {
      await travelLink.click();
      await this.page.waitForTimeout(3000);
    } else {
      console.log('[CCI] Travel Planner link not found');
      return false;
    }
    
    // Fill check-in form
    const flightInput = await this.page.$('input[name*="flight"]') ||
                        await this.page.$('input[placeholder*="flight"]') ||
                        await this.page.$('input[type="text"]');
    
    if (flightInput) {
      await flightInput.fill('');
      // IMPORTANT: Only the flight number, no AA prefix
      await flightInput.type(flightNumber, { delay: 50 });
    } else {
      return false;
    }
    
    const dateInput = await this.page.$('input[name*="date"]') ||
                      await this.page.$('input[type="date"]');
    
    if (dateInput) {
      await dateInput.fill('');
      await dateInput.type(date, { delay: 50 });
    }
    
    await this.screenshot('check-in-form-filled');
    
    // Wait until optimal check-in time
    const now = new Date();
    const waitMs = checkInTime.getTime() - now.getTime();
    
    if (waitMs > 0) {
      console.log(`[CCI] Waiting ${Math.round(waitMs / 1000)} seconds until check-in time...`);
      await this.page.waitForTimeout(waitMs);
    }
    
    // Attempt check-in with retry
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      console.log(`[CCI] Check-in attempt ${attempts}/${maxAttempts}...`);
      
      const checkInBtn = await this.page.$('button:has-text("Check In")') ||
                         await this.page.$('button:has-text("Check-In")') ||
                         await this.page.$('button[type="submit"]');
      
      if (checkInBtn) {
        await checkInBtn.click();
        await this.page.waitForTimeout(2000);
        
        const pageText = await this.page.evaluate(() => document.body.innerText);
        
        if (pageText.toLowerCase().includes('success') || 
            pageText.toLowerCase().includes('confirmed') ||
            pageText.toLowerCase().includes('checked in')) {
          success = true;
          console.log('[CCI] ✓ Check-in SUCCESSFUL!');
          await this.screenshot('check-in-success');
        } else {
          await this.page.waitForTimeout(1000);
        }
      } else {
        break;
      }
    }
    
    if (!success) {
      console.log('[CCI] ✗ Check-in FAILED');
      await this.screenshot('check-in-failed');
    }
    
    return success;
  }

  async getCurrentSchedule() {
    await this.navigateToHICommands();
    return await this.runHICommand('HI1');
  }

  async getOtherMonthSchedule() {
    await this.navigateToHICommands();
    return await this.runHICommand('HI2');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = { CCIWorkflow };

// CLI mode
if (require.main === module) {
  const action = process.argv[2] || 'schedule';
  
  (async () => {
    const cci = new CCIWorkflow();
    await cci.init({ headless: false });
    
    try {
      switch (action) {
        case 'login':
          await cci.login();
          break;
        case 'schedule':
        case 'hi1':
          await cci.login();
          await cci.getCurrentSchedule();
          break;
        case 'hi2':
          await cci.login();
          await cci.getOtherMonthSchedule();
          break;
        case 'deadheads':
          await cci.login();
          const schedule = await cci.getCurrentSchedule();
          const deadheads = cci.parseDeadheads(schedule);
          console.log('Deadheads:', JSON.stringify(deadheads, null, 2));
          break;
        case 'checkin':
          // Usage: node cci-workflow.js checkin 2997 04/05/2026 "2026-04-05T14:30:00"
          const flightNum = process.argv[3];
          const date = process.argv[4];
          const depTime = new Date(process.argv[5]);
          
          if (!flightNum || !date || isNaN(depTime.getTime())) {
            console.log('Usage: node cci-workflow.js checkin <flightNumber> <date> <departureDateTime>');
            break;
          }
          
          await cci.login();
          await cci.checkInForDeadhead(flightNum, date, depTime);
          break;
        default:
          console.log('Usage: node cci-workflow.js [login|schedule|hi1|hi2|deadheads|checkin]');
      }
    } finally {
      // Keep browser open for debugging
      console.log('Browser staying open. Ctrl+C to close.');
    }
  })().catch(console.error);
}
```

---

### 3. schedule-parser.js — Parse HI Screen Output

```javascript
/**
 * Parse HI1/HI2 schedule output into structured data
 */

const fs = require('fs');

/**
 * Parse HI1/HI2 text output into structured schedule
 * @param {string} rawText - Raw HI screen output
 * @returns {Object} Parsed schedule data
 */
function parseSchedule(rawText) {
  const schedule = {
    month: null,
    year: null,
    sequences: [],
    deadheads: [],
    vacation: [],
    dfp: [],
    reserve: [],
    credit: {
      projected: null,
      guaranteed: null
    }
  };

  const lines = rawText.split('\n');
  
  // Parse month/year from header
  const monthMatch = rawText.match(/MONTH ENDING (\d{2})([A-Z]{3})(\d{2})/);
  if (monthMatch) {
    schedule.month = monthMatch[2];
    schedule.year = '20' + monthMatch[3];
  }

  // Parse credit totals
  const projMatch = rawText.match(/PROJ[:\s]+(\d{1,3}):(\d{2})/);
  if (projMatch) {
    schedule.credit.projected = `${projMatch[1]}:${projMatch[2]}`;
  }
  
  const gtdMatch = rawText.match(/GTD[:\s]+(\d{1,3}):(\d{2})/);
  if (gtdMatch) {
    schedule.credit.guaranteed = `${gtdMatch[1]}:${gtdMatch[2]}`;
  }

  // Parse sequences (5-digit numbers)
  const seqPattern = /\b(\d{5})\b/g;
  let match;
  while ((match = seqPattern.exec(rawText)) !== null) {
    if (!schedule.sequences.includes(match[1])) {
      schedule.sequences.push(match[1]);
    }
  }

  // Parse deadheads (D followed by 3-4 digits)
  const dhPattern = /D(\d{3,4})/g;
  while ((match = dhPattern.exec(rawText)) !== null) {
    schedule.deadheads.push({
      flightNumber: match[1],
      fullMatch: match[0]
    });
  }

  // Parse vacation days (VC marker)
  const vcPattern = /(\d{1,2})\s*VC/gi;
  while ((match = vcPattern.exec(rawText)) !== null) {
    schedule.vacation.push(parseInt(match[1]));
  }

  // Parse DFP days
  const dfpPattern = /(\d{1,2})\s*DFP/gi;
  while ((match = dfpPattern.exec(rawText)) !== null) {
    schedule.dfp.push(parseInt(match[1]));
  }

  return schedule;
}

/**
 * Extract flight details from sequence text
 * @param {string} seqText - Sequence detail text
 * @returns {Object} Parsed sequence data
 */
function parseSequenceDetail(seqText) {
  const seq = {
    number: null,
    days: [],
    layovers: [],
    credit: null,
    tafb: null,
    flights: []
  };

  // Sequence number
  const numMatch = seqText.match(/(?:SEQ|Sequence|#)\s*(\d{5})/i);
  if (numMatch) seq.number = numMatch[1];

  // Credit hours
  const creditMatch = seqText.match(/Credit[:\s]+(\d{1,3}):(\d{2})/i);
  if (creditMatch) seq.credit = `${creditMatch[1]}:${creditMatch[2]}`;

  // TAFB
  const tafbMatch = seqText.match(/TAFB[:\s]+(\d{1,3}):(\d{2})/i);
  if (tafbMatch) seq.tafb = `${tafbMatch[1]}:${tafbMatch[2]}`;

  // Parse layover cities (3-letter codes)
  const layoverPattern = /Layover[s]?[:\s]+([A-Z]{3}(?:\s*,?\s*[A-Z]{3})*)/i;
  const layoverMatch = seqText.match(layoverPattern);
  if (layoverMatch) {
    seq.layovers = layoverMatch[1].match(/[A-Z]{3}/g) || [];
  }

  // Parse flight legs (AA followed by digits)
  const flightPattern = /AA(\d{3,4})\s+([A-Z]{3})[→\-]([A-Z]{3})/g;
  let match;
  while ((match = flightPattern.exec(seqText)) !== null) {
    seq.flights.push({
      number: match[1],
      origin: match[2],
      destination: match[3]
    });
  }

  return seq;
}

module.exports = { parseSchedule, parseSequenceDetail };

// CLI mode
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Usage: node schedule-parser.js <schedule-file.txt>');
    process.exit(1);
  }
  
  const rawText = fs.readFileSync(filePath, 'utf8');
  const schedule = parseSchedule(rawText);
  console.log(JSON.stringify(schedule, null, 2));
}
```

---

## Portal Sitemaps

### CCI (Crew Check-In)

**URL:** `https://cci.aa.com`

| Section | Purpose |
|---------|---------|
| Overview | Dashboard, check-in status |
| Calendar | Schedule calendar view |
| HI Commands | Schedule screens (HI1, HI2, HI3, etc.) |
| More | Expanded menu |

**HI Commands:**
| Command | Purpose |
|---------|---------|
| HI1 | Current month schedule |
| HI2 | Other month schedule (usually next month after 16th) |
| HI3 | Sequence detail |
| HI4 | Trip detail |
| HI5 | Crew roster |

---

### PBS (Preferential Bidding System)

**URL:** `https://pilotpbs.aa.com/aospbs2/Home/App`

| Tab | Purpose |
|-----|---------|
| Dashboard | Bid info, user info, calendar |
| Days Off | Bid for specific days off |
| Pairing | Bid for specific pairings |
| Line | Bid for complete lines |
| Reserve | Reserve bidding options |
| Layer | Manage bid layers (1-10) |
| Award | View preliminary/final awards |
| Standing Bid | Persistent preferences |

**Bid Cycle Timing:**
| Event | Typical Date |
|-------|--------------|
| Bid Open | ~8th-10th |
| Bid Close | ~13th |
| Preliminary Award | ~13th-14th |
| Final Award | ~14th |

---

### TTS (Trip Trade System)

**URL:** `https://pilot-tts.aa.com`

| Section | Purpose |
|---------|---------|
| My Schedule | Calendar view (default) |
| Ballot | Trade request management |
| P2P Trades | Pilot-to-pilot trading |
| History | Transaction history |
| RO List | Reserve order list |

**Batch Run Times (HBT):**
- 0800 — Morning batch
- 2000 — Evening batch

**Real-Time (RT) Window:**
- Available between batch runs
- RT opens for new month: 24th at 1000 HBT

---

### DOTC (Daily Open Time Coverage)

**URL:** `https://pilot-dotc.aa.com`

| Section | Purpose |
|---------|---------|
| Calendar | Schedule view (home) |
| Pickup & Reserve Lists | Open time, reserves |
| RO List | Reserve order list |
| Search | Advanced trip search |
| Pickup Ballots | OG balloting |

**Filters Available:**
- Award Date
- Base (ORD, PHX, LAX, DCA, DFW, MIA, PHL, BOS, LGA, CLT)
- Aircraft (320, 787, 777, 737)
- Position (Captain, First Officer)
- Division (Domestic, International)

**Open Time Table Columns:**
| Column | Description |
|--------|-------------|
| SEQ | Sequence number |
| BALLOT | Ballot status |
| STA | Base station |
| POS | Position (CA/FO) |
| LEGS | Leg count |
| LAYOVER | Layover cities |
| SI | Sign-in date/time |
| DB | Debrief date/time |
| TAFB | Time Away From Base |
| TOTAL | Total credit hours |
| P/C | Premium indicator |
| LEGAL | Legality status |

---

### Travel Planner

**URL:** `https://travelplanner.etp.aa.com`

**Access:** Usually via Jetnet → Find it fast → Travel Planner

| Tab | Purpose |
|-----|---------|
| Find Flights | Space available search |
| Trips | Current/past trips |
| Travelers | Pass holders, guests |
| Tools | Priority list, flight status |

**Search Types:**
- One way
- Round trip
- Best bets
- Route me

**Travel Types:**
- Space available
- Jumpseat

---

## Workflows

### Daily Schedule Check

```
1. Login via aa-session.js
2. Navigate to CCI
3. Run HI1 command
4. Parse schedule with schedule-parser.js
5. Identify upcoming deadheads
6. Schedule check-in cron jobs
7. Sync to Google Calendar
```

### Premium Trip Hunting

```
1. Login and navigate to DOTC
2. Set filters: [Base], [Fleet], [Position], [Division]
3. Click "Open time" tab
4. Look for:
   - High TOTAL credit (125%+)
   - Premium indicator in P/C column
   - Desirable layover cities
5. If found: Alert user with details
6. If approved: Select → Add To Ballot
```

### PBS Bid Monitoring

```
1. Check bid window status on PBS Dashboard
2. If "Bid Open":
   - Alert user
   - Provide deadline info
3. After bid close:
   - Poll Award tab
   - Report preliminary award
4. Log award results
```

### Deadhead Auto Check-In

```
1. Parse schedule for deadheads (D#### pattern)
2. For each deadhead:
   - Calculate check-in time (24h - 20s before departure)
   - Schedule cron job
3. At check-in time:
   - Navigate to Travel Planner
   - Enter flight number (JUST the number, no AA prefix)
   - Enter date
   - Click check-in with retry logic
4. Report success/failure
```

---

## Automation Notes

### Login Flow
- Two-step process: Employee ID → Password
- Sessions can be saved/restored
- Some portals require re-auth even with valid session

### Timing
- PBS batch runs: 0800 and 2000 HBT
- RT window: Between batch runs
- New month RT: 24th at 1000 HBT
- Check-in window: 24 hours before departure

### Critical Details
- **Deadhead check-in:** Enter ONLY the flight number (e.g., "2997"), NOT "AA2997"
- **Session handling:** Save cookies after successful login
- **Error handling:** Screenshot on failures for debugging

---

## Error Handling

### Common Issues

| Issue | Solution |
|-------|----------|
| Login timeout | Increase timeout, check network |
| Session expired | Delete session.json, re-login |
| Element not found | Check for UI changes, update selectors |
| 2FA prompt | Manual intervention required |
| Portal maintenance | Retry later |

### Debug Mode

Run with headless=false to watch automation:

```javascript
await session.init({ headless: false, slowMo: 100 });
```

---

## Calendar Sync

### Google Calendar Setup

1. Create Google Cloud project
2. Enable Calendar API
3. Create service account
4. Download credentials JSON
5. Share calendar with service account email

### Event Format

```javascript
{
  summary: '✈️ SEQ 22264 | MIA→CLT→CMH',
  description: `Sequence 22264
Day 1: MIA → CLT → CMH
Layover: CMH
Credit: 16:32`,
  start: { date: '2026-04-03' },
  end: { date: '2026-04-07' },
  colorId: '9'  // Blue for trips, 11 for deadheads
}
```

---

## Security Notes

1. **Never commit config.json** — Add to .gitignore
2. **Session files** — Store securely, delete when not needed
3. **Screenshots** — May contain sensitive data, clean up regularly
4. **Credentials** — Use environment variables in production

---

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Google Calendar API](https://developers.google.com/calendar/api)
- AA Pilot resources available via aapilots.aa.com
