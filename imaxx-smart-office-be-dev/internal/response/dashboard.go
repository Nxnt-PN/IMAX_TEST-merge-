package response

import (
	"time"

	"github.com/google/uuid"
)

type LeaveGroupingCount struct {
	Absence LeaveCountValue `json:"absence"`
	Sick    LeaveCountValue `json:"sick"`
	Annual  LeaveCountValue `json:"annual"`
	Other   LeaveCountValue `json:"other"`
}

type LeaveCountValue struct {
	Use   float64 `json:"use"`
	Quota float64 `json:"quota"`
}

type UserCalendar struct {
	ID        uuid.UUID       `json:"id"`
	User      *UserInCalender `json:"user"`
	Type      string          `json:"type"`
	Reason    *string         `json:"reason"`
	StartDate time.Time       `json:"start_date"`
	EndDate   time.Time       `json:"end_date"`
}

type UserInCalender struct {
	ID         uuid.UUID `json:"id"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	Email      string    `json:"email"`
	EmployedAt time.Time `json:"employed_at"`
}
