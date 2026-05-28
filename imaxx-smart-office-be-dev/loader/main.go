package main

import (
	"fmt"
	"imaxx-smart-office-be/internal/model"
	"io"
	"os"
	"time"

	"ariga.io/atlas-provider-gorm/gormschema"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PettyCashProject struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ProjectName string     `gorm:"type:varchar(100);not null"`
	Description string     `gorm:"type:text"`
	Status      int        `gorm:"not null;default:1"`
	CreatedBy   *uuid.UUID `gorm:"type:uuid"`
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedBy   *uuid.UUID `gorm:"type:uuid"`
	UpdatedAt   *time.Time
	DeletedBy   *uuid.UUID     `gorm:"type:uuid"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (PettyCashProject) TableName() string {
	return "petty_cash_projects"
}

type PettyCashReason struct {
	ID          uuid.UUID     `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SystemID    *uuid.UUID    `gorm:"type:uuid"`
	System      *model.System `gorm:"foreignKey:SystemID"`
	ReasonName  string        `gorm:"type:varchar(100);not null"`
	Description string        `gorm:"type:text"`
	Status      int           `gorm:"not null;default:1"`
	CreatedBy   *uuid.UUID    `gorm:"type:uuid"`
	CreatedAt   time.Time     `gorm:"autoCreateTime"`
	UpdatedBy   *uuid.UUID    `gorm:"type:uuid"`
	UpdatedAt   *time.Time
	DeletedBy   *uuid.UUID     `gorm:"type:uuid"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (PettyCashReason) TableName() string {
	return "petty_cash_reasons"
}

type PettyCashForm struct {
	ID            uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID        uuid.UUID       `gorm:"type:uuid;not null"`
	User          *model.User     `gorm:"foreignKey:UserID"`
	WorkflowID    uuid.UUID       `gorm:"type:uuid;not null"`
	Workflow      *model.Workflow `gorm:"foreignKey:WorkflowID"`
	DocumentNo    string          `gorm:"type:varchar(20);uniqueIndex"`
	Title         string          `gorm:"type:varchar(100);not null"`
	State         int             `gorm:"not null;default:1"`
	StateDetail   string          `gorm:"type:varchar(100)"`
	RoleID        *uuid.UUID      `gorm:"type:uuid"`
	Role          *model.Role     `gorm:"foreignKey:RoleID"`
	TotalAmount   int             `gorm:"not null;default:0"`
	Note          string          `gorm:"type:varchar(100)"`
	RejectComment string          `gorm:"type:text"`
	RejectedBy    *uuid.UUID      `gorm:"type:uuid"`
	RejectedAt    *time.Time
	RejectedUser  *model.User `gorm:"foreignKey:RejectedBy"`
	CreatedBy     *uuid.UUID  `gorm:"type:uuid"`
	CreatedAt     time.Time   `gorm:"autoCreateTime"`
	UpdatedBy     *uuid.UUID  `gorm:"type:uuid"`
	UpdatedAt     *time.Time
	DeletedBy     *uuid.UUID     `gorm:"type:uuid"`
	DeletedAt     gorm.DeletedAt `gorm:"index"`
}

func (PettyCashForm) TableName() string {
	return "petty_cash_forms"
}

type PettyCashFormItem struct {
	ID              uuid.UUID             `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	PettyCashFormID uuid.UUID             `gorm:"type:uuid;not null"`
	PettyCashForm   *PettyCashForm        `gorm:"foreignKey:PettyCashFormID;constraint:OnDelete:CASCADE"`
	ProjectID       uuid.UUID             `gorm:"type:uuid;not null"`
	Project         *PettyCashProject     `gorm:"foreignKey:ProjectID"`
	ReasonID        uuid.UUID             `gorm:"type:uuid;not null"`
	Reason          *PettyCashReason      `gorm:"foreignKey:ReasonID"`
	Date            time.Time             `gorm:"not null"`
	Description     string                `gorm:"type:text"`
	Note            string                `gorm:"type:text"`
	Total           int                   `gorm:"not null"`
	Attachments     []PettyCashAttachment `gorm:"foreignKey:PettyCashFormItemID;constraint:OnDelete:CASCADE"`
	CreatedAt       time.Time             `gorm:"autoCreateTime"`
	UpdatedAt       *time.Time
}

func (PettyCashFormItem) TableName() string {
	return "petty_cash_form_items"
}

type PettyCashAttachment struct {
	ID                  uuid.UUID          `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	PettyCashFormItemID uuid.UUID          `gorm:"type:uuid;not null"`
	PettyCashFormItem   *PettyCashFormItem `gorm:"foreignKey:PettyCashFormItemID;constraint:OnDelete:CASCADE"`
	FileName            string             `gorm:"type:varchar(100);not null"`
	FilePath            string             `gorm:"type:varchar(500);not null"`
	FileSize            int                `gorm:"not null"`
	CreatedAt           time.Time          `gorm:"autoCreateTime"`
}

func (PettyCashAttachment) TableName() string {
	return "petty_cash_attachments"
}

type PettyCashHistory struct {
	ID              uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	PettyCashFormID uuid.UUID      `gorm:"type:uuid;not null"`
	PettyCashForm   *PettyCashForm `gorm:"foreignKey:PettyCashFormID;constraint:OnDelete:CASCADE"`
	UserID          *uuid.UUID     `gorm:"type:uuid"`
	User            *model.User    `gorm:"foreignKey:UserID"`
	Action          string         `gorm:"type:varchar(50);not null"`
	Remark          string         `gorm:"type:text"`
	State           int            `gorm:"not null"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
}

func (PettyCashHistory) TableName() string {
	return "petty_cash_histories"
}

func main() {
	stmts, err := gormschema.New("postgres").Load(
		&model.Location{},
		&model.User{},
		&model.Role{},
		&model.ParentChildRole{},
		&model.Permission{},
		&model.UserRole{},
		&model.RolePermission{},
		&model.Workflow{},
		&model.WorkflowDetail{},
		&model.System{},
		&model.LeaveQuota{},
		&model.LeaveQuotaDetail{},
		&model.LeaveForm{},
		&model.LeaveFormHistory{},
		&model.Notification{},
		&PettyCashProject{},
		&PettyCashReason{},
		&PettyCashForm{},
		&PettyCashFormItem{},
		&PettyCashAttachment{},
		&PettyCashHistory{},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load gorm schema: %v\n", err)
		os.Exit(1)
	}
	io.WriteString(os.Stdout, stmts)
}
