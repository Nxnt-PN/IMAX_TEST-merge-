package model

import (
	"imaxx-smart-office-be/internal/response"
	"log"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Notification struct {
	BaseModel `gorm:"embedded"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	Title     string    `json:"title" gorm:"column:title;type:varchar(255);not null"`
	Message   string    `json:"message" gorm:"column:message;type:text;not null"`
	Link      *string   `json:"link" gorm:"column:link;type:text"`
	IsRead    int       `json:"is_read" gorm:"column:is_read;type:int;not null"`

	User User `json:"user" gorm:"foreignKey:UserID"`
}

func (n *Notification) BeforeCreate(tx *gorm.DB) (err error) {
	if userID, ok := tx.Statement.Context.Value("current_user_id").(uuid.UUID); ok {
		n.CreatedBy = &userID
	}
	return nil
}

func (n *Notification) BeforeUpdate(tx *gorm.DB) (err error) {
	if userID, ok := tx.Statement.Context.Value("current_user_id").(uuid.UUID); ok {
		// force in sql stm
		tx.Statement.SetColumn("updated_by", userID)
		// set user id in ram
		n.UpdatedBy = &userID
	}
	return nil
}

func (n *Notification) ToResponse() response.NotificationResponse {
	resp := response.NotificationResponse{
		ID:      *n.ID,
		UserID:  n.UserID,
		Title:   n.Title,
		Message: n.Message,
		Link:    n.Link,
		IsRead:  n.IsRead,
	}

	if strings.Contains(strings.ToLower(n.Message), "submit") {
		resp.Type = "submit"
	} else {
		resp.Type = "approved"
	}

	return resp
}

// work with websocket as a trigger
func (n *Notification) AfterSave(tx *gorm.DB) (err error) {
	// สั่ง pg_notify
	if err := tx.Exec("SELECT pg_notify('leave_updates', 'refresh_all')").Error; err != nil {
		log.Printf("Notify error: %v", err)
		return err
	}
	return nil
}
