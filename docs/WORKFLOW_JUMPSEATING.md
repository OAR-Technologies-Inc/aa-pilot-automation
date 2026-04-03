# Jumpseating Workflow

**Purpose:** Automated jumpseating search, listing, and check-in via Travel Planner  
**Updated:** 2026-04-02  
**Status:** Ready for implementation

---

## Overview

**Complete jumpseating automation:**
- Flight search and availability reporting
- Jumpseater load checking  
- Automated listing and check-in
- Two execution modes: search-and-wait vs immediate

---

## Entry Point

**Access Path:**
```
CCI → More → Websites → Jetnet → Travel Planner
```

**Login Requirements:**
- Same CCI SSO session carries over
- No additional authentication needed

---

## Execution Modes

### Mode 1: Search & Report
**When user provides:** Route + Date (e.g., "MIA to ATL on April 5th")

**Process:**
1. Search flights
2. Report options with jumpseater loads
3. Wait for user to select specific flight
4. Execute listing when approved

### Mode 2: Immediate Execution  
**When user provides:** Specific flight (e.g., "List me on AA1234 MIA-ATL departing 15:30")

**Process:**
1. Navigate directly to Travel Planner
2. Search for that specific flight
3. Execute listing immediately
4. Complete check-in
5. Report confirmation

---

## Step-by-Step Workflow

### Step 1: Flight Search

1. **Navigate to Travel Planner**
   - CCI → More → Websites → Jetnet → Travel Planner

2. **Set Search Parameters**
   - **Travel Type Dropdown:** Select "Jumpseat"
   - **Departure Airport:** 3-letter code (e.g., MIA)
   - **Destination Airport:** 3-letter code (e.g., ATL)  
   - **Departure Date:** Select date
   - **Click:** Search

### Step 2: Flight Analysis & Reporting

**Flight Cards Display:**
- Flight number (e.g., AA1234)
- Departure/arrival times
- Aircraft type
- **Available jumpseat seats**
- **Existing jumpseaters listed**
- Route details

**Report Format:**
```
Found 3 flights MIA→ATL on April 5th:

AA1234 - 08:30→11:45 (B737)
  Seats: 2 available
  Jumpseaters: None listed

AA5678 - 15:30→18:45 (A321)  
  Seats: 1 available
  Jumpseaters: 1 listed

AA9012 - 20:15→23:30 (B737)
  Seats: 2 available  
  Jumpseaters: None listed

Which flight do you want me to list you on?
```

### Step 3: Flight Selection

**For Mode 1 (Wait for approval):**
- Present options to user
- Wait for selection
- Proceed with chosen flight

**For Mode 2 (Immediate):**
- Locate the specific flight requested
- Proceed directly to booking

### Step 4: Jumpseating Booking

1. **Select Flight Card**
   - Click on the chosen flight card

2. **Click "Book Now"** 
   - Button located in bottom right of card

### Step 5: Check-In Form Completion

#### 5A: Email & Premium Selection
1. **Primary Email Field:** Enter configured email
2. **Premium Dropdown:** **ALWAYS select "Premium"**  
3. **Click:** Continue

#### 5B: Email Confirmation
1. **Popup appears:** "Is this email correct?"
2. **Always click:** "Yes" to continue

#### 5C: Traveler Information  
1. **Traveler page loads:** User info should auto-populate
2. **Verify information is correct**
3. **Click:** Continue

#### 5D: Final Check-In
1. **Check-in page loads:** Standard check-in interface
2. **Complete standard check-in flow**
3. **Obtain confirmation**

---

## Automation Parameters

### Required Information

| Field | Value | Source |
|-------|-------|--------|
| **Email** | User's email | config.json |
| **Premium** | Premium | ALWAYS select Premium |
| **Traveler Info** | Auto-populated | Verify completeness |

### Critical Settings

**✅ Always Required:**
- Premium selection (never basic/other)
- Email confirmation "Yes" 
- Traveler info verification

**❌ Never:**
- Select non-premium options
- Skip email confirmation
- Proceed with incomplete traveler data

---

## Response Templates

### Search Results Report
```
Jumpseat search: [ORIGIN] → [DESTINATION] on [DATE]

Found [X] flights:

[FLIGHT] - [TIME] ([AIRCRAFT])
  Seats: [X] available
  Jumpseaters: [Names or "None listed"]

[Additional flights...]

Select flight for listing or request different search.
```

### Immediate Execution Confirmation
```
✅ Jumpseating confirmed: [FLIGHT] [ORIGIN]→[DESTINATION] 

Flight: AA1234 MIA→ATL  
Departure: April 5, 15:30
Confirmation: [CODE]
Jumpseaters: You + [X others]
Status: Listed
```

### Error Reporting
```
❌ Jumpseating failed: [FLIGHT]

Issue: [Specific error - no seats, system error, etc.]
Available alternatives: [If any]
Recommendation: [Next steps]
```

---

## Common Scenarios

### Scenario 1: Commute Home
**User:** "Get me home to MIA tonight from ATL"

**Response:**
1. Search ATL→MIA for today
2. Report all available flights with loads
3. Wait for selection
4. Execute listing

### Scenario 2: Positioning Flight
**User:** "List me on AA1234 MIA-DFW departing 14:30 tomorrow"

**Response:**
1. Navigate to Travel Planner
2. Search for AA1234 specifically
3. Execute listing immediately
4. Report confirmation

### Scenario 3: No Availability
**User:** "MIA to LAX this afternoon"

**If no seats available:**
```
No jumpseats available MIA→LAX today:
AA123 - FULL (3/3 jumpseaters)
AA456 - FULL (2/2 jumpseaters)  
AA789 - FULL (1/1 jumpseater)

Tomorrow options:
AA111 - 2 seats available, no jumpseaters
```

---

## Workflow Integration

### With Deadhead Check-ins
- Jumpseating uses same Travel Planner interface
- Different booking flow but similar navigation
- Can coordinate both if traveling to position for trip

### With Schedule Management
- Jumpseating for positioning to/from trips
- Can check calendar conflicts before booking
- Integration with trip briefings

### With Google Calendar
- Add jumpseating flights to calendar
- Mark as "JS: AA1234 MIA→ATL" 
- Include confirmation details

---

## Error Handling

### System Errors
- Travel Planner timeout → Retry once, then report
- Login issues → Check CCI session, re-authenticate
- Flight not found → Verify flight number/date

### Booking Errors  
- No seats available → Report alternatives
- Email validation fails → Verify email format
- Traveler info incomplete → Alert user for manual completion

### Check-in Errors
- Check-in window not open → Calculate and wait
- System maintenance → Report scheduled retry time
- Confirmation missing → Screenshot and report

---

## Security & Compliance

### Information Handling
- Never store or cache personal traveler info
- Use session-based authentication only
- Clear sensitive data after completion

### AA Policy Compliance
- Always select Premium (company policy)
- Verify jumpseating authorization
- Follow standard jumpseating etiquette

---

## Quick Command Reference

### For User:
```
"Jumpseat me MIA to ATL April 5th" → Search & report
"List me on AA1234 MIA-DFW 14:30" → Immediate execution
"Check jumpseats LAX to MIA tonight" → Search only
```

### For Automation:
1. Parse request (route vs specific flight)
2. Execute appropriate mode
3. Report results
4. Wait for approval or confirm completion

---

*Critical for positioning and commuting - execute with precision*
