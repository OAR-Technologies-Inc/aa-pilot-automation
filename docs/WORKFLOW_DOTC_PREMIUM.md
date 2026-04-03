# DOTC Premium Hunting Workflow

## Quick Reference

| Item | Value |
|------|-------|
| URL | https://pilot-dotc.aa.com |
| Login | Configured in config.json |
| Premium Indicator | High P/C (Paid Credit) value |
| Target Threshold | P/C ≥ 125% of base credit = worth chasing |

---

## Navigation

### Main Menu (DOTC dropdown)

| Menu Item | Purpose |
|-----------|---------|
| **Calendar** | Schedule view with trips |
| **Pickup & reserve lists** | Search open time by filters |
| **RO list** | Reserve/Open list |
| **Search** | Advanced filtering (premium hunting!) |
| **Pickup ballots** | Build/submit pickup requests |

### Top Navigation

| Tab | Purpose |
|-----|---------|
| DOTC | Main menu access |
| History | Past transactions |
| Support | Help resources |
| Logout | Sign out |

---

## Login Flow

1. Navigate to `https://pilot-dotc.aa.com`
2. Page may auto-login via SSO from CCI
3. If not: Enter AA ID → Password → Submit
4. Lands on Calendar view

---

## Understanding the Calendar View

**Schedule Display:**
- Similar to TTS calendar
- Shows trips with sequence numbers
- D24 markers = Day off (24 hour)
- VC = Vacation
- Arrow indicators show trip continuation

**Right Panel - Ballot Status:**
- Pickup DOTC (toggle)
- Pickup Outside (toggle)
- Indicates active ballot status

---

## Workflow 1: Finding Open Time (Basic)

### Via Pickup & Reserve Lists

1. **Click DOTC dropdown → Pickup & reserve lists**

2. **Set Search Filters:**
   - Award Date: Target date
   - Base: Your base
   - Aircraft: Your fleet
   - Position: Your position
   - Division: International (or All)

3. **Click Submit**

4. **Review Results Tabs:**
   - **Pickup DOTC** — available for day-of
   - **Pickup outside** — outside your position
   - **Reserves** — reserve assignments
   - **Open time** ← **Primary hunting ground**

5. **Open Time Table Columns:**
   | Column | Description |
   |--------|-------------|
   | SEQ | Sequence number |
   | BALLOT | Ballot status |
   | STA | Base station |
   | POS | Position |
   | LEGS | Trip length |
   | LAYOVER | Overnight cities |
   | SI | Sign-in date/time |
   | DB | Debrief date/time |
   | TAFB | Time away from base |
   | TOTAL | Total credit |
   | **P/C** | **Paid Credit** ← PREMIUM INDICATOR |
   | QUALS | Required qualifications |
   | STATUS | Trip status |
   | LEGAL | Legal constraints |

6. **Click on trip row to expand details**
   - Full flight itinerary
   - Each leg with times, equipment
   - TL, P/C, DTY, FDP, ODL per duty period

---

## Workflow 2: Premium Hunting (Advanced Search)

### Using Search Filters

1. **Click DOTC dropdown → Search**

2. **Set Date Range:**
   - Sign in between: Start/End dates
   - Time range: 00:00 - 23:59 (or narrow down)

3. **Expand "Pay and credit" filter:**
   - **Total credit (TL):** Min/Max HH:MM
   - **Paid credit (P/C):** Set **Min** to target threshold
     - Example: Min 08:00 for high-credit trips
     - Premium = P/C significantly higher than base TL

4. **Expand "Seq characteristics" filter:**
   - Legs per DP: 1-3 (fewer = better)
   - TAFB: Min/Max hours
   - Deadheads: Check preferences

5. **Expand "Airports and layovers" (optional):**
   - Prefer/avoid specific cities

6. **Click "Show results"**

7. **Review filtered results:**
   - Sort by P/C column (highest first)
   - Look for trips with P/C > TL (premium pay)

8. **Save as generic** (optional):
   - Save your filter settings for quick re-use

---

## Premium Trip Identification

### What Makes a Trip "Premium"

| Indicator | Description |
|-----------|-------------|
| **High P/C** | Paid Credit > Total Credit |
| **Green $** | Dollar sign indicator (in TTS) |
| **125%+ pay** | Premium threshold |
| **Low TAFB/high credit** | Efficient ratio |

### P/C vs TL Analysis

- **P/C > TL:** Premium pay! Worth picking up.
- **P/C = TL:** Standard pay
- **P/C < TL:** Less pay than credit (unusual)

### Example Premium Assessment

| SEQ | TL | P/C | Assessment |
|-----|-----|-----|------------|
| 31677 | 10:30 | 7:20 | Normal (P/C < TL) |
| 32XXX | 8:00 | 10:00 | **PREMIUM** (125%) |
| 33XXX | 12:00 | 15:00 | **PREMIUM** (125%) |

---

## Workflow 3: Picking Up a Trip

### From Open Time List

1. **Find desired trip in Open time tab**

2. **Check the checkbox** next to the trip

3. **Click "Add To Ballot"** button
   - Button enables when trip is selected

4. **Go to Pickup ballots**
   - DOTC dropdown → Pickup ballots
   - Or navigate via Pickup DOTC tab

5. **Review ballot:**
   - Verify trip details
   - Check legal constraints

6. **Submit ballot**
   - Confirm submission

### Ballot Tabs

| Tab | Purpose |
|-----|---------|
| **Pickup DOTC** | Day-of trip changes |
| **Pickup Outside** | Outside position pickups |
| **DOTC Template** | Saved templates |

---

## Premium Hunting Strategy

### Daily Routine

1. **Morning Check (after 0800 batch):**
   - Search → Pay and credit filter
   - Set P/C Min threshold
   - Review open time

2. **Evening Check (after 2000 batch):**
   - Same search
   - RT-eligible trips appear here

3. **Alerts to Set:**
   - Cron job: Check open time at specific intervals
   - Alert on high P/C trips

### Filter Settings for Premium

**Recommended Search:**
```
Sign in: [Target date range]
Pay and credit:
  - P/C Min: 08:00 (or higher)
Seq characteristics:
  - TAFB Max: 50 hours
  - Legs per DP Max: 3
Position: First Officer
Division: International
```

---

## Integration with TTS

### The Flow

1. **PBS Awards** → You get 2-day droppable trips
2. **TTS Drop** → Drop trips via TTS ballot
3. **DOTC Hunt** → Search for premium open time
4. **DOTC Pickup** → Add premium trip to ballot
5. **Confirm** → Submit DOTC ballot

### Key Metrics

| Metric | Target |
|--------|--------|
| P/C ratio | ≥ 125% |
| TAFB | Low (efficient) |
| Trip length | 2-3 days (droppable) |
| Legs/DP | ≤ 3 |

---

## Search Filter Reference

### Days, dates & hours
- Trip length
- Specific dates
- Report/debrief times

### Pay and credit ⭐
- **Total credit (TL):** Min/Max
- **Paid credit (P/C):** Min/Max ← PRIMARY FILTER

### Seq characteristics
- Legs per DP
- Legs per sequence
- Sit times
- TAFB
- Deadhead options

### Airports and layovers
- Include/exclude cities
- Layover preferences

### Position and division
- Captain/First Officer
- Domestic/International

### Sequence number
- Search specific sequence

---

## Automation Notes

### For premium hunting automation:

1. **Login:** Same as TTS/PBS
2. **Navigate:** DOTC dropdown → Search
3. **Set filters:** Pay and credit → P/C Min
4. **Execute search:** Show results
5. **Parse results:** Read Open time table
6. **Alert user:** If P/C meets threshold

### Key Elements

| Element | Location |
|---------|----------|
| DOTC menu | button "DOTC" |
| Search | menuitem "Search" |
| Pay filter | button "Pay and credit" |
| P/C Min | combobox in filter region |
| Show results | button "Show results" |
| Open time tab | link "Open time" |
| Trip checkbox | checkbox in table row |
| Add to Ballot | button "Add To Ballot" |

### Premium Alert Criteria

```
IF trip.P_C >= (trip.TL * 1.25):
    ALERT "Premium trip found: SEQ {seq} P/C {p_c}"
```

---

## Common Issues

**"No Results"**
- No open time matching filters
- Try wider date range
- Relax filter criteria

**Can't add to ballot**
- Trip may have legal constraint
- Check LEGAL column
- May conflict with existing schedule

**Premium trips gone fast**
- Monitor frequently
- Set up alerts
- Be ready to act quickly

---

*Updated for current workflow*
