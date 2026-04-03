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

## Free vs Pro

This public repo contains:
- ✅ Documentation and architecture overview
- ✅ Portal sitemaps (CCI, PBS, TTS, DOTC)
- ✅ HI command reference
- ❌ Automation scripts (Pro only)
- ❌ Workflow guides (Pro only)
- ❌ Bid strategy templates (Pro only)
- ❌ Updates & support (Pro only)

## Get Pro Access

**$30/month** — Full automation suite with all scripts, workflows, and ongoing updates.

👉 **[Subscribe on Gumroad](https://totheskies.gumroad.com/l/aapilotpro)** 👈

After subscribing, reply to your confirmation email with your GitHub username and you'll be added to the private repo within 24 hours.

### What's Included in Pro:

| Feature | Description |
|---------|-------------|
| **Automation Scripts** | schedule-parser.js, calendar-sync.js, weather-brief.js |
| **Workflow Guides** | Step-by-step for PBS, TTS, DOTC, deadhead check-in, jumpseating |
| **Bid Strategies** | 6 pre-built bidding templates (max days off, premium hunting, etc.) |
| **Lessons Learned** | Documented fixes and edge cases |
| **Updates** | New features and portal changes as they happen |
| **Support** | Direct help getting set up |

## Requirements

- [OpenClaw](https://github.com/openclaw/openclaw) agent runtime
- Node.js 18+
- Playwright (`npm install playwright`)
- Your AA employee credentials

## Portal URLs

| Portal | URL | Purpose |
|--------|-----|---------|
| CCI | cci.aa.com | Crew Check-In, schedules |
| PBS | pilotpbs.aa.com | Monthly bidding |
| TTS | pilot-tts.aa.com | Trip trades |
| DOTC | pilot-dotc.aa.com | Day-of open time |

## Documentation (Free)

- [Architecture Overview](docs/ARCHITECTURE.md)
- [CCI Sitemap](docs/CCI_SITEMAP.md)
- [HI Commands Reference](docs/HI_COMMANDS.md)

---

## Questions?

Open an issue or contact via Gumroad.

---

*Built for pilots, by pilots (and their agents).*
