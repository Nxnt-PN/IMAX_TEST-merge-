package response

import (
	"github.com/google/uuid"
)

type StaffReportLeave struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	FullName string    `json:"full_name"`
	Absence  float64   `json:"absence"`
	Sick     float64   `json:"sick"`
	Annual   float64   `json:"annual"`
	Other    float64   `json:"other"`
	Tenure   Tenure    `json:"tenure"`
	Location string    `json:"location"`
	Avatar   *string   `json:"avatar"`
}

type Tenure struct {
	Years       int    `json:"year"`
	Months      int    `json:"months"`
	Days        int    `json:"days"`
	TotalMonths int    `json:"total_months"`
	DisplayText string `json:"display_text"`
}
