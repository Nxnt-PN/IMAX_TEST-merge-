package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// gorm.Model definition
type BaseModel struct {
	ID        *uuid.UUID     `json:"id" gorm:"column:id;type:uuid;default:gen_random_uuid();primaryKey" copier:"-"`
	CreatedBy *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	CreatedAt time.Time      `json:"created_at" gorm:"column:created_at;type:timestamp;not null"`
	UpdatedBy *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	UpdatedAt *time.Time     `json:"updated_at" gorm:"column:updated_at;type:timestamp"`
	DeletedBy *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"column:deleted_at;type:timestamp;index"`

	CreatedUser *User `json:"created_user" gorm:"foreignKey:CreatedBy"`
	UpdatedUser *User `json:"updated_user" gorm:"foreignKey:UpdatedBy"`
	DeletedUser *User `json:"deleted_user" gorm:"foreignKey:DeletedBy"`
}

func IsActive(db *gorm.DB) *gorm.DB {
	return db.Where("status = ?", 1)
}
