# Workflow: Pre-Trip Briefing

**Purpose:** Comprehensive trip briefing before each sequence  
**Updated:** 2026-04-02  
**Status:** Active

---

## Overview

Before each trip, compile all relevant information into a single briefing so you have everything you need at a glance. Includes FAA-approved weather data.

---

## Trigger Conditions

| Trigger | Timing | Action |
|---------|--------|--------|
| **24-hour reminder** | Report - 24 hrs | Heads up: "Trip tomorrow at [time]" |
| **Full brief** | Report - 1.5 hrs | Complete briefing with weather |
| "Brief me on my next trip" | On demand | Full briefing |
| "What's my next trip?" | On demand | Full briefing |

**Timing Logic:**
- **24 hours out:** Simple reminder with trip overview
- **1.5 hours out:** Full brief with current weather (most accurate/relevant)

---

## Data Sources

| Data | Source | Command/Path |
|------|--------|--------------|
| Sequence details | CCI | HI5 (Next Sequence) |
| Hotel/Limo info | CCI | HIDIR/HTL |
| Stored schedule | Local | `data/schedule/MMMYYYY.json` |
| **Weather** | aviationweather.gov | `scripts/weather-brief.js` |

---

## Weather Sources (FAA-Approved)

| Data | Source | Description |
|------|--------|-------------|
| METAR | Aviation Weather Center | Current surface observations |
| TAF | Aviation Weather Center | Terminal forecast (24-30 hrs) |
| SIGMET | Aviation Weather Center | Significant meteorological hazards |
| AIRMET | Aviation Weather Center | Airmen's meteorological advisories |

**API:** `https://aviationweather.gov/api/data`

Weather is pulled for:
1. **Departure airport** — Current conditions + forecast
2. **Enroute airports** — Layover conditions + forecast
3. **Arrival airport** — Forecast for return

---

## Briefing Contents

### Header
```
✈️ TRIP BRIEFING: SEQ 22882
📅 Feb 27 - Mar 1, 2026 (3 days)
```

### Report Info
```
📍 Report: 2020 MIA
🏁 Release: ~2215 MIA (Mar 1)
```

### Flight Schedule
```
DAY 1 — Friday, Feb 27
  AA1173  MIA → BNA  2120-2258  (2:38)
  🏨 Layover: BNA [Hotel Name]

DAY 2 — Saturday, Feb 28
  AA2406  BNA → MIA  1324-1650  (2:26)
  🚐 DH AA2347  MIA → IAH  1920-2127  (3:07)
  🏨 Layover: IAH [Hotel Name]

DAY 3 — Sunday, Mar 1
  AA3258  IAH → MIA  1001-1337  (2:36)
  AA1183  MIA → BWI  1546-1832  (2:46)
  AA1183  BWI → MIA  1922-2215  (2:53)
```

### Summary
```
💰 Credit: 16:26
⏱️ TAFB: 50:25
🛬 Landings: 5
🚐 Deadheads: 1 (MIA→IAH)
```

### Weather Brief
```
🌤️ WEATHER BRIEF (aviationweather.gov)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 DEPARTURE — KMIA (Miami)
  METAR: KMIA 241753Z 35009KT 10SM SKC 27/17 A3012
  TAF: SKC becoming FEW030, winds 060/08

📍 ENROUTE — KBNA (Nashville)
  TAF: BKN200, winds 200/12G22, WS020/23045KT
  ⚠️ Low-level wind shear forecast

📍 ENROUTE — KIAH (Houston)  
  TAF: P6SM SKC, winds 170/14
  WS020/20040KT overnight

⚠️ SIGMETS:
  SIGMET UNIFORM 1: SEV TURB FL330-FL430 (WY/CO)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Hotels & Ground
```
BNA: [Hotel Name], [Address], [Phone]
     Limo pickup: [Time] at [Location]

IAH: [Hotel Name], [Address], [Phone]
     Limo pickup: [Time] at [Location]
```

### Notes
```
⚠️ Deadhead on Day 2 — check in via Travel Planner
📱 Check-in opens: Feb 26 @ 2020 (24hr before report)
```

---

## Two-Stage Notification

### Stage 1: 24-Hour Reminder
```
📅 TRIP REMINDER

You have a trip tomorrow:
SEQ 22882 | Feb 27-Mar 1
Report: 2020 MIA

🚐 Deadhead on this trip — check in opens now

Full weather brief coming at 1830 (1.5 hrs before report)
```

### Stage 2: Full Brief (1.5 hours before)
```
✈️ FULL TRIP BRIEFING: SEQ 22882
[Complete briefing with current weather]
```

---

## Execution Steps

### Step 1: Pull HI5 (Next Sequence)
```
CCI → More → HI Commands → HI5 → View
```
Capture sequence details, flights, times, airports.

### Step 2: Pull HIDIR/HTL (Hotel Info)
```
CCI → More → HI Commands → HIDIR/HTL → View
```
Capture hotel names, addresses, limo info.

### Step 3: Fetch Weather (FAA Sources)
```
node scripts/weather-brief.js <departure> <layover1> <layover2> ...
```
Pull from aviationweather.gov:
- METAR (current conditions)
- TAF (terminal forecast)
- SIGMET/AIRMET (hazards)

### Step 4: Check for Deadheads
Scan HI5 output for "D" indicator (deadhead legs).
If deadhead found → note check-in requirement.

### Step 5: Format Briefing
Compile all data into clean briefing format:
- Trip details
- Flight schedule
- Weather brief
- Hotel info
- Deadhead alerts

### Step 6: Deliver Briefing
Send via configured channel with all details.

### Step 7: Offer Actions
```
Want me to:
• Check you in for deadheads? (if applicable)
• Add trip to calendar? (if not already)
```

---

## Deadhead Detection

When HI5 shows a deadhead leg (D indicator):
1. Flag in briefing with 🚐 icon
2. Note: "Check in via Travel Planner"
3. Offer to run Deadhead Check-in workflow
4. Calculate 24-hour window for check-in

---

## Integration with Other Workflows

| If... | Then... |
|-------|---------|
| Deadhead detected | Offer Deadhead Check-in workflow |
| Trip not on calendar | Offer Calendar Sync |
| Schedule changed since last check | Note changes in briefing |
| Within 24hrs of report | Flag as "departing soon" |

---

## Files

| File | Purpose |
|------|---------|
| `docs/WORKFLOW_PRETRIP_BRIEFING.md` | This document |
| `scripts/weather-brief.js` | FAA weather fetcher |
| HI5 output | Sequence details |
| HIDIR/HTL output | Hotel/limo info |

---

## Weather Script

**Location:** `scripts/weather-brief.js`

**Usage:**
```bash
node weather-brief.js MIA BNA IAH
```

**Returns:**
- METAR for each airport
- TAF for each airport
- Active SIGMETs
- Active AIRMETs
- Alert summary (thunderstorms, low vis, strong winds)

**Source:** aviationweather.gov (FAA Aviation Weather Center)

---

## Future Enhancements

- [x] ~~Weather at layover cities~~ ✅ Implemented
- [ ] Crew names (from Travel Planner)
- [ ] Gate/terminal info (closer to departure)
- [ ] Known delays or cancellations
- [ ] PIREPs along route

---

*Workflow for comprehensive trip preparation*
