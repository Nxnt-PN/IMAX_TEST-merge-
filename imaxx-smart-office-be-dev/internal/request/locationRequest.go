package request

import (
	"time"

	"github.com/google/uuid"
)

type CreateLocationRequest struct {
	LocationName string `validate:"required,min=1,max=100" json:"location_name"`
	Status       int    `validate:"required" json:"status"`

	CreatedBy *uuid.UUID `json:"-"`
	UpdatedBy *uuid.UUID `json:"-"`
	CreatedAt *time.Time `json:"-"`
	UpdatedAt *time.Time `json:"-"`
}

type UpdateLocationRequest struct {
	LocationName string `validate:"required,min=1,max=100" json:"location_name"`
	Status       int    `validate:"required" json:"status"`

	UpdatedBy *uuid.UUID `json:"-"`
	UpdatedAt *time.Time `json:"-"`
	DeletedBy *uuid.UUID `json:"-"`
}
