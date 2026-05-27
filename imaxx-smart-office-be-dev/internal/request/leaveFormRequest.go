package request

import (
	"imaxx-smart-office-be/enums"
	"time"

	"github.com/google/uuid"
)

type LeaveFormRequest struct {
	UserID    *uuid.UUID      `json:"user_id,omitempty"`
	LeaveType enums.LeaveType `json:"leave_type" binding:"required"`
	StartDate time.Time       `json:"start_date" binding:"required"`
	EndDate   time.Time       `json:"end_date" binding:"required"`
	Reason    *string         `json:"reason" binding:"required"`
	FilePath  *string         `json:"-"`

	Action enums.ActionRequest `json:"action" binding:"required,oneof=save submit"`
	Remark *string             `json:"remark,omitempty"`

	LeaveFormHistories []LeaveFormHistoryRequest `json:"-" binding:"dive"`

	TotalDays   float64          `json:"-"`
	State       enums.LeaveState `json:"-"`
	StateDetail string           `json:"-"`
	WorkflowID  *uuid.UUID       `json:"-"`
	RoleID      *uuid.UUID       `json:"-"`
	CreatedBy   *uuid.UUID       `json:"-"`
	UpdatedBy   *uuid.UUID       `json:"-"`
	CreatedAt   *time.Time       `json:"-"`
	UpdatedAt   *time.Time       `json:"-"`
}

type LeaveFormHistoryRequest struct {
	Action string           `json:"-"`
	Remark *string          `json:"-"`
	State  enums.LeaveState `json:"-"`
}

type ReviewRequest struct {
	Remark *string `json:"remark,omitempty"`
}
