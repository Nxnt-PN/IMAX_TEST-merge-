package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// System
type System struct {
	ID         uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Slug       string         `gorm:"type:varchar(100);not null;unique" json:"slug"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	WorkflowID uuid.UUID      `gorm:"type:uuid;not null" json:"workflow_id"`
	Workflow   *Workflow      `gorm:"foreignKey:WorkflowID" json:"workflow,omitempty"`
	Status     int            `gorm:"not null;default:1" json:"status"`
	CreatedBy  *uuid.UUID     `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt  time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy  *uuid.UUID     `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy  *uuid.UUID     `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Workflow
type Workflow struct {
	ID        uuid.UUID        `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name      string           `gorm:"type:varchar(255);not null" json:"name"`
	Status    int              `gorm:"not null;default:1" json:"status"`
	Details   []WorkflowDetail `gorm:"foreignKey:WorkflowID" json:"details,omitempty"`
	CreatedBy *uuid.UUID       `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt time.Time        `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy *uuid.UUID       `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt time.Time        `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy *uuid.UUID       `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt gorm.DeletedAt   `gorm:"index" json:"deleted_at,omitempty"`
}

// WorkflowDetail
type WorkflowDetail struct {
	ID         uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	WorkflowID uuid.UUID      `gorm:"type:uuid;not null" json:"workflow_id"`
	Workflow   *Workflow      `gorm:"foreignKey:WorkflowID" json:"workflow,omitempty"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	Seq        int            `gorm:"not null" json:"seq"`
	RoleID     uuid.UUID      `gorm:"type:uuid;not null" json:"role_id"`
	Role       *Role          `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	IsFinal    int            `gorm:"not null;default:0" json:"is_final"`
	Status     int            `gorm:"not null;default:1" json:"status"`
	State      int            `gorm:"not null;default:2" json:"state"`
	CreatedBy  *uuid.UUID     `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt  time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy  *uuid.UUID     `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy  *uuid.UUID     `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
