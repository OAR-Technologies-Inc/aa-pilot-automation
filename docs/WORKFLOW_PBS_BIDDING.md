# PBS Bidding Workflow

## Quick Reference

| Item | Value |
|------|-------|
| URL | https://pilotpbs.aa.com/aospbs2 |
| Login | Configured in config.json |
| Bid Window | Opens ~10th, closes ~13th (for following month) |

---

## Login Flow

1. Navigate to `https://pilotpbs.aa.com/aospbs2`
2. Redirects to `pfloginapp.cloud.aa.com/loginb2e`
3. Enter AA ID → Click Next
4. Enter Password → Click Submit
5. Lands on Dashboard

---

## Dashboard (Landing Page)

**Key Info Displayed:**
- Bid Open/Close dates
- Seniority (lineholder % and overall %)
- Target ALV
- LCW (Line Credit Window)
- IMAX
- Existing Credit
- Training Month
- Planner Information (notable dates, reserve block sizes)

**Navigation Tabs:**
- Dashboard | Days Off | Pairing | Line | Reserve | Layer | Award | Standing Bid

---

## Tab 1: Days Off

**Purpose:** Request specific days off

**Interface:**
- Calendar showing bid month
- Layer dropdown (LAYER 1-10)
- Click dates to toggle selection

**Actions:**
- Click date → Adds to current layer
- "Day Off (6) +" expands day-off property options
- Set "Must Have" vs "Prefer" per layer

**Strategy Notes:**
- Layer 1-3: Must have critical days off
- Layer 4-7: Prefer days off (relaxed)

---

## Tab 2: Pairing

**Purpose:** Set trip characteristics

**Available Pairing Property Categories:**

| Category | Properties |
|----------|------------|
| **Pairing Length & Credit** | Prefer Pairing Length, Number of Duty Periods, Max TAFB Credit Ratio, Min Avg Credit Per DP, Max Duty Period Duration, Max Block Per DP |
| **Report & Release Time** | 6 options for report/release constraints |
| **Layovers** | 6 options for layover preferences |
| **Airports** | 5 options (Avoid/Prefer Landing/Departure cities) |
| **Pairing Characteristics** | 6 options (Deadheads, etc.) |
| **First & Last Duty** | 6 options |
| **Aircraft & Position** | 1 option |

**How to Add a Property:**
1. Click "Add More Properties"
2. Click category name to expand (e.g., "Pairing Length & Credit (7) +")
3. Click **+** button next to desired property
4. Configure value in popup/dialog
5. Property appears in "Existing Pairing Properties"
6. Assign to layers by clicking layer buttons (1-7)

**How to Modify a Property:**
- Delete existing (click **×**) and re-add with new value
- Or click on value area to see if editable (varies by property)

**How to Remove a Property:**
- Click **×** next to property name

---

## Tab 3: Line

**Purpose:** Set line-level constraints

**Property Categories (expandable):**
- **Favorites** — Min Days Off Between Work Blocks, Min Domicile Rest
- **Work Blocks** — Max work block length, etc.
- **Credit & Pay** — Target Credit Range, Minimize TAFB
- **Rest** — Domicile rest, layover rest
- **Waivers** — Post 6-day waiver, etc.
- **Miscellaneous** — Various other constraints

**Key Properties for High-Credit Strategy:**
- `Target Credit Range` — Set near top of LCW
- `Minimize TAFB` — Better efficiency
- `Avoid Reserve` — Try for lineholder

---

## Tab 4: Reserve (Layers 8-10)

**Purpose:** Reserve fallback preferences

Only used if lineholder bid fails and drops to reserve.
- Layer 8-10 are reserve-specific
- Set reserve preferences here

---

## Tab 5: Layer

**Purpose:** View full ballot structure

**Display Shows:**
- Total pairings eligible per layer
- Pairings added per layer
- All Pairing Properties with layer assignments
- All Line Properties with layer assignments
- "View Pairing Set" button — see actual trips matching criteria

**Use to verify:**
- Constraints are assigned to correct layers
- Pairing counts look reasonable (not too restrictive)

---

## Tab 6: Award

**Purpose:** View awarded schedule (after bid closes)

**Shows:**
- Layer awarded at (LN = lineholder, RS = reserve)
- Days off count
- Total credit
- Premium pay (if any)
- Each pairing with full detail:
  - Flight numbers, times, cities
  - Block time, TAFB
  - Deadhead segments
  - Layover info

---

## Tab 7: Standing Bid

**Purpose:** Persistent preferences that carry forward

**Use for:**
- Preferences that don't change month-to-month
- "Do Not Pair With" list
- Default region preferences

---

## Building a Bid — Step by Step

### 1. Check Dashboard
- Verify bid is OPEN
- Note LCW range
- Check existing credit (training, carryover)

### 2. Set Days Off (if needed)
- Go to Days Off tab
- Select layer from dropdown
- Click dates to protect
- Repeat for multiple layers with relaxing requirements

### 3. Set Pairing Preferences
- Go to Pairing tab
- Review existing properties
- Add/modify as needed
- Assign properties to appropriate layers

### 4. Set Line Preferences
- Go to Line tab
- Review existing properties
- Set Target Credit Range
- Verify "Avoid Reserve" is set

### 5. Verify in Layer Tab
- Check total pairings per layer
- Ensure constraints aren't too restrictive
- Layer 1 should have fewest pairings (most restrictive)
- Layer 7 should have most pairings (fallback)

### 6. Submit Bid
- Submit button appears when bid is OPEN
- Confirm submission
- Note confirmation message

**Auto-save:** PBS auto-saves property changes

---

## Bid Strategy Templates

### Strategy 1: MAX DAYS OFF + MAX PAY
**Goal:** Fewest working days, highest pay per day worked

```
Layer 1: 
  - Pairing Length: 2
  - Max TAFB Ratio: 2.5
  - Target Credit Range: 85-91% of LCW max
  - Maximize Credit: ON
  - Specific Dates Off

Layer 2-3:
  - Relax TAFB ratio
  - Expand credit range

Layer 4-7:
  - Progressively relax all constraints
  - Avoid Reserve: ON
```

### Strategy 2: SHORTEST TRIPS
**Goal:** Only 2-day trips for maximum flexibility

```
Layer 1-3:
  - Pairing Length: 2 (strict)
  - High credit target

Layer 4-6:
  - Pairing Length: 2
  - Relax other constraints

Layer 7:
  - Allow 2-3 day trips
  - Avoid Reserve: ON
```

### Strategy 3: SPECIFIC DAYS OFF
**Goal:** Guarantee specific dates off

```
Layer 1:
  - MUST OFF: [Critical dates]
  - Any pairing that fits

Layer 2-3:
  - MUST OFF: [Critical dates]
  - PREFER OFF: [Nice-to-have dates]

Layer 4-7:
  - Relax to PREFER only
  - Avoid Reserve: ON
```

### Strategy 4: INTERNATIONAL LAYOVERS
**Goal:** Best layover destinations

```
Layer 1:
  - Prefer Layover: [Top cities]
  - Pairing Length: 3-4

Layer 2-4:
  - Expand layover preferences

Layer 5-7:
  - Relax layover constraints
  - Avoid Reserve: ON
```

---

## Common Issues

**"No pairings match criteria"**
- Constraints too restrictive
- Relax in lower layers

**Awarded at Layer 7**
- Upper layers too restrictive for seniority
- Consider relaxing Layer 1-3

**Got reserve**
- Lineholder bid failed completely
- Review Layer 7 constraints

---

## Element References (for automation)

**Navigation:**
- Dashboard: `listitem` "Dashboard"
- Days Off: `listitem` "Days Off"
- Pairing: `listitem` "Pairing"
- Line: `listitem` "Line"
- Reserve: `listitem` "Reserve"
- Layer: `listitem` "Layer"
- Award: `listitem` "Award"
- Standing Bid: `listitem` "Standing Bid"

**Layer Selector:**
- Combobox with options "LAYER 1" through "LAYER 10"

**Property Layers:**
- Layer assignment buttons labeled "1" through "7"
- Click to toggle layer assignment
