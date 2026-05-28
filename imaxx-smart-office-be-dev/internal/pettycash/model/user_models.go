package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Location
type Location struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	LocationName string         `gorm:"type:varchar(100);not null" json:"location_name"`
	Status       int            `gorm:"not null;default:1" json:"status"`
	CreatedBy    *uuid.UUID     `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy    *uuid.UUID     `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy    *uuid.UUID     `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// User
type User struct {
	ID              uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Username        string         `gorm:"type:varchar(150);not null;unique" json:"username"`
	Password        string         `gorm:"type:varchar(255);not null" json:"-"`
	FirstName       string         `gorm:"type:varchar(255);not null" json:"first_name"`
	LastName        string         `gorm:"type:varchar(255);not null" json:"last_name"`
	Email           string         `gorm:"type:varchar(255);not null;unique" json:"email"`
	EmployedAt      time.Time      `gorm:"not null" json:"employed_at"`
	LocationID      *uuid.UUID     `gorm:"type:uuid" json:"location_id,omitempty"`
	Location        *Location      `gorm:"foreignKey:LocationID" json:"location,omitempty"` // <--- เติม * และ ,omitempty
	AvatarPath      *string        `gorm:"column:avatar_path;type:varchar(500)" json:"avatar_path,omitempty"`
	ProfileImageURL string         `gorm:"-" json:"profile_image_url"`
	Status          int            `gorm:"not null;default:1" json:"status"`
	CreatedBy       *uuid.UUID     `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt       time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy       *uuid.UUID     `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy       *uuid.UUID     `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Roles           []Role         `gorm:"many2many:user_roles;foreignKey:ID;joinForeignKey:UserID;References:ID;joinReferences:RoleID" json:"roles,omitempty"`
}

// Role
type Role struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null;unique" json:"name"`
	Status      int            `gorm:"not null;default:1" json:"status"`
	CreatedBy   *uuid.UUID     `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy   *uuid.UUID     `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy   *uuid.UUID     `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Permissions []Permission   `gorm:"many2many:role_permissions;foreignKey:ID;joinForeignKey:RoleID;References:ID;joinReferences:PermissionID" json:"permissions,omitempty"`
}

// Permission
type Permission struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(255);not null;unique" json:"name"`
	Status    int            `gorm:"not null;default:1" json:"status"`
	CreatedBy *uuid.UUID     `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy *uuid.UUID     `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy *uuid.UUID     `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// UserRole
type UserRole struct {
	UserID uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	RoleID uuid.UUID `gorm:"type:uuid;primaryKey" json:"role_id"`
}

// RolePermission
type RolePermission struct {
	RoleID       uuid.UUID `gorm:"type:uuid;primaryKey" json:"role_id"`
	PermissionID uuid.UUID `gorm:"type:uuid;primaryKey" json:"permission_id"`
}

// ParentChildRole
type ParentChildRole struct {
	ParentRoleID uuid.UUID `gorm:"type:uuid;primaryKey" json:"parent_role_id"`
	ChildRoleID  uuid.UUID `gorm:"type:uuid;primaryKey" json:"child_role_id"`
}
