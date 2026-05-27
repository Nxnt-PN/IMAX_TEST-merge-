package model

import "github.com/google/uuid"

type ParentChildRole struct {
	ParentRoleID uuid.UUID `gorm:"type:uuid;primaryKey"`
	ChildRoleID  uuid.UUID `gorm:"type:uuid;primaryKey"`
}
