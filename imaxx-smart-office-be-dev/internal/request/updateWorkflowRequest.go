package request

import (
	"time"

	"github.com/google/uuid"
)

type UpdateWorkflowRequest struct {
	Name   *string `json:"name" binding:"required,min=1,max=255"`
	Status *int    `json:"status" binding:"required,min=0,max=1"`

	WorkflowDetails []UpdateWorkflowDetailRequest `json:"workflow_details" binding:"required,dive"`

	CreatedBy *uuid.UUID `json:"-"`
	UpdatedBy *uuid.UUID `json:"-"`
	CreatedAt *time.Time `json:"-"`
	UpdatedAt *time.Time `json:"-"`
	DeletedBy *uuid.UUID `json:"-"`
}

type UpdateWorkflowDetailRequest struct {
	Name    string     `json:"name" binding:"required,min=1,max=255"`
	Seq     *int       `json:"seq" binding:"required"`
	State   *int       `json:"state" binding:"required"`
	RoleID  *uuid.UUID `json:"role_id" binding:"required"`
	IsFinal *int       `json:"is_final" binding:"required,min=0,max=1"`
	Status  *int       `json:"status" binding:"required,min=0,max=1"`
}
