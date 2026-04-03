# AA Pilot Automation

An OpenClaw skill for automating American Airlines pilot portal tasks.

## What It Does

- **Schedule Management** — Retrieve and parse HI1/HI2 schedules from CCI
- **PBS Bidding** — Monitor bid windows, build layered ballots, check awards
- **TTS (Trip Trade System)** — Find open sequences, submit drop/pickup requests
- **DOTC** — Hunt premium trips, submit OG ballots
- **Deadhead Check-In** — Automated 24-hour check-in for deadhead flights
- **Calendar Sync** — Export schedule to Google Calendar
- **Weather Briefs** — Pre-trip aviation weather from aviationweather.gov

## Requirements

- [OpenClaw](https://github.com/openclaw/openclaw) agent runtime
- Node.js 18+
- Playwright (`npm install playwright`)
- Google APIs (`npm install googleapis`) — for calendar sync

## Installation

1. Clone to your skills directory:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aa-pilot-automation.git ~/clawd/skills/aa-pilot-automation
   ```

2. Copy and configure credentials:
   ```bash
   cd ~/clawd/skills/aa-pilot-automation
   cp config.example.json config.json
   # Edit config.json with your AA credentials
   ```

3. Install dependencies:
   ```bash
   npm install playwright googleapis
   ```

4. (Optional) Set up Google Calendar:
   - Create a Google Cloud project
   - Enable Calendar API
   - Create service account, download JSON
   - Save to `credentials/google-calendar-sa.json`
   - Share your calendar with the service account email

## Usage

The skill is designed for OpenClaw agents. Once installed, the agent can:

```
"Check my schedule"
"What trips do I have next week?"
"Help me bid for next month — I want weekends off"
"Find premium trips for tomorrow"
"Check me in for my deadhead"
"Sync my schedule to calendar"
```

### Manual Script Usage

```bash
# Parse a schedule file
node scripts/schedule-parser.js parse schedule.txt

# Get weather brief
node scripts/weather-brief.js MIA BNA IAH

# Test calendar connection
node scripts/calendar-sync.js test
```

## Directory Structure

```
aa-pilot-automation/
├── SKILL.md              # Agent instructions (read by OpenClaw)
├── README.md             # Human documentation (this file)
├── config.example.json   # Template for credentials
├── docs/
│   ├── ARCHITECTURE.md   # System overview
│   ├── BID_STRATEGIES.md # Bidding templates
│   ├── CCI_SITEMAP.md    # CCI portal map
│   ├── HI_COMMANDS.md    # HI screen reference
│   ├── LESSONS_LEARNED.md
│   └── WORKFLOW_*.md     # Step-by-step workflows
├── scripts/
│   ├── schedule-parser.js
│   ├── calendar-sync.js
│   └── weather-brief.js
└── references/           # Additional reference docs
```

## Portal URLs

| Portal | URL | Purpose |
|--------|-----|---------|
| CCI | cci.aa.com | Crew Check-In, schedules |
| PBS | pilotpbs.aa.com | Monthly bidding |
| TTS | pilot-tts.aa.com | Trip trades |
| DOTC | pilot-dotc.aa.com | Day-of open time |

## Security Notes

- **Never commit `config.json`** — contains your credentials
- Session files may contain auth tokens — excluded via .gitignore
- Screenshots may capture sensitive info — clean up regularly

## Contributing

Issues and PRs welcome. Please ensure no personal information in commits.

## License

MIT

---

*Built for pilots, by pilots (and their agents).*
