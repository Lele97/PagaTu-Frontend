# Backend User Statistics API (for Home page)

## Endpoints to implement (GET, require auth Bearer token)

### 1. GET /api/coffee/user/statistics
Personal user stats across groups.

**Response 200 example:**
```json
{
  "totalPaid": 52.75,
  "totalCoffeesForOthers": 31,
  "timesKing": 4,
  "currentStreak": 6,
  "skippedCount": 1,
  "coffeeKarma": 92,
  "funTitle": "Coffee Legend",
  "monthlySavedForFriends": 15.8
}
```

### 2. GET /api/coffee/user/awards
List of earned badges.

**Response 200 example:**
```json
[
  {
    "id": 1,
    "name": "Caffè King del mese",
    "level": "gold",
    "icon": "bi-cup-hot-fill"
  },
  {
    "id": 2,
    "name": "Streak 7 giorni",
    "level": "silver",
    "icon": "bi-star-fill"
  },
  {
    "id": 4,
    "name": "Ha pagato per 5 amici in un giro",
    "level": "gold",
    "icon": "bi-heart-fill"
  }
]
```

## Fun statistics to compute in backend

You should aggregate from the `pagamenti` table (or equivalent) for the user across all groups.

### Core fields to return in /statistics:

- `totalPaid`: SUM(importo) for all payments by the user
- `totalCoffeesForOthers`: COUNT of payments where the user used "paga per" feature or paid more than their share
- `timesKing`: number of rounds where the user had the highest totalPaid in that round/group cycle
- `currentStreak`: current number of consecutive rounds the user paid without skipping
- `longestStreak`: max consecutive payments without skip
- `skippedCount`: total times the user used "salta pagamento"
- `coffeeKarma`: calculate as 100 - (skippedCount / totalRounds * 50) clamped 0-100
- `funTitle`: based on stats (see below)
- `monthlySavedForFriends`: SUM of amounts user paid for others this month
- `averagePayment`: avg importo per payment
- `mostExpensiveCoffee`: max importo in a single payment

### Fun title logic (example in backend):

```go
func getFunTitle(stats Stats) string {
    if stats.timesKing >= 5 {
        return "Coffee Legend"
    }
    if stats.currentStreak >= 10 {
        return "The Reliable One"
    }
    if stats.skippedCount > stats.timesKing {
        return "Skip Master"
    }
    if stats.totalCoffeesForOthers > 20 {
        return "The Savior"
    }
    if stats.totalPaid > 100 {
        return "Coffee Hero"
    }
    return "Coffee Enthusiast"
}
```

### Awards logic:

Award a badge when thresholds met:
- gold: timesKing >= 3 or streak >= 7 or paid for 5+ in one round
- silver: timesKing >=1 or streak >=3
- bronze: any payment or group joined

Store in a user_awards or compute on fly.

Return list with name, level, icon.

Use the same DB tables as group stats (bilancio, pagamenti, salta_pagamento, gamification).
