package model

import (
	"imaxx-smart-office-be/enums"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LeaveFormHistory struct {
	BaseModel   `gorm:"embedded"`
	LeaveFormID uuid.UUID `json:"leave_form_id" gorm:"type:uuid;not null"`

	Action string           `json:"action" gorm:"column:action;type:varchar(50);not null"`
	Remark *string          `json:"remark" gorm:"column:remark;type:text"`
	State  enums.LeaveState `json:"state" gorm:"column:state;type:int;not null"` //1=Draft, 2=Waiting for Approve, 3=Completed, 4=Rejected

	LeaveForm LeaveForm `json:"-" gorm:"foreignKey:LeaveFormID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" copier:"-"`
}

func (l *LeaveFormHistory) BeforeCreate(tx *gorm.DB) (err error) {
	if userID, ok := tx.Statement.Context.Value("current_user_id").(uuid.UUID); ok {
		l.CreatedBy = &userID
	}
	return nil
}
