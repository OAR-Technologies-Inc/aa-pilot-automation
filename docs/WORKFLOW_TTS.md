# TTS (Trip Trade System) Workflow

## Quick Reference

| Item | Value |
|------|-------|
| URL | https://pilot-tts.aa.com |
| Login | Configured in config.json |
| Batch Runs | 0800 & 2000 HBT daily |
| RT Hours | Between batch runs (after 2000 → before next 0800) |
| RT Opens for New Month | 24th @ 1000 HBT |

---

## Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **My Schedule** | Calendar view of your trips |
| **Ballot** | Build drop/trade/pickup requests |
| **P2P Trades** | Person-to-person direct trades |
| **History** | Past transactions |
| **RO List** | Search open time by date/base/position/equipment |
| **Support** | Help resources |

---

## Login Flow

1. Navigate to `https://pilot-tts.aa.com`
2. Enter AA ID → Click Next
3. Enter Password → Click Submit
4. Lands on My Schedule (calendar view)

---

## Understanding the Calendar View

**Schedule Display:**
- Each day shows trips with:
  - Sequence number (e.g., "22882")
  - Report time (e.g., "07:35")
  - First layover city (e.g., "BNA")
  - Day number in trip (e.g., "1", "2", "3")

**Schedule Codes:**
| Code | Meaning |
|------|---------|
| VC | Vacation |
| DFP | Day off (protected) |
| Sequence # | Assigned trip |

**Key Information:**
- P2P Status: On/Off toggle
- Last refreshed time
- Next TTS Run countdown (e.g., "Feb 24 20:00 HBT")
- Heatmap option for visual analysis

---

## Workflow 1: Dropping a Trip

**When to use:** Remove a trip from your schedule

### Steps:

1. **Go to Ballot**
   - Click "Ballot" in nav
   - Select month

2. **Add Request**
   - Click "Add Request" button
   - Step 1: "Select a Date for Pickup or a Sequence to Trade or Drop"

3. **Select Trip to Drop**
   - Click on the sequence number (e.g., "22882")
   - Trip detail panel appears on right side

4. **Click "Drop" Button**
   - Four options shown:
     - **Pickup** — add trips
     - **Trade/Drop** — batch processing
     - **Drop** — simple drop
     - **Trade Now (N4TL)** — real-time if eligible

5. **Confirm Post**
   - Dialog: "Post Sequence"
   - "Are you sure you want to Post this sequence and Save your ballot?"
   - Click "Post and Save"

6. **Save Ballot**
   - Request appears as "Request 1 - Drop"
   - Click "Update" to save ballot
   - Or "Cancel" to discard

---

## Workflow 2: Picking Up a Trip

**When to use:** Add open time to your schedule

### Via RO List (Search):

1. **Go to RO List**
   - Click "RO List" in nav

2. **Set Search Criteria**
   - Date: Select target date
   - Base: Your base
   - Position: Your position
   - Equipment: Your fleet
   - Click "Search"

3. **Review Results**
   - Shows available sequences
   - If "No data" — nothing available for criteria

4. **Select Trip to Pickup**
   - Click desired sequence
   - Review trip details

5. **Add to Ballot**
   - Click "Pickup" button
   - Confirm and save ballot

### Via Calendar (Add Request):

1. **Go to Ballot → Add Request**
2. **Click on Empty Date**
   - Shows available trips for that date
3. **Select Sequence**
4. **Click "Pickup"**
5. **Save Ballot**

---

## Workflow 3: Trading a Trip

**When to use:** Exchange your trip for another

### Batch Trade (Trade/Drop):

1. **Select your trip** → Click "Trade/Drop"
2. **Configure trade options**
   - What you'll give up
   - What you want in return
3. **Submit to batch run**
   - Processed at next 0800 or 2000 HBT

### Real-Time Trade (N4TL - Not For Trade List):

1. **Select trip** → Click "Trade Now (N4TL)"
2. **Only available when:**
   - Trip has Real-Time Eligibility
   - Within RT hours (between batch runs)
3. **Immediate processing** — no batch wait

---

## Workflow 4: P2P (Person-to-Person) Trade

**When to use:** Direct trade with specific pilot

1. **Go to P2P Trades tab**
2. **View available P2P offers**
3. **Accept or create P2P trade**
4. **Both parties must confirm**

---

## Real-Time (RT) Eligibility Rules

**RT Window:**
- Opens: After 2000 batch run
- Closes: Before next 0800 batch run (Day -1 @ 0700 for the trip)

**RT Eligibility Criteria:**
- Trip must be within certain days of departure
- Must be during RT hours
- Batch eligibility ends Day -2 @ 2000

**For New Month:**
- RT opens 24th @ 1000 HBT

---

## Trip Detail Fields

When viewing a sequence, you see:

| Field | Description |
|-------|-------------|
| SEQ | Sequence number |
| DATE | Start date |
| STA | Base station |
| DIV | Division (I=International, D=Domestic) |
| POS | Position (FO, CA) |
| DAYS | Trip length (e.g., 3(1-2-3)) |
| CREDIT | Total credit hours |
| SIGN-IN | Report time/date |
| DEBRIEF | Release time/date |
| LAYOVERS | Overnight cities |
| TAFB | Time Away From Base |
| QUALS | Required qualifications |

**Duty Period Details:**
- Flight number, equipment, cities
- Departure/arrival times
- FLY (flight time), GRD (ground time)
- Hotel and limo info

---

## Premium Strategy: Drop & Replace

### The Play:
1. **Bid for droppable 2-day trips** in PBS
2. **Drop trip after award** via TTS
3. **Monitor for premium** on DOTC
4. **Pick up premium** via TTS or DOTC

### TTS Execution:

**Drop Phase:**
1. After PBS award, identify trips to drop
2. Ballot → Add Request → Select trip → Drop
3. Post and Save
4. Trip becomes available to other pilots (when RT eligible)

**Pickup Phase:**
1. Monitor RO List for premium trips
2. Or use DOTC for real-time premium alerts
3. When premium appears: Ballot → Add Request → Select date → Pickup
4. Post and Save

**Timing:**
- Drop before trip gains RT (batch processing)
- Pickup during RT hours for immediate
- Or pickup via batch if not time-sensitive

---

## Ballot Management

**Active Ballot:**
- Shows pending requests
- "Changes are not saved until updated" warning
- Each request numbered (Request 1, 2, 3...)

**Buttons:**
- **Add Request** — create new drop/trade/pickup
- **Add Standing Self-Repair Request** — persistent request
- **Delete All** — clear all requests
- **Cancel** — discard unsaved changes
- **Update** — save ballot

**Request Types:**
- Drop — remove trip
- Pickup — add trip
- Trade/Drop — exchange via batch
- Standing Self-Repair — auto-repair broken lines

---

## Standing Self-Repair Request

**Purpose:** Automatically fix schedule gaps

**When to use:**
- After drops that leave gaps
- To ensure minimum credit maintained
- Auto-pickup if trips become available

---

## History Tab

**Shows:**
- Past transactions (drops, pickups, trades)
- Status (completed, denied, pending)
- Timestamps

**Use for:**
- Auditing past actions
- Tracking what worked
- Identifying patterns

---

## Error Handling

**"No data for search criteria"**
- No open time matching filters
- Try different dates or relax criteria

**"This sequence will not show as Posted until RT Eligibility"**
- Normal — trip will post when timing allows
- Other pilots can't see until RT window

**Unsaved Changes Warning**
- Always appears when leaving with pending changes
- Save or discard before navigating

---

## Automation Notes

**For automation:**

1. **Login:** Same credentials as PBS
2. **Navigate:** Tab clicks are stable
3. **Trip Selection:** Click sequence number on calendar
4. **Actions:** Click appropriate button (Drop, Pickup, etc.)
5. **Confirmation:** Handle dialog prompts
6. **Save:** Always click Update to finalize

**Element Stability:**
- Navigation tabs: Always visible, consistent refs
- Calendar: Days have gridcell refs, sequences are clickable
- Buttons: Drop, Pickup, Trade/Drop, Trade Now (N4TL)
- Dialogs: Post confirmation, Cancel confirmation

---

*Updated for current workflow*
