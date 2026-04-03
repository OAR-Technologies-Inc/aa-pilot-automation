# HI Commands Reference

**Access:** CCI → More → HI Commands  
**URL:** https://cci.aa.com/overview → More → HI Commands  
**Last Updated:** 2026-04-02  
**Purpose:** Query mainframe pilot data via CCI web interface  

---

## Access Method

**Workflow:**
1. Login to CCI (https://cci.aa.com/overview)
2. Click "More" in left sidebar
3. Click "HI Commands" tab
4. Click "View" button next to desired command
5. Results display in CCI interface

**No more FOS terminal or standalone access needed!**

---

## Available Commands

### Schedule Commands
| Command | Purpose | Critical For |
|---------|---------|--------------|
| **HI1** | Current Month Schedule | Baseline schedule, deadhead detection |
| **HI2** | Other Month Schedule | Monthly sync (16th), next month planning |
| **HI10** | Planned Absences | Vacation, training conflicts |

### Sequence Commands
| Command | Purpose | Critical For |
|---------|---------|--------------|
| **HI3** | Current Sequence | Pre-trip briefing, current trip details |
| **HI4** | Previous Sequence | Historical data |
| **HI5** | Next Sequence | Upcoming trip preparation |

### Qualifications & Training
| Command | Purpose | Critical For |
|---------|---------|--------------|
| **HI*9** | Qualifications Summary | Currency overview |
| **HI*E (QUALS)** | Qualifications Detailed | Detailed qual status |
| **HI*E (LANDINGS)** | Landings | Landing currency |
| **HI9** | License-Med-Passport Data | Expiration tracking |
| **HID** | Line Checks / Division Quals | Check ride status |
| **HI117** | FAR 117 Scorecard | Fatigue rule compliance |
| **HI22** | Special Training Completions | Training records |

### Personnel Info
| Command | Purpose | Critical For |
|---------|---------|--------------|
| **HI7** | Personal Info | Contact information |
| **HI8** | Crewbase and Seniority | Seniority number, base info |

### Operations
| Command | Purpose | Critical For |
|---------|---------|--------------|
| **HI IOC DUTY PILOT** | Duty Pilot Contact Schedule | Emergency contacts |
| **HIDIR/HTL** | Hotel/Limo Arrival Station Info | Ground transportation |

---

## Deadhead Detection ⭐⭐

### Schedule Code Prefixes (HI1/HI2)
| Prefix | Type | Example | Use For |
|--------|------|---------|---------|
| **D** | **DEADHEAD** | D2997 = deadheading on AA 2997 | **Check-in automation** |
| **-** | WORKING flight | -1445 = working AA 1445 | Regular flying |
| **C** | Commuter/regional | C3456 | Regional deadheads |
| **MQ** | American Eagle | MQ4567 | Eagle deadheads |

### Critical: Deadhead Check-In Process
1. **HI2** → Find D#### deadheads for next month
2. **CCI Schedule tab** → Click deadhead day → Get **exact departure time**
3. **Calculate check-in window:** Departure time - 24 hours
4. **Create cron job:** Check-in window - 3 minutes (fires at 23:57:xx before departure)
5. **Check-in timing:** Wait until 23:59:40 before departure, then click check-in

**Example:**
- D2997 departing Mar 15 at 14:55
- Check-in window opens: Mar 14 at 14:55
- Cron fires: Mar 14 at 14:52 (3 min before window)
- Check-in click: Mar 14 at 14:55:20 (20 sec after window opens)

---

## Monthly Schedule Sync (16th of Month Only) ⭐

### Process
1. **Login to CCI**
2. **More → HI Commands → HI2**
3. **Parse output for D#### deadhead patterns**
4. **For each deadhead:**
   - Extract flight number (remove D prefix: D2997 → 2997)
   - Go to CCI Schedule tab → Click day
   - Extract exact departure time from right panel "(deadhead)" label
   - Calculate: departure - 24 hours = check-in window opens
   - Create cron: check-in window - 3 minutes
5. **Update Google Calendar with full schedule**
6. **Report summary:** "Found X deadheads, created Y check-in jobs"

---

## Sample Outputs & Parsing

### HI1/HI2 Schedule Format
```
MONTH ENDING 01APR26 AS OF 16MAR26/1200
INTL SC-Y [NAME] [ID] [BASE] [SELECTOR]-[POS] [EQUIP]

Day-by-day schedule:
06 14 22204 -1604 -2703 16.32        ← Working flights
08 14 D2997 4.00                     ← DEADHEAD (target for check-in)
12 14 22498 -1445 -2301 15.45        ← Working flights
15 14 C3456 2.00                     ← Commuter deadhead
```

### CCI Schedule Tab Detail
```
Click Mar 8 → Right panel shows:
Report: 13:30
Flight AA2997 14:55 → 18:30 (deadhead)  ← Extract 14:55 departure
```

### HI3 Current Sequence
```
SEQ 22204 MIA-SJU-AUS-MIA
Hotel: Marriott San Juan
Limo: 12:30 pickup
Crew: Capt Smith, FA Jones
```

---

## Integration with CCI Schedule Tab

### Why Use Both HI Commands + Schedule Tab
1. **HI1/HI2:** Find deadhead codes (D2997)
2. **Schedule Tab:** Get exact times (14:55 departure)
3. **Combined:** Complete automation data

### Navigation Pattern
```
CCI → More → HI Commands → HI2 → View (get codes)
CCI → Schedule → Click day → Right panel (get times)
```

---

## Automation Rules ⭐

### ✅ Allowed (Only These)
- **Monthly sync on 16th:** HI2 → parse deadheads → create cron jobs
- **Deadhead check-in:** Execute scheduled check-ins
- **Pre-trip brief:** HI3 when trip starts

### ❌ Prohibited
- Daily HI1 polling for schedule changes
- Heartbeat HI command queries
- Automatic qualification monitoring
- Any unscheduled queries

**Critical:** Execute only when explicitly requested by user.

---

## Error Handling

### Missing Data
- Some commands may require month input (HI2)
- Commands may timeout or return errors
- Always verify data before creating automations

### Deadhead Parsing Failures
- If D#### not found in HI2, no check-ins needed for that month
- If Schedule tab doesn't show exact time, alert user
- Never create cron job without confirmed departure time

---

## Workflow Examples

### Monthly Deadhead Setup (16th Only)
```
1. CCI login
2. More → HI Commands → HI2 
3. Parse for D2997, D3456, etc.
4. For each: Schedule tab → Click day → Get time
5. Create cron: (departure - 24hr) - 3min
6. Report: "March: 3 deadheads, 3 cron jobs created"
```

### Pre-Trip Briefing (On Request)
```
1. HI3 → Get sequence details
2. HIDIR → Hotel/limo info
3. HI IOC DUTY PILOT → Contact info
4. Format and present to user
```

---

*Updated for CCI-based access and automation rules*
