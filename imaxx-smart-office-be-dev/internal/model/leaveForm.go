package model

import (
	"imaxx-smart-office-be/enums"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LeaveForm struct {
	BaseModel   `gorm:"embedded"`
	UserID      uuid.UUID        `json:"user_id" gorm:"type:uuid;not null"`
	LeaveType   enums.LeaveType  `json:"leave_type" gorm:"column:leave_type;type:varchar(10);not null;index"` //ลากิจ=absence, ลาพักร้อน=annual, ลาป่วย=sick
	StartDate   time.Time        `json:"start_date" gorm:"column:start_date;type:timestamp;not null"`
	EndDate     time.Time        `json:"end_date" gorm:"column:end_date;type:timestamp;not null"`
	TotalDays   float64          `json:"total_days" gorm:"column:total_days;type:numeric(10,2);not null;default:0"`
	WorkflowID  *uuid.UUID       `json:"workflow_id" gorm:"type:uuid;"`
	RoleID      *uuid.UUID       `json:"role_id" gorm:"type:uuid;"`
	State       enums.LeaveState `json:"state" gorm:"column:state;type:int;not null"` //1=Draft, 2=Waiting for Approve, 3=Completed, 4=Rejected
	StateDetail string           `json:"state_detail" gorm:"column:state_detail;type:varchar(100);not null"`
	Reason      *string          `json:"reason" gorm:"column:reason;type:text"`
	FilePath    *string          `json:"file_path" gorm:"column:file_path;type:varchar(500)"`

	User               User               `json:"user" gorm:"foreignKey:UserID"`
	Workflow           Workflow           `json:"workflow" gorm:"foreignKey:WorkflowID"`
	Role               Role               `json:"role" gorm:"foreignKey:RoleID"`
	LeaveFormHistories []LeaveFormHistory `json:"leave_form_histories" gorm:"foreignKey:LeaveFormID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

const (
	FieldWorkflowID  = "workflow_id"
	FieldRoleID      = "role_id"
	FieldState       = "state"
	FieldStateDetail = "state_detail"
	FieldFilePath    = "file_path"
)

func (l *LeaveForm) BeforeCreate(tx *gorm.DB) (err error) {
	if userID, ok := tx.Statement.Context.Value("current_user_id").(uuid.UUID); ok {
		l.CreatedBy = &userID
	}
	return nil
}

func (l *LeaveForm) BeforeUpdate(tx *gorm.DB) (err error) {
	if userID, ok := tx.Statement.Context.Value("current_user_id").(uuid.UUID); ok {
		// force in sql stm
		tx.Statement.SetColumn("updated_by", userID)
		// set user id in ram
		l.UpdatedBy = &userID
	}
	return nil
}

func (l *LeaveForm) BeforeDelete(tx *gorm.DB) (err error) {
	if userID, ok := tx.Statement.Context.Value("current_user_id").(uuid.UUID); ok {
		// force in sql stm and set it in ram
		tx.Statement.SetColumn("deleted_by", userID)
		l.DeletedBy = &userID
	}
	return nil
}

// get user in leaveform history
func (l *LeaveForm) AfterFind(tx *gorm.DB) error {
	var createdByIDs []uuid.UUID
	for _, h := range l.LeaveFormHistories {
		if h.CreatedBy != nil {
			createdByIDs = append(createdByIDs, *h.CreatedBy)
		}
	}

	if len(createdByIDs) == 0 {
		return nil
	}

	var users []User
	if err := tx.Where("id IN ?", createdByIDs).Find(&users).Error; err != nil {
		return nil
	}

	userMap := make(map[uuid.UUID]*User)
	for i := range users {
		userMap[*users[i].ID] = &users[i]
	}

	for i := range l.LeaveFormHistories {
		if l.LeaveFormHistories[i].CreatedBy != nil {
			l.LeaveFormHistories[i].CreatedUser = userMap[*l.LeaveFormHistories[i].CreatedBy]
		}
	}

	return nil
}

// // work with websocket as a trigger
// func (l *LeaveForm) AfterSave(tx *gorm.DB) (err error) {
// 	// สั่ง pg_notify
// 	query := "SELECT pg_notify('leave_updates', ?)"

// 	// รันภายใต้ Transaction เดียวกัน
// 	if err := tx.Exec(query, l.UserID.String()).Error; err != nil {
// 		log.Println("Failed to notify database:", err)
// 		return err
// 	}
// 	return nil
// }

// func (l *LeaveForm) AfterUpdate(tx *gorm.DB) (err error) {
// 	// สั่ง pg_notify
// 	query := "SELECT pg_notify('leave_updates', ?)"

// 	// รันภายใต้ Transaction เดียวกัน
// 	if err := tx.Exec(query, l.UserID.String()).Error; err != nil {
// 		log.Println("Failed to notify database:", err)
// 		return err
// 	}
// 	return nil
// }
