package model

import "github.com/google/uuid"

type RolePermission struct {
	PermissionID uuid.UUID `gorm:"type:uuid;primaryKey"`
	RoleID       uuid.UUID `gorm:"type:uuid;primaryKey"`
}
