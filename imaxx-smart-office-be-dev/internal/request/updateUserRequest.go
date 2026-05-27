package request

import (
	"time"

	"github.com/google/uuid"
)

type UpdateUserRequest struct {
	Username   *string     `validate:"omitempty" json:"username"`
	Password   *string     `validate:"omitempty" json:"password"`
	FirstName  string      `validate:"required,min=1,max=255" json:"first_name"`
	LastName   string      `validate:"required,min=1,max=255" json:"last_name"`
	Email      string      `validate:"required,email,min=1,max=255" json:"email"`
	EmployedAt *time.Time  `validate:"required" json:"employed_at"`
	Status     int         `validate:"required" json:"status"`
	RoleIDs    []uuid.UUID `validate:"required" json:"role_ids"`

	CreatedBy *uuid.UUID `json:"-"`
	UpdatedBy *uuid.UUID `json:"-"`
	CreatedAt *time.Time `json:"-"`
	UpdatedAt *time.Time `json:"-"`
	DeletedBy *uuid.UUID `json:"-"`
}
