# Workflow: Schedule Change Detection

**Purpose:** Detect and alert on schedule changes  
**Updated:** 2026-04-02  
**Status:** Active

---

## Overview

This workflow monitors your schedule for changes by comparing the current HI1/HI2 output against a stored baseline. When differences are detected, you're alerted with specific details.

---

## Trigger Conditions

| Trigger | Action |
|---------|--------|
| You ask "any schedule changes?" | Run detection |
| You ask "check my schedule" | Run detection |
| After "update my calendar" | Run detection + sync |
| After PBS award release | Run detection + update baseline |

---

## Data Sources

| Data | Command | Use |
|------|---------|-----|
| Current month | HI1 | Real-time schedule |
| Next month | HI2 | Real-time schedule |
| Baseline | `data/schedule/MMMYYYY.json` | Last known state |

---

## Detection Process

### Step 1: Pull Current Schedule
```
CCI → More → HI Commands → HI1 → View
```
Capture the raw output.

### Step 2: Load Baseline
```
Load data/schedule/FEB2026.json (or current month)
```

### Step 3: Compare

Check for differences in:
- **Sequences:** Added, removed, or changed
- **Days:** Type changes (working → day off, etc.)
- **Hours:** Projected credit changes
- **Times:** Report time or release time changes

### Step 4: Report Changes

If changes detected:
```
⚠️ Schedule Change Detected

Feb 15: DFP → Sequence 31234 (ADDED)
Sequence 31234: MIA→LAX→MIA, Credit 8:30

Projected hours: 81:05 → 89:35
```

If no changes:
```
✅ No schedule changes since last check
```

### Step 5: Update Baseline

After confirming changes, update the stored baseline:
```
Save current schedule → data/schedule/MMMYYYY.json
```

---

## Change Types

| Type | Description | Alert Level |
|------|-------------|-------------|
| Sequence Added | New trip assigned | ⚠️ High |
| Sequence Removed | Trip dropped/traded | ⚠️ High |
| Time Change | Report/release time shifted | 🟡 Medium |
| Day Type Change | DFP→Working, etc. | 🟡 Medium |
| Hours Change | Projected credit changed | 🔵 Info |

---

## Stored Data Location

```
data/schedule/
├── FEB2026.json    # February baseline
├── MAR2026.json    # March baseline
└── ...
```

---

## Integration with Other Workflows

When changes detected:
1. **Calendar Sync** — Offer to update Google Calendar
2. **Deadhead Alert** — Check if new sequence has deadheads
3. **Pre-Trip Briefing** — Queue briefing if trip added within 48hrs

---

## Example Conversation

**User:** "Any schedule changes?"

**Agent:** 
```
Checking HI1...

⚠️ Schedule Change Detected

Changes since last check:

ADDED:
• Feb 15: Sequence 31456 assigned
  - MIA → DCA → MIA
  - Report: 0545, Release: 1830
  - Credit: 8:15

REMOVED:
• Feb 15: DFP removed

Hours: 81:05 → 89:20 (+8:15)

Want me to update your calendar?
```

---

## Automation Notes

1. **Baseline required:** Must have stored baseline to detect changes
2. **HI1 is source of truth:** Always pull fresh from CCI
3. **Parse carefully:** FOS format is dense, changes can be subtle
4. **Time zones:** All times in HI output are local (HBT for batch, local for report)

---

## Files

| File | Purpose |
|------|---------|
| `scripts/schedule-parser.js` | Parse HI1 output, compare schedules |
| `data/schedule/*.json` | Stored baselines |
| `docs/WORKFLOW_SCHEDULE_CHANGE.md` | This document |

---

*Workflow for schedule monitoring*
