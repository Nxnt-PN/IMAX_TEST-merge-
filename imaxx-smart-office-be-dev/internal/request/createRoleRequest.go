package request

import (
	"time"

	"github.com/google/uuid"
)

type CreateRoleRequest struct {
	Name   string `validate:"required,min=1,max=255" json:"name"`
	Status int    `validate:"required" json:"status"`

	PermissionIDs []uuid.UUID `validate:"required" json:"permission_ids"`
	ChildRoleIDs  []uuid.UUID `validate:"required" json:"child_role_ids"`

	CreatedBy *uuid.UUID `json:"-"`
	UpdatedBy *uuid.UUID `json:"-"`
	CreatedAt *time.Time `json:"-"`
	UpdatedAt *time.Time `json:"-"`
}
