package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PettyCashForm
type PettyCashForm struct {
	ID            uuid.UUID           `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID        uuid.UUID           `gorm:"type:uuid;not null" json:"user_id"`
	User          *User               `gorm:"foreignKey:UserID" json:"user,omitempty"`
	WorkflowID    uuid.UUID           `gorm:"type:uuid;not null" json:"workflow_id"`
	Workflow      *Workflow           `gorm:"foreignKey:WorkflowID" json:"workflow,omitempty"`
	DocumentNo    string              `gorm:"type:varchar(20);uniqueIndex" json:"document_no"`
	Title         string              `gorm:"type:varchar(100);not null" json:"title"`
	State         int                 `gorm:"not null;default:1" json:"state"`
	StateDetail   string              `gorm:"type:varchar(100)" json:"state_detail"`
	RoleID        uuid.UUID           `gorm:"type:uuid" json:"role_id"`
	Role          *Role               `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	TotalAmount   int                 `gorm:"not null;default:0" json:"total_amount"`
	Note          string              `gorm:"type:varchar(100)" json:"note"`
	RejectComment string              `gorm:"type:text" json:"reject_comment"`
	RejectedBy    *uuid.UUID          `gorm:"type:uuid" json:"rejected_by,omitempty"`
	RejectedAt    *time.Time          `json:"rejected_at,omitempty"`
	RejectedUser  *User               `gorm:"foreignKey:RejectedBy" json:"rejected_user,omitempty"`
	Items         []PettyCashFormItem `gorm:"foreignKey:PettyCashFormID" json:"items,omitempty"`
	History       []PettyCashHistory  `gorm:"foreignKey:PettyCashFormID" json:"history,omitempty"`
	CreatedBy     *uuid.UUID          `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt     time.Time           `gorm:"autoCreateTime" json:"created_at"`
	UpdatedBy     *uuid.UUID          `gorm:"type:uuid" json:"updated_by,omitempty"`
	UpdatedAt     time.Time           `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedBy     *uuid.UUID          `gorm:"type:uuid" json:"deleted_by,omitempty"`
	DeletedAt     gorm.DeletedAt      `gorm:"index" json:"deleted_at,omitempty"`
}

// PettyCashFormItem
type PettyCashFormItem struct {
	ID              uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	PettyCashFormID uuid.UUID      `gorm:"type:uuid;not null" json:"pettycash_form_id"`
	PettyCashForm   *PettyCashForm `gorm:"foreignKey:PettyCashFormID" json:"pettycash_form,omitempty"`
	ProjectID       uuid.UUID      `gorm:"type:uuid;not null" json:"project_id"`
	Project         *Project       `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	ReasonID        uuid.UUID      `gorm:"type:uuid;not null" json:"reason_id"`
	Reason          *Reason        `gorm:"foreignKey:ReasonID" json:"reason,omitempty"`
	Date            time.Time      `gorm:"not null" json:"date"`
	Description     string         `gorm:"type:text" json:"description"`
	Note            string         `gorm:"type:text" json:"note"`
	Total           int            `gorm:"not null" json:"total"`
	Attachments     []Attachment   `gorm:"foreignKey:PettyCashFormItemID;constraint:OnDelete:CASCADE" json:"attachments,omitempty"`
	CreatedAt       time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
}

// Attachment
type Attachment struct {
	ID                  uuid.UUID          `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	PettyCashFormItemID uuid.UUID          `gorm:"type:uuid;not null" json:"pettycash_form_item_id"`
	PettyCashFormItem   *PettyCashFormItem `gorm:"foreignKey:PettyCashFormItemID;constraint:OnDelete:CASCADE" json:"pettycash_form_item,omitempty"`
	FileName            string             `gorm:"type:varchar(100);not null" json:"file_name"`
	FilePath            string             `gorm:"type:varchar(500);not null" json:"file_path"`
	FileSize            int                `gorm:"not null" json:"file_size"`
	CreatedAt           time.Time          `gorm:"autoCreateTime" json:"created_at"`
}

// PettyCashHistory
type PettyCashHistory struct {
	ID              uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	PettyCashFormID uuid.UUID      `gorm:"type:uuid;not null" json:"pettycash_form_id"`
	PettyCashForm   *PettyCashForm `gorm:"foreignKey:PettyCashFormID" json:"pettycash_form,omitempty"`
	UserID          *uuid.UUID     `gorm:"type:uuid" json:"user_id,omitempty"`
	User            *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Action          string         `gorm:"type:varchar(50);not null" json:"action"`
	Remark          string         `gorm:"type:text" json:"remark"`
	State           int            `gorm:"not null" json:"state"`
	CreatedAt       time.Time      `gorm:"autoCreateTime" json:"created_at"`
}
