# Deadhead Check-In Workflow

**Purpose:** Automated check-in for deadhead flights with precise timing  
**Updated:** 2026-04-02  
**Status:** Ready for implementation

---

## Overview

**Automated deadhead check-in with military precision:**
- Monthly scan on 16th for next month deadheads
- Cron jobs created for each deadhead
- Check-in executed 20 seconds after window opens (23:59:20 before departure)

---

## Detection & Setup (16th of Month)

### 1. Initial Scan (Optional)
```
1. Login to CCI (https://cci.aa.com/overview)
2. More → HI Commands → HI2 (Other Month Schedule)
3. Quick scan for D#### codes (not reliable - visual verification required)
```

### 2. SYSTEMATIC DEADHEAD DETECTION ⭐ CRITICAL
```
REQUIREMENT: Check EVERY SINGLE TRIP - Some months have 5+ deadheads!

1. CCI → Schedule tab (calendar view)
2. Identify ALL BLUE TRIP BARS across the entire month
3. For EACH blue trip bar (do not skip any):
   a. Click the BLUE BAR (never click day numbers)
   b. Right panel shows flight list
   c. Scan EVERY flight for "(deadhead)" or "Deadhead" labels
   d. Record ALL deadheads: flight number, date, exact time, route
4. Continue until EVERY trip has been checked

COMMON PATTERN: Multiple deadheads per month, spread across different trips

Do NOT sample or skip trips - check them all!
```

### 3. Cron Job Creation
```
For each deadhead:
- Departure time: Mar 15 14:55
- Check-in window opens: Mar 14 14:55 (exactly 24 hours before)
- Cron fires: Mar 14 14:52 (3 minutes before window opens)
- Check-in executes: Mar 14 14:55:20 (20 seconds after window opens)
```

**Formula:** 
- Cron trigger: (departure - 24 hours) - 3 minutes
- Check-in click: (departure - 24 hours) + 20 seconds

---

## Check-In Execution Process

### Timing Sequence
1. **T-24:03 (Cron fires):** Login to CCI, prepare for check-in
2. **T-24:00 (Window opens):** Navigate to Travel Planner
3. **T-23:59:20 (Execute):** Click check-in 20 seconds after window opens

### Step-by-Step Execution

#### 1. Pre-Check-In (T-24:03)
```
1. Login to CCI 3 minutes before check-in window
2. Navigate to Travel Planner check-in page
3. Prepare flight number entry (ONLY the number: 2997 NOT AA2997)
```

#### 2. Flight Entry (T-24:00)
```
1. Enter flight number: 2997 (number only)
2. Select correct date for the deadhead
3. Locate check-in button (do NOT click yet)
```

#### 3. Precise Check-In (T+00:20)
```
1. Wait until exactly 20 seconds AFTER check-in window opens
2. Click check-in button (at 23:59:20 before departure)
3. If fails: retry up to 5 attempts
4. Complete any required forms
```

#### 4. Completion Report
```
Notify user immediately:
✅ Deadhead check-in: AA2997 MIA→LAX Mar 15 14:55
Seat: 12F
Priority position: #7 of 15
Status: Confirmed
```

---

## Flight Number Format Rules

| Input Format | When to Use |
|-------------|-------------|
| **2997** | Primary format (number only) |
| **aal2997** | Backup if primary fails |

**Never use:** AA2997, aa2997, or other formats

---

## Error Handling

### Check-In Failures
1. **First failure:** Retry immediately
2. **Subsequent failures:** Retry every 10 seconds
3. **Max attempts:** 5 total
4. **Final failure:** Alert user immediately with error details

### System Issues
- CCI login failure → Alert user
- Travel Planner unavailable → Alert user
- Flight not found → Alert user with flight details

---

## Automation Schedule Example

### March 2026 Deadheads Setup (Run on Feb 16)
```
HI2 scan results:
- D2997: Mar 8 14:55 departure
- D3456: Mar 15 09:30 departure
- D4789: Mar 22 16:45 departure

Cron jobs created:
1. Mar 7 14:52 → Check-in for D2997 (Mar 8 14:55)
2. Mar 14 09:27 → Check-in for D3456 (Mar 15 09:30)  
3. Mar 21 16:42 → Check-in for D4789 (Mar 22 16:45)

Report to user: "March deadheads: 3 found, 3 cron jobs scheduled"
```

---

## Manual Override

### If User Requests Early Check-In
1. Execute check-in immediately using standard timing
2. Cancel corresponding cron job
3. Report completion

### Emergency Check-In
1. Login to Travel Planner
2. Enter flight number (number only)
3. Select date
4. Complete check-in
5. Report status

---

## Critical Rules

### ✅ Automated Actions
- Monthly deadhead scan (16th only)
- Cron-scheduled check-ins
- Completion notifications

### ❌ Prohibited
- Manual daily checking
- Heartbeat deadhead polling
- Check-in without cron schedule
- Any action without explicit automation or user request

---

## Integration Points

### CCI Integration
```
Login → More → HI Commands → HI2 (detection)
Login → Schedule → Click day (timing)
```

### Travel Planner Integration
```
CCI → More → Websites → Jetnet → Travel Planner
Or direct: travelplanner.etp.aa.com
```

### Cron Integration
```
Schedule format: MM DD HH:MM (cron syntax)
Example: 14 09 27 * * (Mar 14 09:27)
```

---

## Status Tracking

### Per-Deadhead Status
- **Detected:** Found in HI2 scan
- **Scheduled:** Cron job created
- **Executed:** Check-in completed
- **Failed:** Check-in unsuccessful

### Monthly Summary
```
March 2026 Deadhead Summary:
- Detected: 3
- Scheduled: 3  
- Executed: 2
- Failed: 1 (D4789 - system error)
```

---

*Critical timing workflow - Execute with precision*
