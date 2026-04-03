# Lessons Learned

**Purpose:** Document mistakes and corrections to prevent repeat issues  
**Started:** 2026-02-27

---

## 2026-02-27: First Deadhead Check-in

### What Happened

User asked for deadhead check-in. The agent:
1. Read HI3 from CCI
2. Misidentified the deadhead flight (picked 2347 instead of 2406)
3. Proceeded with wrong flight info
4. User had to correct

### Root Cause

**HI3 output:**
```
SKD 28 67 2406 BNA 1324 MIA 1650 2.26AA 2.30
SKD 28 45 2347 MIA 1920 D IAH 2127 3.07 D/P
```

Agent focused on the standalone "D" marker in flight 2347's routing, thinking that indicated deadhead. Didn't recognize that flight 2406 with "2.26AA 2.30" notation (credit hours with "AA" marker) was the actual deadhead.

### What Should Have Been Done

1. **Recognized "AA" notation** as deadhead indicator (credit 2.26AA vs flight time 2.30)
2. **Asked for confirmation** before proceeding with wrong flight
3. **Read the entire schedule more carefully** — the departure airport should have been a clue

### Correction Applied

- Updated HI_COMMANDS.md with deadhead identification section
- Documented "AA" notation pattern (though not yet confirmed universal)
- Need to collect more examples to confirm pattern

### Bigger Issue: Auto Check-in Expectation

User expected **automatic** check-in at T-24 hours WITHOUT prompting. The deadhead's 24-hour window opened and check-in should have happened then.

**What was learned:**
- Don't wait for user to ask for deadhead check-in
- Set up automatic check-in at T-24 hours
- Report completion proactively
- Updated WORKFLOW_DEADHEAD_CHECKIN.md with automation requirements

### Action Items

- [x] Document deadhead ID pattern in HI_COMMANDS.md
- [x] Update workflow with auto check-in requirement
- [ ] Implement auto check-in scheduling mechanism
- [ ] Test deadhead ID pattern with next occurrence
- [ ] Verify if "AA" notation is universal or variable

---

## Pattern Recognition Notes

**Deadheads in HI5/Schedule:**
- May show "AA" after credit hours (e.g., "2.26AA")
- Credit hours differ from flight time
- Standalone "D" in routing may mean something else
- Need more data points to confirm

**Status:** Learning in progress - one data point only

---

*Keep this updated as mistakes are learned from.*
