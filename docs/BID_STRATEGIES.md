# Bid Strategy Templates

**Purpose:** Pre-built bidding strategies for different monthly goals  
**Updated:** 2026-04-02  

---

## How to Use

1. Tell the agent your goal for the month
2. Agent recommends a strategy (or you pick one)
3. Customize based on specific dates/constraints
4. Build the ballot together

---

## Strategy 1: MAX DAYS OFF + MAX PAY
**Goal:** Fewest working days, highest pay per day worked  
**Best for:** Months you want time off but still want good income

### Philosophy
- Bid for **high-credit 2-day trips** (maximize credit per trip)
- Keep credit near **top of LCW** (more buffer to drop)
- Target **efficient TAFB ratio** (less time away, more pay)
- Early-month trips = more flexibility to drop/pickup later

### Layer Structure
```
Layer 1: 
  - Pairing Length: 2
  - Max TAFB Ratio: 2.5
  - Target Credit Range: 85-91
  - Maximize Credit: ON
  - Dates Off: Weekends

Layer 2:
  - Pairing Length: 2
  - Max TAFB Ratio: 3.0
  - Target Credit Range: 83-91
  - Dates Off: Weekends

Layer 3:
  - Pairing Length: 2-3
  - Max TAFB Ratio: 3.25
  - Target Credit Range: 80-91
  - Dates Off: Saturdays only

Layer 4:
  - Pairing Length: 2-3
  - Max TAFB Ratio: 3.5
  - Dates Off: Saturdays only

Layer 5:
  - Pairing Length: 2-4
  - Allow Shuffle To Finish: ON

Layer 6-7:
  - Relax all constraints
  - Avoid Reserve: ON
```

### Post-Award Plan
1. Review awarded line for droppable trips
2. Drop 2-days via TTS (keep credit above GTD)
3. Hunt DOTC for premium replacements
4. Net: Fewer days, same/more pay

---

## Strategy 2: SHORTEST TRIPS + MAX PAY
**Goal:** Only 2-day trips, maximize monthly income  
**Best for:** Months you want maximum schedule flexibility

### Philosophy
- **Only 2-day pairings** (most droppable, most pickups available)
- High credit target
- Accept any 2-day regardless of layover
- More trips = more opportunities to trade up

### Layer Structure
```
Layer 1:
  - Pairing Length: 2 (strict)
  - Max TAFB Ratio: 2.4
  - Target Credit Range: 85-91
  - Maximize Credit: ON
  - Prefer International layovers

Layer 2:
  - Pairing Length: 2
  - Max TAFB Ratio: 2.8
  - Target Credit Range: 83-91

Layer 3:
  - Pairing Length: 2
  - Max TAFB Ratio: 3.2
  - Target Credit Range: 80-91

Layer 4:
  - Pairing Length: 2
  - Any TAFB
  - Target Credit Range: 78-91

Layer 5:
  - Pairing Length: 2
  - Allow Shuffle: ON

Layer 6:
  - Pairing Length: 2-3 (fallback)
  - Avoid Reserve: ON

Layer 7:
  - Any pairing length
  - Avoid Reserve: ON
```

### Post-Award Plan
1. All trips are 2-days = all droppable
2. Aggressive TTS drops early month
3. Build month from premium/OG pickups
4. Flexibility to respond to opportunities

---

## Strategy 3: PREMIUM HUNTING BASE
**Goal:** Minimal line, maximum open time flexibility  
**Best for:** Months you want to chase premium exclusively

### Philosophy
- Bid for **lowest credit that still holds a line**
- Leaves maximum room to pickup premium
- Accept any short trips
- Don't care about days off pattern (will rebuild anyway)

### Layer Structure
```
Layer 1:
  - Pairing Length: 2
  - Target Credit Range: 75-80 (bottom of LCW)
  - No days off constraints
  - Early month trips preferred

Layer 2:
  - Pairing Length: 2-3
  - Target Credit Range: 75-82

Layer 3:
  - Pairing Length: 2-3
  - Target Credit Range: 75-84

Layer 4:
  - Any pairing
  - Target Credit Range: 75-87

Layer 5-6:
  - Relax all
  - Allow Shuffle: ON

Layer 7:
  - Avoid Reserve: ON
```

### Post-Award Plan
1. Drop entire line via TTS if possible
2. Start month near GTD
3. Build entire month from DOTC premium
4. Maximum $/hour

---

## Strategy 4: SPECIFIC DAYS OFF (Events/Travel)
**Goal:** Guarantee specific dates off, maximize around them  
**Best for:** Months with weddings, vacations, events

### Philosophy
- **MUST OFF** on critical dates (Layer 1)
- Relax to **PREFER OFF** in lower layers
- Accept any trips that work around constraints
- May sacrifice some income for schedule certainty

### Layer Structure
```
Layer 1:
  - MUST OFF: [Your specific dates]
  - Pairing Length: 2-3
  - Target Credit Range: 80-88

Layer 2:
  - MUST OFF: [Critical dates only]
  - PREFER OFF: [Nice-to-have dates]
  - Pairing Length: 2-4

Layer 3:
  - MUST OFF: [Critical dates only]
  - Relax pairing constraints

Layer 4-5:
  - PREFER OFF: [All desired dates]
  - Any pairings that fit

Layer 6-7:
  - Relax days off to Prefer only
  - Avoid Reserve: ON
```

### Post-Award Plan
1. Verify critical dates are off
2. Optimize remaining trips via TTS
3. Accept less flexibility this month

---

## Strategy 5: WEEKENDS OFF + BALANCED
**Goal:** Consistent weekends off, reasonable credit  
**Best for:** Months you want predictable time with family

### Philosophy
- Protect **Saturdays and Sundays**
- Accept mid-week flying
- Target middle of LCW (not chasing max)
- Quality of life > max income

### Layer Structure
```
Layer 1:
  - Dates Off: All weekends (Sat+Sun)
  - Pairing Length: 2-3
  - Target Credit Range: 78-85
  - Start Work Block: Monday or Tuesday

Layer 2:
  - Dates Off: All weekends
  - Pairing Length: 2-4
  - Target Credit Range: 76-87

Layer 3:
  - Dates Off: Saturdays only
  - Pairing Length: 2-4

Layer 4:
  - Dates Off: Saturdays only
  - Any pairing length

Layer 5-6:
  - PREFER OFF weekends
  - Relax constraints

Layer 7:
  - Avoid Reserve: ON
```

### Post-Award Plan
1. Keep awarded line mostly intact
2. Only trade if significantly better opportunity
3. Protect weekend pattern

---

## Strategy 6: INTERNATIONAL LAYOVERS
**Goal:** Best layover cities, good credit  
**Best for:** Months you want interesting destinations

### Philosophy
- Target **specific international layovers**
- Accept slightly lower efficiency for better cities
- Good for seniority that can hold preferences

### Layer Structure
```
Layer 1:
  - Prefer Layover: [Top cities - SJU, AUA, NAS, etc.]
  - Pairing Length: 3-4
  - Target Credit Range: 80-88

Layer 2:
  - Prefer Layover: [Second tier cities]
  - Pairing Length: 2-4

Layer 3:
  - Prefer Layover: [Any international]
  - Avoid Layover: [Cities you don't want]

Layer 4-5:
  - Relax layover preferences
  - Keep credit targets

Layer 6-7:
  - Any layovers
  - Avoid Reserve: ON
```

---

## Quick Reference: Key Properties

| Property | What It Does |
|----------|--------------|
| **Pairing Length** | 1-6 days (2 = most droppable) |
| **Max TAFB Ratio** | Efficiency (lower = better $/hr) |
| **Target Credit Range** | Aim within LCW |
| **Maximize Credit** | Push to top of range |
| **Work Block Length** | Group trips together (max 6 days) |
| **Avoid Reserve** | Try harder for line before reserve |
| **Allow Shuffle** | Let PBS reorder to complete line |
| **Clear Bid** | Reset and try different strategy mid-ballot |

---

## Asking for Help

Just tell the agent:
1. "Help me bid — I want [strategy name]"
2. "Help me bid — I need [specific dates] off and want [goal]"
3. "What strategy for a month where I want to [goal]?"

The agent will build the layers with you.

---

*Strategies for AA pilot bidding*
