package request

import (
	"time"

	"github.com/google/uuid"
)

type UpdateSystemRequest struct {
	WorkflowID *uuid.UUID `validate:"required" json:"workflow_id"`

	CreatedBy *uuid.UUID `json:"-"`
	UpdatedBy *uuid.UUID `json:"-"`
	CreatedAt *time.Time `json:"-"`
	UpdatedAt *time.Time `json:"-"`
	DeletedBy *uuid.UUID `json:"-"`
}
