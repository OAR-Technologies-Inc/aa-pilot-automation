# AA Pilot Automation — Architecture

> **CCI-Centric Architecture:** One login, all systems accessible.

**Last Updated:** 2026-04-02

---

## Pilot Profile Template

| Field | Value |
|-------|-------|
| **Employee ID** | YOUR_EMPLOYEE_ID |
| **Name** | YOUR_NAME |
| **Base** | YOUR_BASE |
| **Position** | YOUR_POSITION |
| **Status** | Lineholder/Reserve |
| **Commute** | Yes/No |
| **Seniority** | X of Y (Z%) |

---

## Architectural Paradigm

### OLD: Portal Hopping
```
aapilots.aa.com → TTS → pilotpbs.aa.com → DOTC → Jetnet → Travel Planner
```

### NEW: CCI Hub
```
CCI (cci.aa.com) → Everything accessible via More → Websites
```

**Benefits:**
- Single login point
- Unified navigation
- HI Commands integrated
- Schedule data centralized

---

## Core System: CCI (Crew Communication Interface)

**URL:** https://cci.aa.com/overview  
**Role:** Central hub for all pilot operations

### Navigation Structure
```
├── Overview (Dashboard)
├── Schedule (Calendar with flight details)
├── Messages (Crew communications)
└── More
    ├── HI Commands (Mainframe queries)
    └── Websites (Portal access)
        ├── TTS (Trip Trade System)
        ├── PBS (Preferential Bidding)
        ├── DOTC (Daily Open Time Coverage)
        ├── Jetnet → Travel Planner
        └── 15+ other portals
```

---

## Key Workflows

### 1. Schedule Management
```
CCI → Schedule (visual calendar)
CCI → More → HI Commands → HI1/HI2 (detailed data)
```

### 2. Deadhead Check-In (Automated)
```
Monthly: HI2 scan → Deadhead detection → Cron scheduling
Execution: CCI → Travel Planner → Precise timing (T-00:20)
```

### 3. Bidding Operations
```
CCI → More → Websites → PBS → Build ballot
CCI → More → HI Commands → HI2 → Validate results
```

### 4. Premium Hunting
```
CCI → More → Websites → DOTC → Search premium trips
CCI → More → Websites → TTS → Execute drops/pickups
```

---

## HI Commands Integration

**Access:** CCI → More → HI Commands → Click "View" next to command

### Critical Commands
| Command | Purpose | Automation Role |
|---------|---------|-----------------|
| **HI1** | Current Month Schedule | Baseline comparison |
| **HI2** | Other Month Schedule | **Deadhead detection (16th only)** |
| **HI3** | Current Sequence | Pre-trip briefing |
| **HI5** | Next Sequence | Trip preparation |
| **HI8** | Seniority Info | Profile data |

### Deadhead Detection Algorithm
```
1. HI2 scan on 16th of month
2. Parse for D#### codes (D2997 = deadhead on AA 2997)
3. CCI Schedule → Click day → Extract departure time
4. Create cron: (departure - 24hr) - 3min
5. Execute check-in at T-00:20 seconds
```

---

## Data Architecture

### Schedule Data Flow
```
HI2 (raw) → Parser → data/schedule/YYYY-MM.json → Google Calendar
```

### Deadhead Processing
```
HI2 → D#### detection → CCI Schedule timing → Cron creation
```

### Monthly Sync (16th Only)
```
CCI → HI2 → Parse deadheads → Schedule tab timing → Cron jobs → Google Calendar
```

---

## Portal Access Matrix

### Via CCI → More → Websites

| Portal | Purpose | When Used |
|--------|---------|-----------|
| **TTS** | Trip trades, drops, pickups | Premium strategy execution |
| **PBS** | Monthly bidding | Bid building (~10th of month) |
| **DOTC** | Premium hunting, open time | Day-of premium monitoring |
| **Jetnet** | Gateway to Travel Planner | Deadhead check-in |
| **Travel Planner** | Flight check-in, upgrades | Deadhead processing |
| **AAPilots** | Backup access | If CCI unavailable |

---

## Automation Rules

### ✅ ALLOWED
1. **Monthly deadhead scan:** 16th of month only
2. **Scheduled deadhead check-ins:** Per cron jobs created on 16th
3. **Google Calendar sync:** As part of monthly sync

### ❌ PROHIBITED
1. Daily schedule polling
2. Heartbeat portal access
3. Automatic monitoring loops
4. Any unscheduled queries

**Critical Rule:** Execute only when explicitly requested OR on scheduled automation (16th monthly + deadhead check-ins).

---

## Implementation Phases

### Phase 1: CCI Integration ✅ COMPLETE
- [x] CCI login workflow
- [x] HI Commands access
- [x] Portal navigation mapping
- [x] Schedule tab integration

### Phase 2: Deadhead Automation 🚧 IN PROGRESS  
- [x] HI2 parsing for D#### codes
- [x] CCI Schedule precise timing
- [x] Cron job creation logic
- [ ] Travel Planner integration
- [ ] Check-in execution at T-00:20

### Phase 3: Premium Strategy 🚧 IN PROGRESS
- [x] TTS workflow documented
- [x] DOTC premium hunting documented
- [x] PBS bidding workflow documented
- [ ] End-to-end strategy testing

### Phase 4: Intelligence 🔮 FUTURE
- [ ] Schedule change detection
- [ ] Bid strategy recommendations
- [ ] Premium pattern analysis

---

## File Structure

```
docs/
├── ARCHITECTURE.md          ← This file
├── CCI_SITEMAP.md           ← Central hub mapping
├── HI_COMMANDS.md           ← Mainframe query reference
├── WORKFLOW_DEADHEAD_CHECKIN.md   ← Automated check-in
├── WORKFLOW_PBS_BIDDING.md        ← Bid building
├── WORKFLOW_TTS.md                ← Trip trades
└── WORKFLOW_DOTC_PREMIUM.md       ← Premium hunting

scripts/
├── schedule-parser.js       ← HI command parsing
├── calendar-sync.js         ← Google Calendar integration
└── weather-brief.js         ← FAA weather fetching

data/
├── schedule/               ← Monthly schedule baselines
└── deadheads/              ← Check-in tracking
```

---

## Security & Authentication

### Single Sign-On Flow
```
CCI → aapilots.aa.com SSO → All portals accessible
```

### Credentials
- **Employee ID:** Configured in config.json
- **Password:** Configured in config.json (expires every 90 days)

### Session Management
- CCI session persists across portals
- Re-login only when session expires
- Shared authentication state

---

## Error Handling

### CCI Unavailable
- Fallback to aapilots.aa.com for critical functions
- Alert user of CCI outage

### HI Commands Timeout
- Retry once, then alert user
- Never loop or auto-retry beyond one attempt

### Deadhead Check-In Failure
- Retry up to 5 times
- Alert user immediately if all attempts fail
- Include error details and flight information

---

## Performance Optimization

### Minimize Portal Access
- Use CCI as single entry point
- Avoid unnecessary portal-to-portal navigation
- Cache session cookies where possible

### Scheduled Operations
- Monthly sync only (no daily operations)
- Batch deadhead processing
- Efficient HI command usage

---

## Monitoring & Alerting

### Success Notifications
```
✅ Monthly sync: X deadheads found, Y cron jobs created
✅ Deadhead check-in: AA2997 MIA→LAX confirmed
```

### Error Notifications  
```
❌ CCI login failed - password expired?
❌ Deadhead check-in failed: AA2997 - system timeout
```

---

*Architecture reflects CCI-centric paradigm*
