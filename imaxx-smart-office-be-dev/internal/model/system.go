package model

import "github.com/google/uuid"

type System struct {
	BaseModel  `gorm:"embedded"`
	Name       string    `json:"name" gorm:"column:name;type:varchar(255);not null"`
	Slug       string    `json:"slug" gorm:"column:slug;type:varchar(255);not null"`
	WorkflowID uuid.UUID `json:"workflow_id" gorm:"type:uuid;not null"`
	Status     int       `json:"status" gorm:"column:status;type:int;not null"` //1=active,0=inactive

	Workflow Workflow `json:"-" gorm:"foreignKey:WorkflowID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" copier:"-"`
}
