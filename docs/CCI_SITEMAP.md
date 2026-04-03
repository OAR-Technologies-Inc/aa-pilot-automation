# CCI (Crew Communication Interface) Website Map

**URL:** https://cci.aa.com/overview  
**Last Updated:** 2026-04-02  

---

## Overview

**CCI is the SINGLE ENTRY POINT for all AA pilot systems:**
- HI Commands (mainframe queries)
- All portal access (TTS, PBS, DOTC, etc.)
- Schedule management
- Deadhead check-in coordination
- Crew messaging

Modern web interface with AA SSO authentication.

---

## Login Flow

1. Navigate to `https://cci.aa.com/overview`
2. Redirects to `aapilots.aa.com` login flow
3. Enter AA ID → Next
4. Enter Password → Submit
5. Returns to CCI Overview

**Note:** Credentials configured in config.json

---

## Left Sidebar Navigation

| Section | Purpose |
|---------|---------|
| **Overview** | Dashboard/home |
| **Schedule** | Monthly calendar with flight details |
| **Messages** | Crew messages (shows unread count) |
| **More** | HI Commands + Portal access |

---

## Overview Page
**URL:** `/overview`

Main dashboard showing current status and quick access.

---

## Schedule Page ⭐
**URL:** `/schedule`

**Calendar View:**
- **Blue bars:** Trips/sequences
- **Yellow bars:** Reserve/DFP days

**Day Detail Panel:**
1. **Click any day** → Right panel opens
2. **Shows exact times:**
   - Report time
   - Each flight with departure time
   - Layover information
   - **Explicitly labels "(deadhead)" flights**

**Use this for precise departure times — no web search needed!**

---

## Messages Page
**URL:** `/messages`

Crew messaging system with unread count indicator in sidebar.

---

## More Section ⭐⭐
**URL:** `/more`

### HI Commands Tab

**Access:** More → HI Commands → Shows command list with "View" buttons

**Available Commands:**
| Command | Purpose |
|---------|---------|
| **HI IOC DUTY PILOT** | Duty Pilot Contact Schedule |
| **HI*9** | Qualifications Summary |
| **HI*E (LANDINGS)** | Landings |
| **HI*E (QUALS)** | Qualifications Detailed |
| **HI1** | Current Month Schedule |
| **HI10** | Planned Absences |
| **HI117** | FAR 117 Scorecard |
| **HI2** | Other Month Schedule |
| **HI22** | Special Training Completions |
| **HI3** | Current Sequence |
| **HI4** | Previous Sequence |
| **HI5** | Next Sequence |
| **HI7** | Personal Info |
| **HI8** | Crewbase and Seniority |
| **HI9** | Display License-Med-Passport Data |
| **HID** | Line Checks / Division Quals |
| **HIDIR/HTL** | Hotel/Limo Arrival Station Info |

**Usage:**
1. More → HI Commands
2. Click "View" next to command
3. Results display in interface

### Websites Tab (Portal Access)

**Access:** More → Commands → Websites

**Available Portals:**
- **AA.com Email**
- **AAPilots**
- **ACE**
- **ATC Delays**
- **Bidding - CQT**
- **Bidding - Golden/Moveable Day Tool**
- **Bidding - PBS**
- **BizHero**
- **DOTC (Daily Open Time Coverage)**
- **Enhanced Reserve Display**
- **Jetnet**
- **SAFE eAML / eAMR**
- **TMS (Training Schedules)**
- **KCM**
- **TTS (Trip Trade System)**
- **Vacation Management**
- **WSI**

**Note:** Each portal requires separate login flows after CCI authentication.

---

## Schedule Code Meanings

### Deadhead Detection (HI1/HI2)
| Prefix | Type | Example |
|--------|------|---------|
| **D** | DEADHEAD | D2997 = deadheading on AA 2997 |
| **-** | WORKING flight | -1445 = working AA 1445 |
| **C** | Commuter/regional | |
| **MQ** | American Eagle | |

### Schedule Tab Visual Indicators
- **(deadhead)** label appears next to deadhead flights in day detail panel
- Use this view to get exact departure times for check-in timing

---

## Deadhead Check-In Integration

**CCI Role:**
1. **Detection:** Use HI1/HI2 to find D#### deadheads
2. **Timing:** Use Schedule tab day detail for exact departure times
3. **Execution:** Navigate to Travel Planner for actual check-in

**Flow:**
CCI (find deadheads) → Travel Planner (check-in) → CCI (confirm)

---

## Monthly Schedule Sync (16th of Month)

**Process:**
1. Login to CCI
2. More → HI Commands → HI2 (Other Month Schedule)
3. Parse output for D#### deadhead patterns
4. For each deadhead:
   - Schedule tab → Click day
   - Get exact departure time from right panel
   - Create cron job: fires 3 min before (departure - 24 hours)
5. Update Google Calendar
6. Report deadheads found

---

## Automation Rules

**✅ Allowed:**
- Monthly schedule sync (16th only)
- Deadhead check-in when scheduled

**❌ Prohibited:**
- Daily routine checks
- Heartbeat portal access
- Automatic monitoring

**Critical:** Only act when explicitly asked by user.

---

## Key Navigation Patterns

**HI Commands:**
```
CCI → More → HI Commands → [Command] → View
```

**Portal Access:**
```
CCI → More → Commands → Websites → [Portal]
```

**Schedule Details:**
```
CCI → Schedule → Click Day → Right Panel Details
```

---

*Updated for CCI-centric workflow*
