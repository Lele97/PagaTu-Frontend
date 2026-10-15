package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/lib/pq" // or your DB driver
)

// UserStats matches the frontend expectation
type UserStats struct {
	TotalPaid                float64 `json:"totalPaid"`
	TotalCoffeesForOthers    int     `json:"totalCoffeesForOthers"`
	TimesKing                int     `json:"timesKing"`
	CurrentStreak            int     `json:"currentStreak"`
	LongestStreak            int     `json:"longestStreak"`
	SkippedCount             int     `json:"skippedCount"`
	CoffeeKarma              int     `json:"coffeeKarma"`
	FunTitle                 string  `json:"funTitle"`
	MonthlySavedForFriends   float64 `json:"monthlySavedForFriends"`
	AveragePayment           float64 `json:"averagePayment"`
	MostExpensiveCoffee      float64 `json:"mostExpensive"`
}

// UserAward matches the frontend
type UserAward struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Level string `json:"level"` // gold, silver, bronze
	Icon  string `json:"icon"`
}

// GetUserStatistics handler
// Route: GET /api/coffee/user/statistics
func (s *Server) GetUserStatistics(w http.ResponseWriter, r *http.Request) {
	user := getCurrentUser(r) // implement from your JWT middleware
	if user == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	stats, err := s.calculateUserStatistics(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetUserAwards handler
// Route: GET /api/coffee/user/awards
func (s *Server) GetUserAwards(w http.ResponseWriter, r *http.Request) {
	user := getCurrentUser(r)
	if user == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	awards, err := s.calculateUserAwards(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(awards)
}

// ===== BUSINESS LOGIC =====

func (s *Server) calculateUserStatistics(username string) (UserStats, error) {
	// Example queries - adapt to your schema
	// Assumes tables: pagamenti, salta_pagamento, groups, user_memberships

	var stats UserStats

	// Total paid by user
	err := s.db.QueryRow(`
		SELECT COALESCE(SUM(importo), 0)
		FROM pagamenti
		WHERE username = $1
	`, username).Scan(&stats.TotalPaid)
	if err != nil {
		return stats, err
	}

	// Total coffees paid for others (paga per)
	err = s.db.QueryRow(`
		SELECT COUNT(*)
		FROM pagamenti
		WHERE username = $1 AND paga_per = true
	`, username).Scan(&stats.TotalCoffeesForOthers)
	if err != nil {
		return stats, err
	}

	// Times user was "king" (highest payer in a round)
	// This is simplified - you may need to join with rounds or calculate per group cycle
	stats.TimesKing = s.calculateTimesKing(username)

	// Current streak (consecutive rounds without skip)
	stats.CurrentStreak = s.calculateCurrentStreak(username)

	// Longest streak
	stats.LongestStreak = s.calculateLongestStreak(username)

	// Skipped count
	err = s.db.QueryRow(`
		SELECT COUNT(*)
		FROM salta_pagamento
		WHERE username = $1
	`, username).Scan(&stats.SkippedCount)
	if err != nil {
		return stats, err
	}

	// Coffee karma (fun formula)
	totalRounds := stats.TimesKing + stats.SkippedCount + 1 // rough estimate
	if totalRounds > 0 {
		stats.CoffeeKarma = 100 - int(float64(stats.SkippedCount)/float64(totalRounds)*60)
		if stats.CoffeeKarma < 0 {
			stats.CoffeeKarma = 0
		}
	} else {
		stats.CoffeeKarma = 50
	}

	// Fun title
	stats.FunTitle = getFunTitle(stats)

	// Monthly saved for friends
	firstOfMonth := time.Now().AddDate(0, -1, 0).Format("2006-01-02")
	err = s.db.QueryRow(`
		SELECT COALESCE(SUM(importo), 0)
		FROM pagamenti
		WHERE username = $1 AND paga_per = true AND payment_date >= $2
	`, username, firstOfMonth).Scan(&stats.MonthlySavedForFriends)
	if err != nil {
		return stats, err
	}

	// Average payment
	if stats.TotalPaid > 0 && (stats.TotalCoffeesForOthers+stats.TimesKing) > 0 {
		totalPayments := stats.TotalCoffeesForOthers + stats.TimesKing // rough
		stats.AveragePayment = stats.TotalPaid / float64(totalPayments)
	}

	// Most expensive
	err = s.db.QueryRow(`
		SELECT COALESCE(MAX(importo), 0)
		FROM pagamenti
		WHERE username = $1
	`, username).Scan(&stats.MostExpensive)
	if err != nil {
		return stats, err
	}

	return stats, nil
}

// calculateTimesKing - count rounds where user paid the most
func (s *Server) calculateTimesKing(username string) int {
	// This is a simplified version.
	// In real impl you would group by round/group cycle.
	// Example query (adapt to your round logic):
	var count int
	// Pseudo: for each group round, if this user has max importo
	err := s.db.QueryRow(`
		WITH user_payments AS (
			SELECT group_name, DATE(payment_date) as round_date, SUM(importo) as user_total
			FROM pagamenti
			WHERE username = $1
			GROUP BY group_name, DATE(payment_date)
		),
		group_max AS (
			SELECT group_name, DATE(payment_date) as round_date, MAX(SUM(importo)) as max_total
			FROM pagamenti
			GROUP BY group_name, DATE(payment_date)
		)
		SELECT COUNT(*)
		FROM user_payments u
		JOIN group_max g ON u.group_name = g.group_name AND u.round_date = g.round_date
		WHERE u.user_total = g.max_total
	`, username).Scan(&count)
	if err != nil {
		return 0
	}
	return count
}

// calculateCurrentStreak
func (s *Server) calculateCurrentStreak(username string) int {
	// Simplified: count recent consecutive non-skipped rounds
	// Real version would be more sophisticated based on your round system
	var streak int
	// Example placeholder logic
	rows, err := s.db.Query(`
		SELECT DATE(payment_date) 
		FROM pagamenti 
		WHERE username = $1 
		ORDER BY payment_date DESC 
		LIMIT 30
	`, username)
	if err != nil {
		return 0
	}
	defer rows.Close()

	// TODO: implement proper consecutive day/round logic based on your model
	for rows.Next() {
		streak++
	}
	return streak
}

// calculateLongestStreak
func (s *Server) calculateLongestStreak(username string) int {
	// Similar to current but find max
	return 12 // placeholder - implement real logic
}

// getFunTitle - fun logic
func getFunTitle(stats UserStats) string {
	switch {
	case stats.TimesKing >= 5:
		return "Coffee Legend"
	case stats.CurrentStreak >= 10:
		return "The Reliable One"
	case stats.SkippedCount > stats.TimesKing*2:
		return "Skip Master"
	case stats.TotalCoffeesForOthers >= 20:
		return "The Savior"
	case stats.TotalPaid >= 100:
		return "Coffee Hero"
	default:
		return "Coffee Enthusiast"
	}
}

// calculateUserAwards - compute badges
func (s *Server) calculateUserAwards(username string) ([]UserAward, error) {
	// You can store awarded badges or compute on the fly
	// For simplicity, compute on the fly here

	stats, err := s.calculateUserStatistics(username)
	if err != nil {
		return nil, err
	}

	var awards []UserAward
	id := 1

	if stats.TimesKing >= 3 || stats.CurrentStreak >= 7 {
		awards = append(awards, UserAward{
			ID:    id, Name: "Caffè King del mese", Level: "gold", Icon: "bi-cup-hot-fill",
		})
		id++
	}
	if stats.CurrentStreak >= 3 {
		awards = append(awards, UserAward{
			ID:    id, Name: "Streak 7 giorni", Level: "silver", Icon: "bi-star-fill",
		})
		id++
	}
	if stats.TotalPaid > 0 {
		awards = append(awards, UserAward{
			ID:    id, Name: "Primo gruppo", Level: "bronze", Icon: "bi-people-fill",
		})
		id++
	}
	if stats.TotalCoffeesForOthers >= 5 {
		awards = append(awards, UserAward{
			ID:    id, Name: "Ha pagato per 5 amici", Level: "gold", Icon: "bi-heart-fill",
		})
	}

	return awards, nil
}

// Helper: get current user from context (your auth middleware)
func getCurrentUser(r *http.Request) string {
	// TODO: implement based on your JWT middleware
	// Example:
	// user, _ := r.Context().Value("user").(string)
	// return user
	return "testuser" // placeholder - replace with real
}

// Server struct example
type Server struct {
	db *sql.DB
	// other deps
}