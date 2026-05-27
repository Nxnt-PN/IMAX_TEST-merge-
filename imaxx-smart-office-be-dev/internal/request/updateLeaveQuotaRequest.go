package request

import (
	"time"

	"github.com/google/uuid"
)

type UpdateLeaveQuotaRequest struct {
	Year   *int `json:"year" binding:"required,min=2000,max=3000"`
	Status *int `json:"status" binding:"required,min=0,max=1"`

	LeaveQuotaDetails []UpdateLeaveQuotaDetailRequest `json:"leave_quota_details" binding:"required,dive"`

	CreatedBy *uuid.UUID `json:"-"`
	UpdatedBy *uuid.UUID `json:"-"`
	CreatedAt *time.Time `json:"-"`
	UpdatedAt *time.Time `json:"-"`
}

type UpdateLeaveQuotaDetailRequest struct {
	WorkYearMin  *float64 `json:"work_year_min" binding:"required"`
	WorkYearMax  *float64 `json:"work_year_max" binding:"required"`
	AbsenceQuota *int     `json:"absence_quota" binding:"required"`
	AnnualQuota  *int     `json:"annual_quota" binding:"required"`
	SickQuota    *int     `json:"sick_quota" binding:"required"`
	OtherQuota   *int     `json:"other_quota" binding:"required"`
	Status       *int     `json:"status" binding:"required,min=0,max=1"`
}
